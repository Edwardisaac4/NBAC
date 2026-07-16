import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_INQUIRY_TYPES = ['general', 'aerolabs', 'sponsorship', 'registration', 'aircraft_display', 'others'] as const;

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

// --- EMAILJS QUEUE & WORKER ---
interface QueueJob {
  payload: {
    service_id: string;
    template_id: string;
    user_id: string;
    accessToken?: string;
    template_params: {
      fullName: string;
      email: string;
      company: string;
      phone: string;
      inquiryType: string;
      message: string;
      to_email: string;
    };
  };
}

const emailQueue: QueueJob[] = [];
let workerRunning = false;

async function processEmailJob(job: QueueJob) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000); // 8-second request timeout

  try {
    const emailJsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(job.payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!emailJsRes.ok) {
      const errText = await emailJsRes.text();
      console.error('EmailJS sending failed:', emailJsRes.status, errText);
    } else {
      console.log('EmailJS contact inquiry notification sent successfully.');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Failed to send contact inquiry via EmailJS:', err);
  }
}

async function runWorker() {
  if (workerRunning) return;
  workerRunning = true;

  try {
    while (emailQueue.length > 0) {
      const job = emailQueue.shift();
      if (job) {
        await processEmailJob(job);
      }
      // Guarantee at least 1 second between starts of EmailJS requests
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (err) {
    console.error('Queue worker loop error:', err);
  } finally {
    workerRunning = false;
  }
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

    // --- ALERTS PIPELINE ---
    // Push the job to the non-blocking EmailJS queue
    if (
      process.env.EMAILJS_SERVICE_ID &&
      process.env.EMAILJS_TEMPLATE_ID &&
      process.env.EMAILJS_PUBLIC_KEY
    ) {
      const emailJsPayload = {
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_PUBLIC_KEY,
        accessToken: process.env.EMAILJS_PRIVATE_KEY || undefined,
        template_params: {
          fullName,
          email,
          company: company || 'N/A',
          phone: phone || 'N/A',
          inquiryType: inquiryType.toUpperCase().replace('_', ' '),
          message,
          to_email: process.env.CONTACT_ALERT_EMAIL || 'it.support@ean.aero',
        },
      };

      emailQueue.push({ payload: emailJsPayload });
      // Trigger background worker asynchronously (without await) to not block the response or DB write
      runWorker().catch((err) => console.error('Failed to run EmailJS queue worker:', err));
    } else {
      console.warn('EmailJS environment variables (EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, EMAILJS_PUBLIC_KEY) are not configured. Email notification skipped.');
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
