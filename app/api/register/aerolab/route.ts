import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailJS } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      teamName,
      leaderName,
      leaderEmail,
      leaderPhone,
      organization,
      trackId,
      trackTitle,
      memberCount,
      memberRoster,
      proposalTitle,
      conceptNote,
      repoOrPortfolioUrl
    } = body;

    // Validate required fields
    if (!teamName || !leaderName || !leaderEmail || !trackId || !proposalTitle || !conceptNote || !repoOrPortfolioUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: teamName, leaderName, leaderEmail, trackId, proposalTitle, conceptNote, and repoOrPortfolioUrl are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Generate reference code
    const trackNum = String(trackId).padStart(2, '0');
    const randomDigits = Math.floor(10000 + Math.random() * 90000);
    const reference = `AEROLAB-2027-TRK${trackNum}-${randomDigits}`;

    const supabase = await createClient();

    // 1. First attempt to insert into 'aerolab_applications' table
    let dbSuccess = false;
    let dbData = null;

    const { data: appData, error: appError } = await supabase
      .from('aerolab_applications')
      .insert({
        reference,
        team_name: teamName,
        leader_name: leaderName,
        leader_email: leaderEmail,
        leader_phone: leaderPhone || null,
        organization: organization || null,
        track_id: Number(trackId),
        track_title: trackTitle || `Track ${trackNum}`,
        member_count: Number(memberCount || 3),
        member_roster: memberRoster || null,
        proposal_title: proposalTitle,
        concept_note: conceptNote,
        repo_portfolio_url: repoOrPortfolioUrl || null,
        status: 'pending'
      })
      .select()
      .single();

    if (!appError && appData) {
      dbSuccess = true;
      dbData = appData;
    } else {
      console.warn('[AeroLab API] aerolab_applications insert failed or table missing, falling back to reservations:', appError?.message);
      
      // Fallback insert into 'reservations' table so applications are never lost
      const { data: resData, error: resError } = await supabase
        .from('reservations')
        .insert({
          name: leaderName,
          email: leaderEmail,
          company: `${teamName} (${organization || 'Individual Entry'})`,
          phone: leaderPhone || null,
          tier: `AeroLab Hackathon - Track ${trackNum}: ${trackTitle || 'Track Entry'}`,
          status: 'pending',
          reference,
          amount: 0,
          currency: 'NGN',
          special_requirements: `PROPOSAL: ${proposalTitle}\n\nMEMBERS (${memberCount}): ${memberRoster || 'N/A'}\n\nCONCEPT:\n${conceptNote}${repoOrPortfolioUrl ? `\n\nREPO/DEMO: ${repoOrPortfolioUrl}` : ''}`
        })
        .select()
        .single();

      if (resError) {
        console.error('[AeroLab API] Fallback to reservations failed:', resError.message);
        return NextResponse.json({ error: 'Unable to process your application at this time.' }, { status: 500 });
      }

      dbSuccess = true;
      dbData = resData;
    }

    // 2. Send Email Alerts via EmailJS (Synced to contact email pipeline)
    // Admin alert email
    const adminEmailResult = await sendEmailJS({
      logContext: 'aerolab-admin',
      templateParams: {
        name: leaderName,
        title: `NEW AEROLAB APPLICATION: Track ${trackNum} [${reference}]`,
        email: leaderEmail,
        message: [
          `New AeroLab Innovation Challenge application received:`,
          ``,
          `Reference ID: ${reference}`,
          `Team Name: ${teamName}`,
          `Team Leader: ${leaderName} (${leaderEmail})`,
          `Phone: ${leaderPhone || 'N/A'}`,
          `Organization/University: ${organization || 'N/A'}`,
          `Track: Track ${trackNum} — ${trackTitle || 'Track Challenge'}`,
          `Team Size: ${memberCount || 3} Members`,
          `Team Roster: ${memberRoster || 'N/A'}`,
          ``,
          `PROPOSAL TITLE: ${proposalTitle}`,
          `CONCEPT NOTE:\n${conceptNote}`,
          repoOrPortfolioUrl ? `REPO / PORTFOLIO LINK: ${repoOrPortfolioUrl}` : ''
        ].filter(Boolean).join('\n'),
      }
    });

    if (!adminEmailResult.success) {
      console.warn('[AeroLab API] Admin email notification failed:', adminEmailResult.error);
    }

    // Client confirmation email
    const clientEmailResult = await sendEmailJS({
      logContext: 'aerolab-client',
      templateParams: {
        name: leaderName,
        title: `AeroLab 2027 Application Received [${reference}]`,
        email: leaderEmail,
        to_email: leaderEmail,
        message: [
          `Thank you for applying to the AeroLab Innovation Challenge at NBAC 2027!`,
          ``,
          `We have successfully received your team application:`,
          `Reference ID: ${reference}`,
          `Team Name: ${teamName}`,
          `Track: Track ${trackNum} — ${trackTitle || 'Track Challenge'}`,
          `Proposal Title: ${proposalTitle}`,
          ``,
          `NEXT STEPS:`,
          `1. Your application is now queued for evaluation by the NBAC Technical Steering Committee.`,
          `2. Admitted cohort teams (up to 30 teams across all tracks) will be announced and contacted via email with briefing packs and mentor pairings.`,
          `3. Keep an eye on your inbox for further updates.`,
          ``,
          `Warm regards,`,
          `The NBAC 2027 AeroLab Committee`
        ].join('\n'),
      }
    });

    if (!clientEmailResult.success) {
      console.warn('[AeroLab API] Client confirmation email failed:', clientEmailResult.error);
    }

    return NextResponse.json({
      success: true,
      reference,
      data: dbData
    }, { status: 200 });

  } catch (err: unknown) {
    console.error('Unexpected error in AeroLab registration API:', err);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
