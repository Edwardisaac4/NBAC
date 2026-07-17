import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailJS } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, industry, website, fullName, designation, email, phone, tier, addOns, trackCount, specialRequirements } = body;

    if (!companyName || !fullName || !email || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize addOns to a safe array — reject non-array truthy values
    if (addOns != null && !Array.isArray(addOns)) {
      return NextResponse.json({ error: 'Invalid input: addOns must be an array' }, { status: 400 });
    }
    const safeAddOns: string[] = Array.isArray(addOns) ? addOns : [];
    const addOnsText = safeAddOns.length > 0 ? safeAddOns.join(', ') : 'None';

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('sponsors')
      .insert({
        company_name: companyName,
        industry: industry || 'N/A',
        website: website || 'N/A',
        full_name: fullName,
        designation: designation || 'N/A',
        email,
        phone,
        tier,
        add_ons: safeAddOns,
        track_count: trackCount || 1,
        special_requirements: specialRequirements
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email alert via EmailJS
    const emailResult = await sendEmailJS({
      logContext: 'sponsor',
      templateParams: {
        name: fullName,
        title: `SPONSOR APPLICATION — ${tier}`,
        email,
        message: [
          `New sponsor application received:`,
          ``,
          `Company: ${companyName}`,
          `Industry: ${industry || 'N/A'}`,
          `Website: ${website || 'N/A'}`,
          `Contact: ${fullName} (${designation || 'N/A'})`,
          `Email: ${email}`,
          `Phone: ${phone || 'N/A'}`,
          `Sponsorship Tier: ${tier}`,
          `Add-Ons: ${addOnsText}`,
          `Track Count: ${trackCount || 1}`,
          `Special Requirements: ${specialRequirements || 'None'}`,
        ].join('\n'),
      }
    });

    if (!emailResult.success) {
      console.warn('[Sponsor API] Email notification failed but DB write succeeded:', emailResult.error);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Error in sponsor application API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
