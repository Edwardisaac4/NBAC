import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmailJS } from '@/lib/email';
import { sendEmail } from '@/lib/resend';
import { registrationReceivedEmail } from '@/lib/payment-emails';
import { payUrl } from '@/lib/site';
import {
  PAYMENT_WINDOW_DAYS,
  fetchTiersServer,
  formatUsd,
  generatePayToken,
  generateReference,
  quotePrice,
  recordRedemption,
  resolveTier,
} from '@/lib/pricing';

/**
 * Delegate registration.
 *
 * Pricing is server-authoritative: the client posts a tier, a quantity and
 * optionally a coupon, and nothing else about money is trusted. `amount` sent
 * by the browser is ignored entirely.
 *
 * Price is locked here rather than at payment time. EAN finance owns the
 * Paystack account and we hold no API keys, so we cannot see when money
 * actually lands — a coupon required to be valid on the day of payment would
 * be unenforceable. The delegate instead gets a payment window
 * (PAYMENT_WINDOW_DAYS) during which the locked figure stands.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company,
      phone,
      tier: clientTier,
      specialRequirements,
      delegateCount,
      discountCode,
    } = body;

    if (!name || !email || !clientTier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Same format check as /api/interest. A malformed address means the
    // payment link never arrives, leaving behind an unpayable reservation and
    // a discount ledger row keyed to an address we cannot reach.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(email))) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // Validate delegateCount — must be an integer between 1 and 10
    const normalizedDelegateCount = Number(delegateCount ?? 1);
    if (
      !Number.isInteger(normalizedDelegateCount) ||
      normalizedDelegateCount < 1 ||
      normalizedDelegateCount > 10
    ) {
      return NextResponse.json(
        { error: 'delegateCount must be an integer between 1 and 10' },
        { status: 400 }
      );
    }

    // Service role: reservations must be written with the payment columns and
    // the discount ledger, neither of which is reachable by `anon`.
    const supabase = createAdminClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Registration service is unavailable. Please try again shortly.' },
        { status: 500 }
      );
    }

    const tiers = await fetchTiersServer(supabase);
    const foundTier = resolveTier(String(clientTier), tiers);
    if (!foundTier) {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
    }

    // Re-prices from scratch against the live discount_codes row. A coupon
    // that has expired since the form was loaded silently degrades to standard
    // pricing rather than failing the registration.
    const quote = await quotePrice({
      supabase,
      tier: foundTier,
      quantity: normalizedDelegateCount,
      code: typeof discountCode === 'string' && discountCode.trim() ? discountCode : null,
      email: String(email),
    });

    const reference = generateReference(foundTier.id);
    const payToken = generatePayToken();
    const now = new Date();
    const deadline = new Date(now.getTime() + PAYMENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    // Currency comes from the tier quote only. A client-supplied `currency`
    // field is ignored (and no longer read off the body): letting the browser
    // pick it would let a reservation be persisted in a currency the tier is
    // not priced in, which then misreconciles against the USD figures on
    // EAN's Paystack terminal.
    const resolvedCurrency = quote.currency;

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        name,
        email,
        company,
        phone,
        tier: quote.tierName,
        status: 'pending',
        reference,
        // `amount` is retained as the net payable for backward compatibility
        // with /admin/reservations and the existing notification trigger.
        amount: quote.netAmount,
        currency: resolvedCurrency,
        special_requirements: specialRequirements,
        delegate_count: normalizedDelegateCount,
        pay_token: payToken,
        gross_amount: quote.grossAmount,
        discount_code: quote.discountCode,
        discount_amount: quote.discountAmount,
        expected_total: quote.netAmount,
        payment_status: 'pending',
        price_locked_at: now.toISOString(),
        payment_deadline: deadline.toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Append-only ledger row. Best-effort: a failure here must not undo a
    // registration that is already persisted.
    await recordRedemption({
      supabase,
      quote,
      reservationId: data.id,
      reservationReference: reference,
      email: String(email),
    });

    const delegatePayUrl = payUrl(payToken);

    // ── Delegate-facing email (Resend) ──────────────────────────────────
    // Carries the exact figure and the link to our own payment page. Failure
    // is logged, never fatal — admin can re-send the link.
    const delegateEmail = registrationReceivedEmail({
      name,
      reference,
      tierName: quote.tierName,
      delegateCount: normalizedDelegateCount,
      grossAmount: quote.grossAmount,
      discountAmount: quote.discountAmount,
      discountLabel: quote.discountLabel,
      expectedTotal: quote.netAmount,
      currency: resolvedCurrency,
      payUrl: delegatePayUrl,
      paymentDeadline: deadline,
      specialRequirements,
    });

    const delegateEmailResult = await sendEmail({
      to: String(email),
      subject: delegateEmail.subject,
      html: delegateEmail.html,
      text: delegateEmail.text,
      idempotencyKey: `registration-${reference}`,
      tags: [{ name: 'type', value: 'registration_received' }],
      logContext: 'delegate-registration',
    });

    if (!delegateEmailResult.success) {
      console.warn(
        '[Delegate API] Delegate payment email failed:',
        delegateEmailResult.error
      );
    }

    // ── Internal alert (EmailJS, unchanged transport) ───────────────────
    const adminEmailResult = await sendEmailJS({
      logContext: 'delegate-admin',
      templateParams: {
        name,
        title: `NEW TICKET REGISTRATION — ${quote.tierName}${
          quote.discountCode ? ` [${quote.discountCode}]` : ''
        }`,
        email,
        message: [
          `New delegate registration received:`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || 'N/A'}`,
          `Phone: ${phone || 'N/A'}`,
          `Pass Tier: ${quote.tierName}`,
          `Delegates: ${normalizedDelegateCount}`,
          `Reference: ${reference}`,
          `Gross Amount: ${formatUsd(quote.grossAmount)} ${resolvedCurrency}`,
          ...(quote.discountCode
            ? [
                `Applied Discount: ${quote.discountLabel} (${quote.discountCode})`,
                `Discount Value: -${formatUsd(quote.discountAmount)}`,
              ]
            : [`Applied Discount: none`]),
          `Amount Due: ${formatUsd(quote.netAmount)} ${resolvedCurrency}`,
          `Payment Page: ${delegatePayUrl}`,
          `Price Held Until: ${deadline.toISOString().slice(0, 10)}`,
          `Special Requirements: ${specialRequirements || 'None'}`,
        ].join('\n'),
      },
    });

    if (!adminEmailResult.success) {
      console.warn('[Delegate API] Admin email notification failed:', adminEmailResult.error);
    }

    return NextResponse.json({
      success: true,
      data,
      // The form redirects here so a click-through is recorded before the
      // delegate reaches Paystack.
      payUrl: delegatePayUrl,
      payToken,
      reference,
      pricing: {
        grossAmount: quote.grossAmount,
        discountCode: quote.discountCode,
        discountLabel: quote.discountLabel,
        discountAmount: quote.discountAmount,
        netAmount: quote.netAmount,
        currency: resolvedCurrency,
        codeStatus: quote.codeStatus,
        codeMessage: quote.codeMessage,
      },
    });
  } catch (err: unknown) {
    console.error('Error in delegate registration API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
