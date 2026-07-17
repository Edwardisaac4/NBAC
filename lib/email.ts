/**
 * EmailJS sending helper for Next.js API routes.
 *
 * Template variables (must match your EmailJS template):
 *   {{name}}    — sender / registrant name
 *   {{title}}   — subject line context (e.g. "General Inquiry", "TICKET REGISTRATION - VIP")
 *   {{message}} — body content
 *   {{email}}   — reply-to email
 *   {{time}}    — timestamp of submission
 *
 * The To Email is hardcoded in the EmailJS template to marketing@ean.aero.
 */

const LOG_PREFIX = '[EmailJS]';

export interface EmailJSParams {
  /** Maps to {{name}} in the template */
  name: string;
  /** Maps to {{title}} in the template — used in subject line */
  title: string;
  /** Maps to {{message}} in the template */
  message: string;
  /** Maps to {{email}} in the template — used as Reply-To */
  email: string;
  /** Maps to {{time}} in the template — auto-generated if omitted */
  time?: string;
  /** Any additional custom fields the template might use */
  [key: string]: unknown;
}

export async function sendEmailJS(params: {
  templateId?: string;
  templateParams: EmailJSParams;
  /** Optional context label for log messages (e.g. "contact", "delegate", "sponsor") */
  logContext?: string;
}): Promise<{ success: boolean; error?: string }> {
  const ctx = params.logContext ? `[${params.logContext}]` : '';

  const serviceId = process.env.EMAILJS_SERVICE_ID?.trim();
  const defaultTemplateId = process.env.EMAILJS_TEMPLATE_ID?.trim();
  const publicKey = process.env.EMAILJS_PUBLIC_KEY?.trim();
  const privateKey = process.env.EMAILJS_PRIVATE_KEY?.trim();

  const finalTemplateId = params.templateId?.trim() || defaultTemplateId;

  if (!serviceId || !finalTemplateId || !publicKey) {
    const missing = [
      !serviceId && 'EMAILJS_SERVICE_ID',
      !finalTemplateId && 'EMAILJS_TEMPLATE_ID',
      !publicKey && 'EMAILJS_PUBLIC_KEY',
    ].filter(Boolean).join(', ');
    console.error(`${LOG_PREFIX}${ctx} ✗ Missing env vars: ${missing}. Email not sent.`);
    return { success: false, error: `Missing environment variables: ${missing}` };
  }

  if (!privateKey) {
    console.warn(`${LOG_PREFIX}${ctx} ⚠ EMAILJS_PRIVATE_KEY is empty. If Strict Mode is enabled on your account, emails will be rejected.`);
  }

  // Auto-populate time if not provided
  if (!params.templateParams.time) {
    params.templateParams.time = new Date().toLocaleString('en-GB', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Africa/Lagos',
    });
  }

  const payload = {
    service_id: serviceId,
    template_id: finalTemplateId,
    user_id: publicKey,
    accessToken: privateKey || undefined,
    template_params: params.templateParams,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  try {
    console.log(`${LOG_PREFIX}${ctx} Sending email to template "${finalTemplateId}" for "${params.templateParams.email}"...`);

    const res = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.error(`${LOG_PREFIX}${ctx} ✗ EmailJS API returned ${res.status}: ${errText}`);
      return { success: false, error: `EmailJS ${res.status}: ${errText}` };
    }

    console.log(`${LOG_PREFIX}${ctx} ✓ Email sent successfully.`);
    return { success: true };
  } catch (err) {
    clearTimeout(timeoutId);
    const message = err instanceof Error ? err.message : String(err);
    console.error(`${LOG_PREFIX}${ctx} ✗ Network/timeout error: ${message}`);
    return { success: false, error: message };
  }
}
