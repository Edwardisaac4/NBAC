import { Resend } from "resend";

/**
 * Resend sending helper for delegate-facing transactional email.
 *
 * Split of responsibility with lib/email.ts (EmailJS):
 *   * Resend  — delegate-facing mail (payment instructions, claim
 *     acknowledgements, verified confirmations, passes). These need real HTML,
 *     attachments, and bounce visibility.
 *   * EmailJS — internal alerts to the EAN marketing inbox. Plain text is fine
 *     there and the existing four routes keep working untouched.
 *
 * All addresses come from the environment and are deliberately NOT defaulted
 * in source — this file is committed, and hardcoded mailboxes get harvested
 * from public repos. Set RESEND_FROM, RESEND_REPLY_TO and
 * PAYMENT_ARCHIVE_BCC in .env.local and in the deployment platform's
 * environment.
 *
 * Requires the sending domain verified in Resend, with the Resend include
 * MERGED into the existing SPF record rather than added as a second one.
 *
 * Pick the archive mailbox with quota in mind: a capped cPanel mailbox drops
 * mail silently once full, which would quietly lose the audit trail of every
 * email sent.
 */

const LOG_PREFIX = "[Resend]";

/** Resend sends but does not receive, so replyTo must be a real mailbox. */
export const REGISTRATION_FROM = process.env.RESEND_FROM?.trim() || "";
export const REGISTRATION_REPLY_TO =
  process.env.RESEND_REPLY_TO?.trim() || "";

/** Archive copy of every delegate email. Omitted entirely when unset. */
export const ARCHIVE_BCC = process.env.PAYMENT_ARCHIVE_BCC?.trim() || "";

let client: Resend | null = null;

function getClient(): Resend | null {
  if (client) return client;
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return null;
  client = new Resend(key);
  return client;
}

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  /** Plain-text alternative. Materially helps deliverability — always pass one. */
  text: string;
  replyTo?: string;
  /** Set false for internal mail that should not clutter the archive mailbox. */
  archive?: boolean;
  /**
   * Guards against duplicate sends when an action can be triggered twice —
   * an admin double-clicking "verify", for instance.
   */
  idempotencyKey?: string;
  tags?: { name: string; value: string }[];
  logContext?: string;
}

export async function sendEmail(
  params: SendEmailParams,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const ctx = params.logContext ? `[${params.logContext}]` : "";
  const resend = getClient();

  if (!resend) {
    // Not fatal: a registration must still succeed with its record written even
    // if no mail can go out. The delegate can be re-sent their link from admin.
    console.error(
      `${LOG_PREFIX}${ctx} ✗ RESEND_API_KEY is not set. Email not sent.`,
    );
    return { success: false, error: "RESEND_API_KEY is not configured" };
  }

  // Resend rejects an empty from, and a silent rejection here would look like
  // a mail-delivery problem rather than a missing variable.
  if (!REGISTRATION_FROM) {
    console.error(
      `${LOG_PREFIX}${ctx} ✗ RESEND_FROM is not set. Email not sent.`,
    );
    return { success: false, error: "RESEND_FROM is not configured" };
  }

  const replyTo = params.replyTo || REGISTRATION_REPLY_TO;
  const archive = params.archive !== false && Boolean(ARCHIVE_BCC);

  try {
    const { data, error } = await resend.emails.send(
      {
        from: REGISTRATION_FROM,
        to: params.to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        ...(replyTo ? { replyTo } : {}),
        ...(archive ? { bcc: ARCHIVE_BCC } : {}),
        ...(params.tags ? { tags: params.tags } : {}),
      },
      params.idempotencyKey
        ? { idempotencyKey: params.idempotencyKey }
        : undefined,
    );

    if (error) {
      console.error(`${LOG_PREFIX}${ctx} ✗ send failed:`, error.message);
      return { success: false, error: error.message };
    }

    console.log(`${LOG_PREFIX}${ctx} ✓ sent (id: ${data?.id}).`);
    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`${LOG_PREFIX}${ctx} ✗ transport error:`, message);
    return { success: false, error: message };
  }
}
