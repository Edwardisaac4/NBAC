import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/resend'
import { paymentClaimReceivedEmail } from '@/lib/payment-emails'
import { toMoney } from '@/lib/pricing'

/**
 * Records a delegate's self-reported payment as a CLAIM.
 *
 * Writes `payments.status = 'claimed'` and moves the reservation to 'claimed'.
 * It deliberately never reaches 'verified': we hold no Paystack API keys, so
 * nothing here proves money arrived. Verification is a human step against
 * EAN's records, and passes are issued only on that.
 *
 * The amount box on EAN's terminal is free-entry, so a claim of "I paid $1"
 * is entirely possible. Recording the claimed figure separately from
 * expected_total is what lets reconciliation spot the difference.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token, providerReference, payerEmail, amountPaid, note } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Missing payment token.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { error: 'Payment service is unavailable. Please try again shortly.' },
        { status: 500 }
      )
    }

    const { data: reservation, error: lookupError } = await supabase
      .from('reservations')
      .select(
        'id, name, email, reference, currency, expected_total, amount, payment_status'
      )
      .eq('pay_token', token)
      .maybeSingle<{
        id: string
        name: string
        email: string
        reference: string
        currency: string
        expected_total: number | null
        amount: number
        payment_status: string
      }>()

    if (lookupError) {
      console.error('[pay/confirm] lookup failed:', lookupError.message)
      return NextResponse.json({ error: 'Could not load your booking.' }, { status: 500 })
    }
    if (!reservation) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    // Idempotent by design: a delegate double-submitting, or returning to the
    // page later, must not create a second claim row for the same money.
    //
    // The guard is the conditional UPDATE itself rather than a read of
    // payment_status: reading first left a window in which two concurrent
    // submits both saw 'pending' and both inserted a claim. Whichever request
    // flips the row wins the right to insert; the loser affects zero rows.
    const claimedAt = new Date().toISOString()
    const { data: claimedRows, error: claimError } = await supabase
      .from('reservations')
      .update({ payment_status: 'claimed', claimed_at: claimedAt })
      .eq('id', reservation.id)
      .not('payment_status', 'in', '("claimed","verified","waived")')
      .select('id')

    if (claimError) {
      console.error('[pay/confirm] claim update failed:', claimError.message)
      return NextResponse.json(
        { error: 'We could not record your confirmation. Please try again.' },
        { status: 500 }
      )
    }

    if (!claimedRows || claimedRows.length === 0) {
      return NextResponse.json({ success: true, alreadyRecorded: true })
    }

    const expected = Number(reservation.expected_total ?? reservation.amount)

    // Fall back to the expected figure when the delegate leaves it blank or
    // types something unparseable — never record NaN or 0 as an amount.
    //
    // The box is free entry and figures arrive in mixed conventions:
    // "$1,234.56", "1500", "237,50". A comma is the decimal mark only when it
    // is the last separator and one or two digits follow it; otherwise it is
    // thousands grouping and is dropped. Stripping every comma outright read
    // "237,50" as 23750, and treating every comma as a decimal point read
    // "1,500" as 1.5 — both record a claim orders of magnitude out.
    const rawAmount = String(amountPaid ?? '').replace(/[^0-9.,]/g, '')
    const lastComma = rawAmount.lastIndexOf(',')
    const commaIsDecimal =
      lastComma > rawAmount.lastIndexOf('.') && /^\d{1,2}$/.test(rawAmount.slice(lastComma + 1))
    const normalizedAmount = commaIsDecimal
      ? rawAmount.replace(/\./g, '').replace(',', '.')
      : rawAmount.replace(/,/g, '')

    // Anything still holding more than one decimal point is too ambiguous to
    // guess at, so it falls through to the expected figure below.
    const parsedAmount =
      (normalizedAmount.match(/\./g) || []).length > 1 ? NaN : Number(normalizedAmount)
    const claimedAmount =
      Number.isFinite(parsedAmount) && parsedAmount > 0 ? toMoney(parsedAmount) : expected

    const trimmedProviderRef =
      typeof providerReference === 'string' && providerReference.trim()
        ? providerReference.trim()
        : null

    const { error: insertError } = await supabase.from('payments').insert({
      reservation_id: reservation.id,
      reservation_reference: reservation.reference,
      channel: 'paystack_link',
      provider_reference: trimmedProviderRef,
      payer_email:
        typeof payerEmail === 'string' && payerEmail.trim()
          ? payerEmail.trim()
          : reservation.email,
      payer_name: reservation.name,
      amount: claimedAmount,
      currency: reservation.currency || 'USD',
      status: 'claimed',
      paid_at: new Date().toISOString(),
      note: typeof note === 'string' && note.trim() ? note.trim() : null,
      source: 'delegate_self_report',
    })

    if (insertError) {
      // The reservation is already flipped to 'claimed' but carries no claim
      // row, and the conditional update above would now refuse a retry. Hand
      // the status back so the delegate can submit again.
      const { error: releaseError } = await supabase
        .from('reservations')
        .update({ payment_status: reservation.payment_status, claimed_at: null })
        .eq('id', reservation.id)
        .eq('payment_status', 'claimed')

      if (releaseError) {
        console.error('[pay/confirm] claim release failed:', releaseError.message)
      }

      // payments_provider_reference_key is a unique index. A duplicate means
      // this Paystack reference is already recorded — most likely the delegate
      // pasting the same receipt against a second booking, or a double submit.
      if (insertError.code === '23505') {
        return NextResponse.json(
          {
            error:
              'That receipt reference is already recorded against a booking. If you believe this is wrong, reply to your registration email and our delegate desk will check it.',
          },
          { status: 409 }
        )
      }
      console.error('[pay/confirm] payment insert failed:', insertError.message)
      return NextResponse.json(
        { error: 'We could not record your confirmation. Please try again.' },
        { status: 500 }
      )
    }

    // Acknowledgement only. The template is written not to say "confirmed".
    const ack = paymentClaimReceivedEmail({
      name: reservation.name,
      reference: reservation.reference,
      amountReported: claimedAmount,
      providerReference: trimmedProviderRef,
    })

    const ackResult = await sendEmail({
      to: reservation.email,
      subject: ack.subject,
      html: ack.html,
      text: ack.text,
      idempotencyKey: `claim-${reservation.reference}`,
      tags: [{ name: 'type', value: 'payment_claim' }],
      logContext: 'payment-claim',
    })

    if (!ackResult.success) {
      console.warn('[pay/confirm] acknowledgement email failed:', ackResult.error)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[pay/confirm] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
