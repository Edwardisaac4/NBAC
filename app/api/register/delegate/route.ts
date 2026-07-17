import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailJS } from '@/lib/email';
import { PASS_TIERS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, tier: clientTier, reference: clientReference, amount: clientAmount, currency, specialRequirements, delegateCount } = body;

    if (!name || !email || !clientTier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const foundTier = PASS_TIERS.find(t => t.id === clientTier || t.name === clientTier);
    if (!foundTier) {
      return NextResponse.json({ error: 'Invalid tier specified' }, { status: 400 });
    }

    const amount = foundTier.price * (delegateCount || 1);
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
        delegate_count: delegateCount || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email alert via EmailJS
    await sendEmailJS({
      templateParams: {
        fullName: name,
        email,
        company: company || 'N/A',
        phone: phone || 'N/A',
        inquiryType: `TICKET REGISTRATION - ${tier}`,
        message: `New ticket registration has been received:

Name: ${name}
Email: ${email}
Company: ${company || 'N/A'}
Phone: ${phone || 'N/A'}
Pass Tier: ${tier}
Seat Count: ${delegateCount}
Order Reference: ${reference}
Amount Due: $${amount} ${currency || 'USD'}
Special Requirements: ${specialRequirements || 'None'}`,
        // Custom fields just in case the template uses them directly
        name,
        tier,
        delegateCount,
        reference,
        amount,
        currency: currency || 'USD',
        specialRequirements: specialRequirements || 'None',
      }
    });

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Error in delegate registration API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
