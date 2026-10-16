import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendEmailJS } from '@/lib/email';
import { sendEmail } from '@/lib/resend';
import { pressAccreditationReceivedEmail } from '@/lib/payment-emails';
import { MEDIA_TYPES, mediaTypeLabel } from '@/lib/press';
import { absoluteUrl } from '@/lib/site';
import { isValidHttpUrl } from '@/lib/utils';
import crypto from 'crypto';

// In-memory rate limiting: max 5 requests per 15 minutes per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAP_MAX = 1000;

function isRateLimited(ip: string, limit = 5, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();

  // Prune expired entries when map exceeds max size
  if (rateLimitMap.size >= RATE_LIMIT_MAP_MAX) {
    for (const [key, record] of rateLimitMap) {
      if (now > record.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

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

function generateReference(): string {
  return `NBAC27-PRESS-${crypto.randomInt(100000, 999999)}`;
}

const MEDIA_TYPE_VALUES: readonly string[] = MEDIA_TYPES.map((t) => t.value);

// Max lengths per field; anything optional may also be empty.
const LIMITS = {
  fullName: 100,
  email: 254,
  phone: 30,
  jobTitle: 100,
  outlet: 200,
  country: 100,
  outletWebsite: 2048,
  coveragePlan: 2000,
  additionalCrew: 1000,
} as const;

const FIELD_NAMES: Record<keyof typeof LIMITS, string> = {
  fullName: 'Full name',
  email: 'Email',
  phone: 'Phone number',
  jobTitle: 'Job title',
  outlet: 'Media outlet',
  country: 'Country',
  outletWebsite: 'Outlet website',
  coveragePlan: 'Coverage plan',
  additionalCrew: 'Additional crew',
};

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown-ip';
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Normalise every text field to a trimmed string up front, so the checks
    // below and the insert all see the same value.
    const field = (key: keyof typeof LIMITS) =>
      typeof body[key] === 'string' ? body[key].trim() : '';

    const fullName = field('fullName');
    const email = field('email');
    const phone = field('phone');
    const jobTitle = field('jobTitle');
    const outlet = field('outlet');
    const country = field('country');
    const outletWebsite = field('outletWebsite');
    const coveragePlan = field('coveragePlan');
    const additionalCrew = field('additionalCrew');
    const mediaType = typeof body.mediaType === 'string' ? body.mediaType : '';
    const consent = body.consent === true;

    if (!fullName || !email || !phone || !jobTitle || !outlet || !mediaType) {
      return NextResponse.json(
        { error: 'Missing required fields: full name, email, phone, job title, media outlet and media type are required.' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { error: 'Please confirm the declaration before submitting.' },
        { status: 400 }
      );
    }

    if (!MEDIA_TYPE_VALUES.includes(mediaType)) {
      return NextResponse.json({ error: 'Invalid media type.' }, { status: 400 });
    }

    const values = {
      fullName, email, phone, jobTitle, outlet, country,
      outletWebsite, coveragePlan, additionalCrew,
    };
    for (const key of Object.keys(LIMITS) as (keyof typeof LIMITS)[]) {
      if (values[key].length > LIMITS[key]) {
        return NextResponse.json(
          { error: `${FIELD_NAMES[key]} is too long (max ${LIMITS[key]} chars).` },
          { status: 400 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address format.' }, { status: 400 });
    }

    if (outletWebsite && !isValidHttpUrl(outletWebsite)) {
      return NextResponse.json(
        { error: 'Outlet website must be a valid http or https URL.' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    let reference = '';
    let saved = false;

    // Retry on the rare reference collision (23505) — nothing else is retried.
    for (let attempt = 0; attempt < 3; attempt++) {
      reference = generateReference();

      // No .select() after insert: anon holds INSERT only on this table.
      const { error } = await supabase.from('press_accreditations').insert({
        reference,
        full_name: fullName,
        email,
        phone,
        job_title: jobTitle,
        outlet,
        media_type: mediaType,
        country: country || null,
        outlet_website: outletWebsite || null,
        coverage_plan: coveragePlan || null,
        additional_crew: additionalCrew || null,
        consent,
        status: 'pending',
      });

      if (!error) {
        saved = true;
        break;
      }

      if (error.code === '23505') continue;

      // No fallback table: a missing press_accreditations means migration 009
      // has not been applied, and that must surface rather than hide in
      // `contacts` the way early bird leads once did.
      console.error('[Press API] press_accreditations insert error:', error);
      return NextResponse.json(
        { error: 'We could not save your request. Please try again or contact the NBAC team.' },
        { status: 500 }
      );
    }

    if (!saved) {
      return NextResponse.json(
        { error: 'Could not generate a unique accreditation reference. Please try again.' },
        { status: 500 }
      );
    }

    const typeLabel = mediaTypeLabel(mediaType);

    // Internal alert to the marketing inbox (CONTACT_ALERT_EMAIL) via EmailJS.
    const adminEmailPromise = sendEmailJS({
      logContext: 'press-admin',
      templateParams: {
        name: fullName,
        title: `NEW MEDIA ACCREDITATION: ${outlet} [${reference}]`,
        email,
        message: [
          `New media accreditation request received:`,
          ``,
          `Reference: ${reference}`,
          `Name: ${fullName}`,
          `Job Title: ${jobTitle}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Media Outlet: ${outlet}`,
          `Media Type: ${typeLabel}`,
          `Country: ${country || 'N/A'}`,
          `Outlet Website: ${outletWebsite || 'N/A'}`,
          ``,
          `COVERAGE PLAN:\n${coveragePlan || 'N/A'}`,
          ``,
          `ADDITIONAL CREW:\n${additionalCrew || 'None'}`,
          ``,
          `Review in admin: ${absoluteUrl('/admin/press')}`,
        ].join('\n'),
      },
    });

    // Journalist-facing confirmation via Resend.
    const confirmation = pressAccreditationReceivedEmail({
      name: fullName,
      reference,
      outlet,
      mediaTypeLabel: typeLabel,
    });
    const clientEmailPromise = sendEmail({
      to: email,
      subject: confirmation.subject,
      html: confirmation.html,
      text: confirmation.text,
      idempotencyKey: `press-received-${reference}`,
      tags: [{ name: 'type', value: 'press_accreditation_received' }],
      logContext: 'press-client',
    });

    const [adminResult, clientResult] = await Promise.allSettled([
      adminEmailPromise,
      clientEmailPromise,
    ]);

    if (adminResult.status === 'rejected' || !adminResult.value.success) {
      console.warn('[Press API] Admin alert email failed:',
        adminResult.status === 'rejected' ? adminResult.reason : adminResult.value.error);
    }

    const confirmationEmailed =
      clientResult.status === 'fulfilled' && clientResult.value.success;
    if (!confirmationEmailed) {
      console.warn('[Press API] Confirmation email failed:',
        clientResult.status === 'rejected' ? clientResult.reason : clientResult.value.error);
    }

    return NextResponse.json({
      success: true,
      reference,
      // Lets the success screen avoid promising an email that never went out.
      confirmationEmailed,
    });
  } catch (err: unknown) {
    console.error('Unexpected error in press accreditation API:', err);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
