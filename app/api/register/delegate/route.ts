import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, company, phone, tier, reference, amount, currency, specialRequirements, delegateCount } = body;

    if (!name || !email || !tier || !reference) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('reservations')
      .insert({
        name,
        email,
        company,
        phone,
        tier,
        status: 'pending',
        reference,
        amount,
        currency: currency || 'USD',
        special_requirements: specialRequirements,
        delegate_count: delegateCount || 1
      })
      .select()
      .single();

    if (error) {
      console.error('Database insert error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send email alert via Resend
    if (process.env.RESEND_API_KEY && process.env.CONTACT_ALERT_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      try {
        await resend.emails.send({
          from: `NBAC Alerts <${process.env.RESEND_FROM_EMAIL || 'noreply@nbac.com.ng'}>`,
          to: process.env.CONTACT_ALERT_EMAIL,
          subject: `🎟️ [Ticket Registration] ${name} - ${tier}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e3e5; border-radius: 8px; background-color: #ffffff; color: #101415;">
              <h2 style="color: #c5a059; border-bottom: 2px solid #e0e3e5; padding-bottom: 10px; margin-top: 0;">New Ticket Registration</h2>
              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; width: 140px;">Name:</td>
                  <td style="padding: 8px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Company:</td>
                  <td style="padding: 8px 0;">${company || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                  <td style="padding: 8px 0;">${phone || 'N/A'}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Pass Tier:</td>
                  <td style="padding: 8px 0; color: #10b981; font-weight: bold;">${tier}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Seat Count:</td>
                  <td style="padding: 8px 0;">${delegateCount}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Order Reference:</td>
                  <td style="padding: 8px 0; font-family: monospace;">${reference}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold;">Amount Due:</td>
                  <td style="padding: 8px 0; font-weight: bold;">$${amount} ${currency || 'USD'}</td>
                </tr>
              </table>
              ${specialRequirements ? `
              <div style="background-color: #f8fafc; border-left: 4px solid #c5a059; padding: 15px; border-radius: 4px; margin-top: 10px;">
                <h4 style="margin: 0 0 10px 0; color: #323537; font-size: 12px; text-transform: uppercase;">Special Requirements:</h4>
                <p style="margin: 0; line-height: 1.6; font-size: 14px;">${specialRequirements}</p>
              </div>
              ` : ''}
              <p style="font-size: 11px; color: #909097; margin-top: 30px; text-align: center; border-top: 1px solid #e0e3e5; padding-top: 15px;">
                Sent automatically by the NBAC website engine.
              </p>
            </div>
          `
        });
      } catch (mailErr) {
        console.error('Failed to send Resend email for delegate registration:', mailErr);
      }
    }

    return NextResponse.json({ success: true, data });
  } catch (err: unknown) {
    console.error('Error in delegate registration API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
