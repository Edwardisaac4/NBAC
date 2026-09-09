import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendEmail } from "@/lib/resend";
import { discountCodeIssuedEmail } from "@/lib/payment-emails";
import { absoluteUrl } from "@/lib/site";
import { formatUsd } from "@/lib/pricing";

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
      role = "delegate",
      attendeeCount = 1,
      areasOfInterest = [],
      ticketPreference = "early_bird",
      source = "AfBAA Event Stand",
      paymentChoice = "pay_later",
      consent = true,
      signatureData,
      verificationDate,
    } = body;

    // Validate required fields
    if (!fullName || !email || !phone) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: Full Name, Email, and Phone/WhatsApp are required.",
        },
        { status: 400 },
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 },
      );
    }

    const normalizedAttendees = Math.max(
      1,
      Math.min(50, Number(attendeeCount) || 1),
    );
    const isPayNow = paymentChoice === "pay_now";
    const discountCode = isPayNow ? "NBAC27-PAYNOW10" : "NBAC27-EARLY5";
    const discountPercent = isPayNow ? "10%" : "5%";

    // Initialize Supabase Client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );

    // Persist to 'interests' table, with graceful fallback to 'contacts'
    let dbSuccess = false;
    try {
      const { error: insertError } = await supabase.from("interests").insert({
        full_name: fullName,
        job_title: jobTitle || null,
        company: company || null,
        country: country || null,
        email: email,
        phone: phone,
        role: role,
        attendee_count: normalizedAttendees,
        areas_of_interest: Array.isArray(areasOfInterest)
          ? areasOfInterest
          : [],
        ticket_preference: ticketPreference,
        source: source || null,
        payment_choice: paymentChoice,
        discount_code: discountCode,
        consent: Boolean(consent),
        signature_data: signatureData || null,
        verification_date:
          verificationDate || new Date().toISOString().split("T")[0],
      });

      if (!insertError) {
        dbSuccess = true;
      } else {
        console.warn(
          "[Interest API] Direct table insert notice:",
          insertError.message,
        );
      }
    } catch (e) {
      console.warn("[Interest API] Table insert exception:", e);
    }

    // Fallback if 'interests' table does not exist yet
    let fallbackSuccess = false;
    if (!dbSuccess) {
      try {
        const { error: fallbackError } = await supabase
          .from("contacts")
          .insert({
            full_name: fullName,
            email: email,
            company: company || null,
            phone: phone || null,
            inquiry_type: "registration",
            message: [
              `[NBAC STAND INTEREST FORM SUBMISSION]`,
              `Role: ${role}`,
              `Job Title: ${jobTitle || "N/A"}`,
              `Country: ${country || "N/A"}`,
              `Attendees: ${normalizedAttendees}`,
              `Ticket Preference: ${ticketPreference}`,
              `Areas of Interest: ${(Array.isArray(areasOfInterest) ? areasOfInterest : []).join(", ") || "None"}`,
              `Source: ${source || "AfBAA Event Stand"}`,
              `Payment Choice: ${paymentChoice} (${discountPercent} discount code: ${discountCode})`,
              `Verification Date: ${verificationDate || new Date().toISOString().split("T")[0]}`,
            ].join("\n"),
          });
        if (!fallbackError) {
          fallbackSuccess = true;
        } else {
          console.error(
            "[Interest API] Fallback contact write failed:",
            fallbackError.message,
          );
        }
      } catch (fallbackErr) {
        console.error(
          "[Interest API] Fallback contact write exception:",
          fallbackErr,
        );
      }
    }

    // This submission is admin-dashboard only — there is no email copy of the lead,
    // so a failed write means the lead is lost. Never report success in that case.
    if (!dbSuccess && !fallbackSuccess) {
      return NextResponse.json(
        {
          error:
            "We could not save your details. Please try again or speak to a member of our stand team.",
        },
        { status: 500 },
      );
    }

    // ── Email the code to the lead ──────────────────────────────────────
    // Previously the code appeared on one success screen and nowhere else:
    // close the tab and it was gone, recoverable only by querying `interests`.
    //
    // Value and expiry are read from the live discount_codes row rather than
    // the hardcoded `discountPercent` above, because an email promising 10%
    // after the campaign has closed is worse than sending none. Falls back to
    // the hardcoded figure if the lookup fails.
    let codeValueText = discountPercent;
    let codeLabel = isPayNow
      ? "AfBAA Event Full Payment Discount"
      : "Early Bird Discount";
    let codeValidUntil: Date | null = null;

    try {
      const { data: codeRow } = await supabase
        .from("discount_codes")
        .select("label, discount_type, value, valid_until")
        .eq("code", discountCode)
        .maybeSingle();

      if (codeRow) {
        codeLabel = codeRow.label || codeLabel;
        codeValueText =
          codeRow.discount_type === "percent"
            ? `${Number(codeRow.value)}%`
            : formatUsd(Number(codeRow.value));
        codeValidUntil = codeRow.valid_until
          ? new Date(codeRow.valid_until)
          : null;
      }
    } catch (e) {
      console.warn("[Interest API] discount_codes lookup failed:", e);
    }

    const codeEmail = discountCodeIssuedEmail({
      name: fullName,
      code: discountCode,
      label: codeLabel,
      valueText: codeValueText,
      validUntil: codeValidUntil,
      // ?code= prefills the coupon field on the registration form.
      registerUrl: absoluteUrl(
        `/contact/delegate?code=${encodeURIComponent(discountCode)}`,
      ),
    });

    const codeEmailResult = await sendEmail({
      to: String(email),
      subject: codeEmail.subject,
      html: codeEmail.html,
      text: codeEmail.text,
      // Deliberately NOT idempotency-keyed.
      //
      // A key of code+email deduplicated for 24 hours, so a visitor who lost
      // the email and submitted again got a logged "sent" and no delivery —
      // Resend returns the original message id instead of sending. Duplicate
      // coupon emails are harmless (same code, same expiry); a silently
      // missing one is not. Double-submits are already prevented by the
      // form's isSubmitting guard.
      tags: [{ name: "type", value: "discount_code_issued" }],
      logContext: "interest-code",
    });

    if (!codeEmailResult.success) {
      console.warn(
        "[Interest API] Discount code email failed:",
        codeEmailResult.error,
      );
    }

    return NextResponse.json({
      success: true,
      paymentChoice,
      discountCode,
      // The live figure from discount_codes (falling back to the hardcoded
      // one if that lookup failed), not the hardcoded value: quoting 10% here
      // while the emailed code is worth something else puts the two copies of
      // the same promise out of step. May be a fixed amount such as "$25.00",
      // so consumers must treat it as an opaque string rather than a number.
      discountPercent: codeValueText,
      // Tells the success screen whether to promise an email has been sent.
      codeEmailed: codeEmailResult.success,
      // Codes are issued here but applied only when typed on the registration
      // form, so the wording must not imply the discount is already attached.
      message: isPayNow
        ? `Thank you! Your registration has been recorded. Your ${codeValueText} full-payment discount code is ${discountCode} — enter it when you register.`
        : `Thank you! Your interest has been recorded. Your ${codeValueText} discount code is ${discountCode} — enter it when you register.`,
    });
  } catch (err: unknown) {
    console.error("Error in interest submission API route:", err);
    return NextResponse.json(
      { error: "An unexpected internal error occurred. Please try again." },
      { status: 500 },
    );
  }
}
