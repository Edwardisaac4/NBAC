import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fullName,
      jobTitle,
      company,
      country,
      email,
      phone,
      role = 'delegate',
      attendeeCount = 1,
      areasOfInterest = [],
      ticketPreference = 'early_bird',
      source = 'AfBAA Event Stand',
      paymentChoice = 'pay_later',
      consent = true,
      signatureData,
      verificationDate,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: Full Name, Email, and Phone/WhatsApp are required.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
    }

    const normalizedAttendees = Math.max(1, Math.min(50, Number(attendeeCount) || 1));
    const isPayNow = paymentChoice === 'pay_now';
    const discountCode = isPayNow ? 'NBAC27-PAYNOW10' : 'NBAC27-EARLY5';
    const discountPercent = isPayNow ? '10%' : '5%';

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Persist to 'interests' table, with graceful fallback to 'contacts'
    let dbSuccess = false;
    try {
      const { error: insertError } = await supabase.from('interests').insert({
        full_name: fullName,
        job_title: jobTitle || null,
        company: company || null,
        country: country || null,
        email: email,
        phone: phone,
        role: role,
        attendee_count: normalizedAttendees,
        areas_of_interest: Array.isArray(areasOfInterest) ? areasOfInterest : [],
        ticket_preference: ticketPreference,
        source: source || null,
        payment_choice: paymentChoice,
        discount_code: discountCode,
        consent: Boolean(consent),
        signature_data: signatureData || null,
        verification_date: verificationDate || new Date().toISOString().split('T')[0],
      });

      if (!insertError) {
        dbSuccess = true;
      } else {
        console.warn('[Interest API] Direct table insert notice:', insertError.message);
      }
    } catch (e) {
      console.warn('[Interest API] Table insert exception:', e);
    }

    // Fallback if 'interests' table does not exist yet
    let fallbackSuccess = false;
    if (!dbSuccess) {
      try {
        const { error: fallbackError } = await supabase.from('contacts').insert({
          full_name: fullName,
          email: email,
          company: company || null,
          phone: phone || null,
          inquiry_type: 'registration',
          message: [
            `[NBAC STAND INTEREST FORM SUBMISSION]`,
            `Role: ${role}`,
            `Job Title: ${jobTitle || 'N/A'}`,
            `Country: ${country || 'N/A'}`,
            `Attendees: ${normalizedAttendees}`,
            `Ticket Preference: ${ticketPreference}`,
            `Areas of Interest: ${(Array.isArray(areasOfInterest) ? areasOfInterest : []).join(', ') || 'None'}`,
            `Source: ${source || 'AfBAA Event Stand'}`,
            `Payment Choice: ${paymentChoice} (${discountPercent} discount code: ${discountCode})`,
            `Verification Date: ${verificationDate || new Date().toISOString().split('T')[0]}`,
          ].join('\n'),
        });
        if (!fallbackError) {
          fallbackSuccess = true;
        } else {
          console.error('[Interest API] Fallback contact write failed:', fallbackError.message);
        }
      } catch (fallbackErr) {
        console.error('[Interest API] Fallback contact write exception:', fallbackErr);
      }
    }

    // This submission is admin-dashboard only — there is no email copy of the lead,
    // so a failed write means the lead is lost. Never report success in that case.
    if (!dbSuccess && !fallbackSuccess) {
      return NextResponse.json(
        { error: 'We could not save your details. Please try again or speak to a member of our stand team.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentChoice,
      discountCode,
      discountPercent,
      message: isPayNow
        ? 'Thank you! Your early bird registration has been recorded with a 10% discount.'
        : `Thank you! Your interest has been recorded. Your 5% discount code is ${discountCode}.`,
    });
  } catch (err: unknown) {
    console.error('Error in interest submission API route:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
