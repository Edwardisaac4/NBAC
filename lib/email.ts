/**
 * EmailJS sending helper for Next.js API routes.
 * Safely handles environment variables (including trimming whitespace)
 * and executes a POST request to EmailJS API with a timeout.
 */

export interface EmailParams {
  fullName: string;
  email: string;
  company?: string;
  phone?: string;
  inquiryType: string;
  message: string;
  to_email?: string;
}

export async function sendEmailJS(params: {
  templateId?: string;
  templateParams: EmailParams & Record<string, unknown>;
}) {
  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const defaultTemplateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();
  const defaultToEmail = process.env.CONTACT_ALERT_EMAIL?.trim();

  const finalTemplateId = params.templateId?.trim() || defaultTemplateId;

  if (!serviceId || !finalTemplateId || !publicKey) {
    console.warn('EmailJS environment variables are not fully configured. Notification skipped.');
    return { success: false, error: 'EmailJS not fully configured.' };
  }

  // Ensure to_email is populated
  const finalToEmail = params.templateParams.to_email?.trim() || defaultToEmail;
  if (!finalToEmail) {
    console.warn('EmailJS sending skipped: Recipient email address (to_email) is not configured.');
    return { success: false, error: 'Recipient email address not configured.' };
  }
  params.templateParams.to_email = finalToEmail;

  const payload = {
    service_id: serviceId,
    template_id: finalTemplateId,
    user_id: publicKey,
    accessToken: privateKey || undefined,
    template_params: params.templateParams,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10-second timeout

  try {
    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error('EmailJS sending failed:', res.status, errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err) {
    clearTimeout(timeoutId);
    console.error('Error calling EmailJS API:', err);
    return { success: false, error: String(err) };
  }
}
