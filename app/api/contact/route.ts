import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/resend';
import { SENDERS, contactReceivedEmail, sendTeamAlert } from '@/lib/form-emails';

const ALLOWED_INQUIRY_TYPES = ['general', 'aerolabs', 'sponsorship', 'registration', 'aircraft_display', 'others'] as const;

// Same wording as the topic dropdown in components/sections/contact-form-ui.tsx
const INQUIRY_LABELS: Record<(typeof ALLOWED_INQUIRY_TYPES)[number], string> = {
  general: 'General Inquiry',
  aerolabs: 'AeroLabs',
  sponsorship: 'Sponsorships',
  registration: 'Event Registration',
  aircraft_display: 'Aircraft Display',
  others: 'Others',
};

// --- RATE LIMITING ---
const ipRequestHistory = new Map<string, number[]>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 5;   // 5 requests per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];

  // Filter out timestamps outside the current window
  const activeTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW);

  if (activeTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  activeTimestamps.push(now);
  ipRequestHistory.set(ip, activeTimestamps);
  return false;
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, company, phone, inquiryType, message } = body;

    // Validate required fields
    if (!fullName || !email || !inquiryType || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email, inquiryType, and message are required.' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address format.' },
        { status: 400 }
      );
    }

    // Validate inquiryType against allowed set
    if (!ALLOWED_INQUIRY_TYPES.includes(inquiryType)) {
      return NextResponse.json(
        { error: 'Invalid inquiry type.' },
        { status: 400 }
      );
    }

    // Enforce rate limiting server-side before database write or EmailJS dispatch
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
               request.headers.get('x-real-ip') ||
               '127.0.0.1';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Initialize Supabase Admin/Service-Role Client to ensure database insertion works securely
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Save record to the 'contacts' table
    const { error: dbError } = await supabase
      .from('contacts')
      .insert({
        full_name: fullName,
        email: email,
        company: company || null,
        phone: phone || null,
        inquiry_type: inquiryType,
        message: message
      });

    if (dbError) {
      console.error('Database write error during contact submission:', dbError.message);
      return NextResponse.json(
        { error: 'Unable to save your inquiry at this time. Please try again later.' },
        { status: 500 }
      );
    }

    // --- EMAILS (Resend) ---
    // There is no admin page for contact messages, so this alert to
    // CONTACT_ALERT_EMAIL is how the team learns of each one.
    const topic = INQUIRY_LABELS[inquiryType as keyof typeof INQUIRY_LABELS];
    const confirmation = contactReceivedEmail({ name: fullName, topic, message });

    const [adminEmailResult, clientEmailResult] = await Promise.all([
      sendTeamAlert({
        subject: `New contact message (${topic}) — ${fullName}`,
        heading: 'New contact form message',
        fields: [
          ['Name', fullName],
          ['Email', email],
          ['Phone', phone],
          ['Company', company],
          ['Topic', topic],
        ],
        notes: [['Message', message]],
        replyTo: email,
        tag: 'contact_alert',
        logContext: 'contact-admin',
      }),
      sendEmail({
        to: email,
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        fromName: SENDERS.contact,
        // A follow-up reply belongs with the team handling the inquiry.
        replyTo: process.env.CONTACT_ALERT_EMAIL?.trim() || undefined,
        tags: [{ name: 'type', value: 'contact_received' }],
        logContext: 'contact-client',
      }),
    ]);

    if (!adminEmailResult.success) {
      console.warn('[Contact API] Team alert failed:', adminEmailResult.error);
    }
    if (!clientEmailResult.success) {
      console.warn('[Contact API] Confirmation email failed:', clientEmailResult.error);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in contact API route:', error);
    return NextResponse.json(
      { error: 'An unexpected internal server error occurred.' },
      { status: 500 }
    );
  }
}
