import { sendEmail } from '@/lib/resend'
import {
  esc,
  row,
  shell,
  greetingName,
  GOLD,
  INK,
  BODY,
  MUTED,
  BORDER,
  CANVAS,
} from '@/lib/payment-emails'
import { absoluteUrl } from '@/lib/site'

/**
 * Emails for the site's forms, all sent through Resend.
 *
 * Each submission produces two emails: a confirmation to the person who
 * filled in the form, and a team alert to CONTACT_ALERT_EMAIL listing
 * everything they entered. The alert's Reply-To is the submitter, so
 * pressing Reply in the team inbox answers them directly.
 */

/** Sender display names. The address is always the verified RESEND_FROM one. */
export const SENDERS = {
  alerts: 'NBAC 2027 Website',
  contact: 'NBAC 2027',
  sponsor: 'NBAC 2027 Partnerships',
  aerolab: 'NBAC 2027 AeroLab',
  media: 'NBAC 2027 Media Desk',
} as const

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Strips line breaks so form input cannot break an email header. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim()
}

function lagosNow(): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Africa/Lagos',
  }).format(new Date())
}

function display(value: string | number | null | undefined): string {
  const text = value === null || value === undefined ? '' : String(value).trim()
  return text || '—'
}

// ─── Team alert ─────────────────────────────────────────────────────

export type AlertField = [label: string, value: string | number | null | undefined]

export interface TeamAlert {
  /** Subject line, e.g. "New contact message — Jane Doe". */
  subject: string
  /** Heading inside the email, e.g. "New contact form message". */
  heading: string
  /** Short label/value pairs, shown as a table. Empty values print as "—". */
  fields: AlertField[]
  /** Longer free text (messages, concept notes), each shown as its own block. */
  notes?: AlertField[]
  /** Admin page where this submission can be reviewed, when one exists. */
  adminPath?: string
  /** The submitter's email: pressing Reply in the team inbox goes to them. */
  replyTo: string
  /** Resend tag value, e.g. "contact_alert". */
  tag: string
  logContext: string
}

export function teamAlertEmail(alert: TeamAlert): { html: string; text: string } {
  const received = lagosNow()
  const adminUrl = alert.adminPath ? absoluteUrl(alert.adminPath) : null
  const notes = (alert.notes || []).filter(([, value]) => display(value) !== '—')

  const fieldRows = alert.fields
    .map(([label, value]) => row(esc(label), esc(display(value))))
    .join('')

  const noteBlocks = notes
    .map(([label, value]) => `
  <div style="margin:0 0 16px;">
    <div style="color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:6px;">${esc(label)}</div>
    <div style="border:1px solid ${BORDER};border-radius:8px;padding:12px 14px;color:${BODY};font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(display(value))}</div>
  </div>`)
    .join('')

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:${CANVAS};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td style="background:${INK};padding:16px 28px;">
  <div style="color:${GOLD};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">NBAC 2027 &middot; Website notification</div>
</td></tr>
<tr><td style="padding:24px 28px 8px;">
  <h1 style="margin:0 0 4px;color:${INK};font-size:20px;line-height:1.3;">${esc(alert.heading)}</h1>
  <div style="color:${MUTED};font-size:12px;margin-bottom:18px;">Received ${esc(received)} (Lagos time)</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;margin-bottom:20px;">
    ${fieldRows}
  </table>
  ${noteBlocks}
</td></tr>
${adminUrl ? `<tr><td style="padding:0 28px 8px;">
  <a href="${esc(adminUrl)}" style="display:inline-block;background:${GOLD};color:${INK};text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:8px;">Open in admin</a>
</td></tr>` : ''}
<tr><td style="padding:16px 28px 24px;">
  <div style="color:${MUTED};font-size:12px;line-height:1.6;">
    Reply to this email to respond directly to the person who submitted the form.
  </div>
</td></tr>
</table>
</td></tr></table>
</body></html>`

  const text = [
    alert.heading,
    `Received ${received} (Lagos time)`,
    ``,
    ...alert.fields.map(([label, value]) => `${label}: ${display(value)}`),
    ...notes.flatMap(([label, value]) => [``, `${label.toUpperCase()}:`, display(value)]),
    ...(adminUrl ? [``, `Open in admin: ${adminUrl}`] : []),
    ``,
    `Reply to this email to respond directly to the person who submitted the form.`,
  ].join('\n')

  return { html, text }
}

/** Sends a team alert to CONTACT_ALERT_EMAIL. Never throws. */
export async function sendTeamAlert(
  alert: TeamAlert,
): Promise<{ success: boolean; id?: string; error?: string }> {
  const to = process.env.CONTACT_ALERT_EMAIL?.trim()
  if (!to) {
    console.error(`[Resend][${alert.logContext}] ✗ CONTACT_ALERT_EMAIL is not set. Team alert not sent.`)
    return { success: false, error: 'CONTACT_ALERT_EMAIL is not configured' }
  }

  const { html, text } = teamAlertEmail(alert)
  const replyTo = alert.replyTo.trim()

  return sendEmail({
    to,
    subject: oneLine(alert.subject),
    html,
    text,
    // An address that fails this check would make Resend reject the whole
    // alert, so it is dropped rather than risk losing the notification.
    ...(EMAIL_RE.test(replyTo) ? { replyTo } : {}),
    fromName: SENDERS.alerts,
    archive: false,
    tags: [{ name: 'type', value: alert.tag }],
    logContext: alert.logContext,
  })
}

// ─── Confirmations to the person who submitted ──────────────────────

export interface ContactReceivedData {
  name: string
  topic: string
  message: string
}

export function contactReceivedEmail(data: ContactReceivedData) {
  const firstName = greetingName(data.name)

  const inner = `
<tr><td style="padding:28px 28px 28px;">
  <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.6;">
    Hello ${esc(firstName)},
  </p>
  <p style="margin:0 0 20px;color:${BODY};font-size:15px;line-height:1.6;">
    Thank you for contacting NBAC 2027. We have received your message and a member of our team
    will get back to you by email.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;margin-bottom:20px;">
    ${row('Topic', esc(data.topic), { strong: true, color: INK })}
  </table>

  <div style="color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;margin-bottom:6px;">Your message</div>
  <div style="border:1px solid ${BORDER};border-radius:8px;padding:12px 14px;color:${BODY};font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(data.message)}</div>
</td></tr>`

  const text = [
    `Hello ${firstName},`,
    ``,
    `Thank you for contacting NBAC 2027. We have received your message and a member of`,
    `our team will get back to you by email.`,
    ``,
    `Topic: ${data.topic}`,
    ``,
    `YOUR MESSAGE`,
    data.message,
  ].join('\n')

  return {
    subject: `We've received your message — NBAC 2027`,
    html: shell(inner, 'team'),
    text,
  }
}

