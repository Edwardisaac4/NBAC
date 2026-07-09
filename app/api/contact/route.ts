import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

const ALLOWED_INQUIRY_TYPES = ['general', 'aerolabs', 'sponsorship', 'registration', 'aircraft_display', 'others'] as const;

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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

    // 1. Send Email Notification via Resend if API key is configured
    if (process.env.RESEND_API_KEY && process.env.CONTACT_ALERT_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);

      try {
        const { data, error: resendError } = await resend.emails.send({
          from: `NBAC Alerts <${process.env.RESEND_FROM_EMAIL || 'noreply@nbac.com.ng'}>`,
          to: process.env.CONTACT_ALERT_EMAIL,
          replyTo: email,
          subject: `✈️ [Inquiry] ${inquiryType.toUpperCase().replace(/[\r\n]/g, '')} - ${fullName.replace(/[\r\n]/g, '')}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e3e5; border-radius: 8px; background-color: #ffffff; color: #101415;">
              <h2 style="color: #10b981; border-bottom: 2px solid #e0e3e5; padding-bottom: 10px; margin-top: 0;">New Conference Inquiry</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 140px;">Full Name:</td>
                  <td style="padding: 8px 0;">${escapeHtml(fullName)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Company:</td>
                  <td style="padding: 8px 0;">${escapeHtml(company || 'N/A')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;">${escapeHtml(phone || 'N/A')}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Inquiry Type:</td>
                  <td style="padding: 8px 0; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; color: #c5a059;">${escapeHtml(inquiryType.replace('_', ' '))}</td>
                </tr>
              </table>
              <div style="background-color: #f8fafc; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #323537; font-size: 12px; text-transform: uppercase; tracking: 0.05em;">Message Details:</h4>
                <p style="margin: 0; line-height: 1.6; white-space: pre-wrap; font-size: 14px;">${escapeHtml(message)}</p>
              </div>
              <p style="font-size: 11px; color: #909097; margin-top: 30px; text-align: center; border-top: 1px solid #e0e3e5; padding-top: 15px;">
                Sent automatically by the NBAC website engine.
              </p>
            </div>
          `
        });

        if (resendError) {
          console.error('Resend SDK response error:', resendError.message);
        } else if (data) {
          console.log('Resend email sent successfully. ID:', data.id);
        }
      } catch (err) {
        console.error('Failed to dispatch Resend email alert (network-level):', err);
      }
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
