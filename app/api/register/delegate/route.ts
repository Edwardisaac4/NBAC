import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailJS } from '@/lib/email';
import { PASS_TIERS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, tier: clientTier, currency, specialRequirements, delegateCount } = body;

    if (!name || !email || !clientTier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const foundTier = PASS_TIERS.find(t => t.id === clientTier || t.name === clientTier);
    if (!foundTier) {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
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

    const amount = foundTier.price * normalizedDelegateCount;
    const reference = `NBAC-2027-${foundTier.id.toUpperCase()}-${Math.floor(10000 + Math.random() * 90000)}`;
    const tier = foundTier.name;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        name,
        email,
        company,
        phone,
        tier,
        status: 'pending',
        reference,
        amount,
        currency: currency || 'USD',
        special_requirements: specialRequirements,
        delegate_count: normalizedDelegateCount
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email alert via EmailJS
    // 1. Send alert to admin (automatically defaults to CONTACT_ALERT_EMAIL)
    const adminEmailResult = await sendEmailJS({
      logContext: 'delegate-admin',
      templateParams: {
        name,
        title: `NEW TICKET REGISTRATION — ${tier}`,
        email,
        message: [
          `New delegate registration received:`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || 'N/A'}`,
          `Phone: ${phone || 'N/A'}`,
          `Pass Tier: ${tier}`,
          `Delegates: ${normalizedDelegateCount}`,
          `Reference: ${reference}`,
          `Amount Due: $${amount} ${currency || 'USD'}`,
          `Special Requirements: ${specialRequirements || 'None'}`,
        ].join('\n'),
      }
    });

    if (!adminEmailResult.success) {
      console.warn('[Delegate API] Admin email notification failed:', adminEmailResult.error);
    }

    // 2. Send confirmation copy to registrant's contact email
    const clientEmailResult = await sendEmailJS({
      logContext: 'delegate-client',
      templateParams: {
        name,
        title: `Ticket Registration Received — ${tier}`,
        email,
        to_email: email,
        message: [
          `Thank you for registering for NBAC 2027. We have received your delegate registration:`,
          ``,
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || 'N/A'}`,
          `Phone: ${phone || 'N/A'}`,
          `Pass Tier: ${tier}`,
          `Delegates: ${normalizedDelegateCount}`,
          `Reference: ${reference}`,
          `Amount Due: $${amount} ${currency || 'USD'}`,
          `Special Requirements: ${specialRequirements || 'None'}`,
        ].join('\n'),
      }
    });

    if (!clientEmailResult.success) {
      console.warn('[Delegate API] Client confirmation email failed:', clientEmailResult.error);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Error in delegate registration API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