export interface SponsorReceivedData {
  name: string
  company: string
  tierName: string
  addOns: string[]
}

export function sponsorApplicationReceivedEmail(data: SponsorReceivedData) {
  const firstName = greetingName(data.name)
  const addOnsText = data.addOns.length > 0 ? data.addOns.join(', ') : 'None'

  const inner = `
<tr><td style="padding:28px 28px 8px;">
  <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.6;">
    Hello ${esc(firstName)},
  </p>
  <p style="margin:0 0 20px;color:${BODY};font-size:15px;line-height:1.6;">
    Thank you for your interest in sponsoring NBAC 2027. We have received your sponsorship
    application, and our partnerships team will be in touch to discuss next steps.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;margin-bottom:22px;">
    ${row('Company', esc(data.company), { strong: true, color: INK })}
    ${row('Package', esc(data.tierName))}
    ${row('Add-ons', esc(addOnsText))}
  </table>
</td></tr>

<tr><td style="padding:0 28px 28px;">
  <p style="margin:0;color:${MUTED};font-size:13px;line-height:1.6;">
    If anything in your application needs to change, simply reply to this email.
  </p>
</td></tr>`

  const text = [
    `Hello ${firstName},`,
    ``,
    `Thank you for your interest in sponsoring NBAC 2027. We have received your sponsorship`,
    `application, and our partnerships team will be in touch to discuss next steps.`,
    ``,
    `Company: ${data.company}`,
    `Package: ${data.tierName}`,
    `Add-ons: ${addOnsText}`,
    ``,
    `If anything in your application needs to change, simply reply to this email.`,
  ].join('\n')

  return {
    subject: `Your NBAC 2027 sponsorship application — ${oneLine(data.tierName)}`,
    html: shell(inner, 'partnerships team'),
    text,
  }
}

export interface AeroLabReceivedData {
  name: string
  reference: string
  teamName: string
  trackLabel: string
  proposalTitle: string
}

export function aerolabApplicationReceivedEmail(data: AeroLabReceivedData) {
  const firstName = greetingName(data.name)

  const inner = `
<tr><td style="padding:28px 28px 8px;">
  <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.6;">
    Hello ${esc(firstName)},
  </p>
  <p style="margin:0 0 20px;color:${BODY};font-size:15px;line-height:1.6;">
    Thank you for applying to the AeroLab Innovation Challenge at NBAC 2027. We have received
    your team's application.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;margin-bottom:22px;">
    ${row('Reference', esc(data.reference), { strong: true, color: INK })}
    ${row('Team', esc(data.teamName))}
    ${row('Track', esc(data.trackLabel))}
    ${row('Proposal', esc(data.proposalTitle))}
  </table>
</td></tr>

<tr><td style="padding:0 28px 28px;">
  <p style="margin:0 0 8px;color:${INK};font-size:14px;font-weight:700;">What happens next</p>
  <p style="margin:0 0 6px;color:${BODY};font-size:14px;line-height:1.65;">
    1. Your application is queued for evaluation by the NBAC Technical Steering Committee.
  </p>
  <p style="margin:0 0 6px;color:${BODY};font-size:14px;line-height:1.65;">
    2. Admitted cohort teams (up to 30 across all tracks) will be announced and contacted by email
    with briefing packs and mentor pairings.
  </p>
  <p style="margin:0;color:${BODY};font-size:14px;line-height:1.65;">
    3. Keep an eye on your inbox for further updates.
  </p>
</td></tr>`

  const text = [
    `Hello ${firstName},`,
    ``,
    `Thank you for applying to the AeroLab Innovation Challenge at NBAC 2027. We have`,
    `received your team's application.`,
    ``,
    `Reference: ${data.reference}`,
    `Team: ${data.teamName}`,
    `Track: ${data.trackLabel}`,
    `Proposal: ${data.proposalTitle}`,
    ``,
    `WHAT HAPPENS NEXT`,
    `1. Your application is queued for evaluation by the NBAC Technical Steering Committee.`,
    `2. Admitted cohort teams (up to 30 across all tracks) will be announced and contacted`,
    `   by email with briefing packs and mentor pairings.`,
    `3. Keep an eye on your inbox for further updates.`,
  ].join('\n')

  return {
    subject: `AeroLab 2027 application received [${data.reference}]`,
    html: shell(inner, 'AeroLab team'),
    text,
  }
}
