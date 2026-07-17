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
        add_ons: addOns || [],
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
    await sendEmailJS({
      templateParams: {
        fullName,
        email,
        company: companyName,
        phone: phone || 'N/A',
        inquiryType: `SPONSOR APPLICATION - ${tier}`,
        message: `New sponsor application has been received:

Company Name: ${companyName}
Industry: ${industry || 'N/A'}
Website: ${website || 'N/A'}
Contact Name: ${fullName} (${designation || 'N/A'})
Email: ${email}
Phone: ${phone || 'N/A'}
Sponsorship Tier: ${tier}
Add-Ons Selected: ${addOns && addOns.length > 0 ? addOns.join(', ') : 'None'}
Track Count: ${trackCount}
Special Requirements: ${specialRequirements || 'None'}`,
        // Custom fields just in case the template uses them directly
        companyName,
        industry: industry || 'N/A',
        website: website || 'N/A',
        designation: designation || 'N/A',
        tier,
        addOns: addOns && addOns.length > 0 ? addOns.join(', ') : 'None',
        trackCount,
        specialRequirements: specialRequirements || 'None',
      }
    });

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Error in sponsor application API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
