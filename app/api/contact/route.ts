import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const ALLOWED_INQUIRY_TYPES = ['general', 'aerolabs', 'sponsorship', 'registration', 'aircraft_display', 'others'] as const;

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
    // Send Email Notification via EmailJS (Only EmailJS is used now)
    if (
      process.env.EMAILJS_SERVICE_ID &&
      process.env.EMAILJS_TEMPLATE_ID &&
      process.env.EMAILJS_PUBLIC_KEY
    ) {
      try {
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

        const emailJsRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailJsPayload),
        });

        if (!emailJsRes.ok) {
          const errText = await emailJsRes.text();
          console.error('EmailJS sending failed:', emailJsRes.status, errText);
        } else {
          console.log('EmailJS contact inquiry notification sent successfully.');
        }
      } catch (err) {
        console.error('Failed to send contact inquiry via EmailJS:', err);
      }
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
