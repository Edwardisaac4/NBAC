import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailJS } from '@/lib/email';

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
    const emailResult = await sendEmailJS({
      logContext: 'contact',
      templateParams: {
        name: fullName,
        title: inquiryType.toUpperCase().replace('_', ' '),
        email,
        message: `Company: ${company || 'N/A'}\nPhone: ${phone || 'N/A'}\n\n${message}`,
      }
    });

    if (!emailResult.success) {
      console.warn('[Contact API] Email notification failed but DB write succeeded:', emailResult.error);
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
