import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailJS } from '@/lib/email';
import { isValidHttpUrl } from '@/lib/utils';
import crypto from 'crypto';

// In-memory rate limiting: max 5 requests per 15 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string, limit = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }
  if (record.count >= limit) {
    return true;
  }
  record.count += 1;
  return false;
}

function generateReference(trackNum: string): string {
  const randomVal = crypto.randomInt(100000, 999999);
  return `AEROLAB-2027-TRK${trackNum}-${randomVal}`;
}

export async function POST(request: Request) {
  try {
    // Rate Limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

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

    // Input type & bounds validation
    const parsedTrackId = Number(trackId);
    if (!Number.isFinite(parsedTrackId) || parsedTrackId < 1 || parsedTrackId > 5) {
      return NextResponse.json(
        { error: 'Invalid trackId. Must be an integer between 1 and 5.' },
        { status: 400 }
      );
    }

    const parsedMemberCount = Number(memberCount || 3);
    if (!Number.isFinite(parsedMemberCount) || parsedMemberCount < 1 || parsedMemberCount > 10) {
      return NextResponse.json(
        { error: 'Invalid memberCount. Must be an integer between 1 and 10.' },
        { status: 400 }
      );
    }

    if (!isValidHttpUrl(repoOrPortfolioUrl)) {
      return NextResponse.json(
        { error: 'Invalid repoOrPortfolioUrl. Must be a valid http or https URL.' },
        { status: 400 }
      );
    }

    // Max length checks
    if (String(teamName).length > 100 || String(leaderName).length > 100) {
      return NextResponse.json({ error: 'Team name or Leader name is too long (max 100 chars).' }, { status: 400 });
    }
    if (String(proposalTitle).length > 200) {
      return NextResponse.json({ error: 'Proposal title is too long (max 200 chars).' }, { status: 400 });
    }
    if (String(conceptNote).length > 5000) {
      return NextResponse.json({ error: 'Concept note is too long (max 5000 chars).' }, { status: 400 });
    }
    if (memberRoster && String(memberRoster).length > 2000) {
      return NextResponse.json({ error: 'Member roster is too long (max 2000 chars).' }, { status: 400 });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leaderEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    const trackNum = String(parsedTrackId).padStart(2, '0');
    const supabase = await createClient();

    let reference = generateReference(trackNum);
    let dbSuccess = false;
    let dbData: Record<string, unknown> | null = null;

    // Try insertion with up to 3 retries on reference unique violation (23505)
    for (let attempt = 0; attempt < 3; attempt++) {
      if (attempt > 0) {
        reference = generateReference(trackNum);
      }

      // Do NOT use .select().single() when inserting as anon to comply with anon INSERT-only RLS
      const { error: appError } = await supabase
        .from('aerolab_applications')
        .insert({
          reference,
          team_name: String(teamName).trim(),
          leader_name: String(leaderName).trim(),
          leader_email: String(leaderEmail).trim(),
          leader_phone: leaderPhone ? String(leaderPhone).trim() : null,
          organization: organization ? String(organization).trim() : null,
          track_id: parsedTrackId,
          track_title: trackTitle ? String(trackTitle).trim() : `Track ${trackNum}`,
          member_count: parsedMemberCount,
          member_roster: memberRoster ? String(memberRoster).trim() : null,
          proposal_title: String(proposalTitle).trim(),
          concept_note: String(conceptNote).trim(),
          repo_portfolio_url: String(repoOrPortfolioUrl).trim(),
          status: 'pending'
        });

      if (!appError) {
        dbSuccess = true;
        dbData = { reference, team_name: teamName };
        break;
      }

      // Check if reference unique violation (23505) -> retry with new reference
      if (appError.code === '23505' || appError.message.includes('unique constraint')) {
        continue;
      }

      // Check if relation missing error (PGRST205 or 42P01) -> Fallback to reservations
      if (appError.code === 'PGRST205' || appError.code === '42P01' || appError.message.includes('relation') || appError.message.includes('does not exist')) {
        console.error('[AeroLab API] ALERT: aerolab_applications table missing! Executing fallback to reservations table:', appError.message);
        
        const { error: resError } = await supabase
          .from('reservations')
          .insert({
            name: String(leaderName).trim(),
            email: String(leaderEmail).trim(),
            company: `${teamName} (${organization || 'Individual Entry'})`,
            phone: leaderPhone ? String(leaderPhone).trim() : null,
            tier: `AeroLab Hackathon - Track ${trackNum}: ${trackTitle || 'Track Entry'}`,
            status: 'pending',
            reference,
            amount: 0,
            currency: 'NGN',
            special_requirements: `PROPOSAL: ${proposalTitle}\n\nMEMBERS (${parsedMemberCount}): ${memberRoster || 'N/A'}\n\nCONCEPT:\n${conceptNote}${repoOrPortfolioUrl ? `\n\nREPO/DEMO: ${repoOrPortfolioUrl}` : ''}`
          });

        if (resError) {
          console.error('[AeroLab API] Fallback to reservations failed:', resError.message);
          return NextResponse.json({ error: 'Unable to process your application at this time.' }, { status: 500 });
        }

        dbSuccess = true;
        dbData = { reference, team_name: teamName };
        break;
      }

      // For any other error, log error and return 500 failure without fallback
      console.error('[AeroLab API] aerolab_applications insert error:', appError);
      return NextResponse.json({ error: 'Failed to record application.' }, { status: 500 });
    }

    if (!dbSuccess) {
      return NextResponse.json({ error: 'Could not generate a unique application reference.' }, { status: 500 });
    }

    // 2. Concurrent Email Alerts via EmailJS with 5-second bounded timeout
    const adminEmailPromise = sendEmailJS({
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
          `Team Size: ${parsedMemberCount} Members`,
          `Team Roster: ${memberRoster || 'N/A'}`,
          ``,
          `PROPOSAL TITLE: ${proposalTitle}`,
          `CONCEPT NOTE:\n${conceptNote}`,
          repoOrPortfolioUrl ? `REPO / PORTFOLIO LINK: ${repoOrPortfolioUrl}` : ''
        ].filter(Boolean).join('\n'),
      }
    }).then((res) => {
      if (!res.success) console.warn('[AeroLab API] Admin email failed:', res.error);
      return res;
    });

    const clientEmailPromise = sendEmailJS({
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
    }).then((res) => {
      if (!res.success) console.warn('[AeroLab API] Client confirmation email failed:', res.error);
      return res;
    });

    // Run emails concurrently with a 5-second max timeout so response is never held up
    const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 5000));
    await Promise.race([Promise.allSettled([adminEmailPromise, clientEmailPromise]), timeoutPromise]);

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
