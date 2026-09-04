import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmailJS } from '@/lib/email';

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
    if (!dbSuccess) {
      try {
        await supabase.from('contacts').insert({
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
      } catch (fallbackErr) {
        console.error('[Interest API] Fallback contact write failed:', fallbackErr);
      }
    }

    const formattedAreas = (Array.isArray(areasOfInterest) && areasOfInterest.length > 0)
      ? areasOfInterest.join(', ')
      : 'General Aviation Overview';

    // ─── EMAIL DISPATCH ───────────────────────────────────────────
    if (isPayNow) {
      // 1. Pay Now — Send 10% AfBAA discount confirmation
      await sendEmailJS({
        logContext: 'interest-paynow-client',
        templateParams: {
          name: fullName,
          title: `NBAC 2027: Early Bird Registration & 10% Discount Code (${discountCode})`,
          email,
          to_email: email,
          message: [
            `Dear ${fullName},`,
            ``,
            `Thank you for registering at our stand for the Nigerian Business Aviation Conference (NBAC) 2027.`,
            ``,
            `YOUR 10% AfBAA EVENT DISCOUNT DETAILS:`,
            `Coupon Code: ${discountCode}`,
            `Benefit: 10% discount on full payment during the AfBAA event.`,
            ``,
            `REGISTRATION SUMMARY:`,
            `• Full Name: ${fullName}`,
            `• Role: ${role.toUpperCase()}`,
            `• Company: ${company || 'N/A'}`,
            `• Ticket Preference: ${ticketPreference.toUpperCase()}`,
            `• Attendees: ${normalizedAttendees}`,
            `• Areas of Interest: ${formattedAreas}`,
            ``,
            `Our delegate desk will coordinate with you to process your registration and provide your final credentials.`,
            ``,
            `Best regards,`,
            `NBAC 2027 Organizing Secretariat`,
          ].join('\n'),
        },
      });
    } else {
      // 2. Pay Later — Send 5% discount coupon code (NBAC27-EARLY5) valid for 30 days
      await sendEmailJS({
        logContext: 'interest-paylater-client',
        templateParams: {
          name: fullName,
          title: `NBAC 2027: Your 5% Early Bird Discount Code (${discountCode})`,
          email,
          to_email: email,
          message: [
            `Dear ${fullName},`,
            ``,
            `Thank you for visiting our stand and completing the NBAC 2027 interest form.`,
            ``,
            `As requested, here is your exclusive 5% discount coupon code for your registration:`,
            ``,
            `════════════════════════════════════════════`,
            `COUPON CODE: ${discountCode}`,
            `DISCOUNT: 5% off full delegate registration`,
            `VALIDITY: Valid for payment within 30 days of event closing`,
            `════════════════════════════════════════════`,
            ``,
            `YOUR RECORDED ATTENDANCE PREFERENCES:`,
            `• Role: ${role.toUpperCase()}`,
            `• Ticket Preference: ${ticketPreference.toUpperCase()}`,
            `• Number of Attendees: ${normalizedAttendees}`,
            `• Areas of Interest: ${formattedAreas}`,
            `• Company: ${company || 'N/A'}`,
            `• Country: ${country || 'N/A'}`,
            ``,
            `Our delegate concierge team will follow up with invoice details and instructions to finalize your pass within the 30-day validity window.`,
            ``,
            `We look forward to welcoming you to NBAC 2027 in Lagos!`,
            ``,
            `Warm regards,`,
            `The NBAC 2027 Organizing Team`,
          ].join('\n'),
        },
      });
    }

    // 3. Admin Notification Alert
    await sendEmailJS({
      logContext: 'interest-admin-alert',
      templateParams: {
        name: fullName,
        title: `NEW STAND INTEREST LEAD: ${fullName} (${role.toUpperCase()} - ${paymentChoice.toUpperCase()})`,
        email,
        message: [
          `New stand interest form submission received from NBAC 2027 portal:`,
          ``,
          `Full Name: ${fullName}`,
          `Job Title: ${jobTitle || 'N/A'}`,
          `Company: ${company || 'N/A'}`,
          `Country: ${country || 'N/A'}`,
          `Email: ${email}`,
          `Phone: ${phone}`,
          `Role: ${role}`,
          `Attendees: ${normalizedAttendees}`,
          `Ticket Preference: ${ticketPreference}`,
          `Areas of Interest: ${formattedAreas}`,
          `Source: ${source || 'AfBAA Event Stand'}`,
          `Payment Preference: ${paymentChoice.toUpperCase()} (Applied Code: ${discountCode} - ${discountPercent})`,
          `Consent Given: ${consent ? 'Yes' : 'No'}`,
          `Verification Date: ${verificationDate || new Date().toISOString().split('T')[0]}`,
        ].join('\n'),
      },
    });

    return NextResponse.json({
      success: true,
      paymentChoice,
      discountCode,
      discountPercent,
      message: isPayNow
        ? 'Thank you! Your early bird registration has been recorded with a 10% discount.'
        : 'Thank you! Your interest has been recorded and your 5% discount code (NBAC27-EARLY5) has been sent to your email.',
    });
  } catch (err: unknown) {
    console.error('Error in interest submission API route:', err);
    return NextResponse.json(
      { error: 'An unexpected internal error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
