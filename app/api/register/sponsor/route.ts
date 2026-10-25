import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/resend';
import { SENDERS, sendTeamAlert, sponsorApplicationReceivedEmail } from '@/lib/form-emails';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { companyName, industry, website, fullName, designation, email, phone, tier, addOns, trackCount, specialRequirements } = body;

    if (!companyName || !fullName || !email || !tier) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Normalize addOns to a safe array — reject non-array truthy values
    if (
      addOns != null &&
      (!Array.isArray(addOns) || !addOns.every(item => typeof item === 'string'))
    ) {
      return NextResponse.json(
        { error: 'Invalid input: addOns must be an array of strings' },
        { status: 400 }
      );
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

    // --- EMAILS (Resend) ---
    // There is no admin page for sponsor applications, so this alert to
    // CONTACT_ALERT_EMAIL is how the team learns of each one.
    const confirmation = sponsorApplicationReceivedEmail({
      name: String(fullName),
      company: String(companyName),
      tierName: String(tier),
      addOns: safeAddOns,
    });

    const [adminEmailResult, clientEmailResult] = await Promise.all([
      sendTeamAlert({
        subject: `New sponsor application (${tier}) — ${companyName}`,
        heading: 'New sponsorship application',
        fields: [
          ['Company', companyName],
          ['Industry', industry],
          ['Website', website],
          ['Contact', designation ? `${fullName} (${designation})` : fullName],
          ['Email', email],
          ['Phone', phone],
          ['Package', tier],
          ['Add-ons', addOnsText],
          ['Track count', trackCount || 1],
        ],
        notes: [['Special requirements', specialRequirements]],
        replyTo: String(email),
        tag: 'sponsor_alert',
        logContext: 'sponsor-admin',
      }),
      sendEmail({
        to: String(email),
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        fromName: SENDERS.sponsor,
        tags: [{ name: 'type', value: 'sponsor_received' }],
        logContext: 'sponsor-client',
      }),
    ]);

    if (!adminEmailResult.success) {
      console.warn('[Sponsor API] Team alert failed:', adminEmailResult.error);
    }

    if (!clientEmailResult.success) {
      console.warn('[Sponsor API] Client confirmation email failed:', clientEmailResult.error);
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Error in sponsor application API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
