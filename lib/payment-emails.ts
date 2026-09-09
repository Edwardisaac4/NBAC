import { formatUsd } from '@/lib/pricing'

/**
 * Delegate-facing payment email templates.
 *
 * Hand-written inline styles and table layout on purpose: email clients do not
 * run Tailwind, so the app's components cannot be reused here. Light ground
 * rather than the site's dark theme — dark-background email renders badly
 * across clients and in forwarded threads.
 */

/**
 * Escape caller-supplied text before it goes into the HTML body.
 *
 * Delegate names, references and self-reported Paystack receipt references all
 * originate from form input. Unescaped, a name containing `<` or `"` breaks the
 * markup at best, and injects into whatever renders the message at worst — the
 * delegate's own client, plus the archive mailbox that
 * every sent email is bcc'd to and that staff open by hand.
 *
 * Applied at each call site rather than inside row(), because row() also
 * receives markup we build ourselves.
 */
function esc(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const GOLD = '#c5a059'
const INK = '#101415'
const BODY = '#3f4a4c'
const MUTED = '#7a8688'
const BORDER = '#e2e5e6'
const CANVAS = '#f6f7f7'

export interface RegistrationEmailData {
  name: string
  reference: string
  tierName: string
  delegateCount: number
  grossAmount: number
  discountAmount: number
  discountLabel: string | null
  expectedTotal: number
  currency: string
  payUrl: string
  paymentDeadline: Date
  specialRequirements?: string | null
}

function formatDeadline(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeZone: 'Africa/Lagos',
  }).format(date)
}

function shell(inner: string): string {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:${CANVAS};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${CANVAS};padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:12px;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
<tr><td style="background:${INK};padding:20px 28px;">
  <div style="color:${GOLD};font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:700;">NBAC 2027</div>
  <div style="color:#ffffff;font-size:13px;margin-top:4px;">Nigeria Business Aviation Conference &middot; 4&ndash;5 May 2027 &middot; Lagos</div>
</td></tr>
${inner}
<tr><td style="padding:20px 28px;background:${CANVAS};border-top:1px solid ${BORDER};">
  <div style="color:${MUTED};font-size:11px;line-height:1.6;">
    Organised by EAN Aviation Limited &middot; Marriott Hotel, Ikeja, Lagos<br>
    Questions? Reply to this email and our delegate desk will pick it up.
  </div>
</td></tr>
</table>
</td></tr></table>
</body></html>`
}

function row(label: string, value: string, opts: { strong?: boolean; color?: string } = {}) {
  return `<tr>
    <td style="padding:7px 0;color:${MUTED};font-size:13px;">${label}</td>
    <td style="padding:7px 0;text-align:right;font-size:13px;color:${opts.color || BODY};${opts.strong ? 'font-weight:700;' : ''}">${value}</td>
  </tr>`
}

/**
 * Sent immediately on registration. Carries the reference, the exact figure to
 * type, and the link to our own payment page — never the raw Paystack link, so
 * that a click-through is recorded before the delegate leaves the site.
 */
export function registrationReceivedEmail(data: RegistrationEmailData) {
  const {
    name, reference, tierName, delegateCount, grossAmount,
    discountAmount, discountLabel, expectedTotal, payUrl, paymentDeadline,
  } = data

  const amountText = formatUsd(expectedTotal)
  const firstName = name.split(' ')[0] || name

  const inner = `
<tr><td style="padding:28px 28px 8px;">
  <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.6;">
    Hello ${esc(firstName)},
  </p>
  <p style="margin:0 0 20px;color:${BODY};font-size:15px;line-height:1.6;">
    Your delegate registration for NBAC 2027 is recorded. One step remains &mdash; payment.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;margin-bottom:22px;">
    ${row('Reference', `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${esc(reference)}</span>`)}
    ${row('Pass', esc(tierName))}
    ${row('Delegates', esc(delegateCount))}
    ${row('Standard total', formatUsd(grossAmount))}
    ${discountAmount > 0 ? row(esc(discountLabel || 'Discount'), `&minus;${formatUsd(discountAmount)}`, { color: GOLD }) : ''}
  </table>

  <div style="border:2px solid ${GOLD};border-radius:10px;padding:20px;text-align:center;margin-bottom:8px;">
    <div style="color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Amount to pay</div>
    <div style="color:${INK};font-size:38px;font-weight:800;letter-spacing:-1px;margin:6px 0 2px;">${amountText}</div>
    <div style="color:${MUTED};font-size:12px;">Type this exact figure on the payment page</div>
  </div>
</td></tr>

<tr><td style="padding:14px 28px 4px;" align="center">
  <a href="${payUrl}" style="display:inline-block;background:${GOLD};color:${INK};text-decoration:none;font-weight:700;font-size:15px;padding:14px 34px;border-radius:8px;">Pay ${amountText} now</a>
  <div style="color:${MUTED};font-size:11px;margin-top:10px;">Or open: <a href="${payUrl}" style="color:${MUTED};">${payUrl}</a></div>
</td></tr>

<tr><td style="padding:22px 28px 4px;">
  <div style="background:#fdf8ef;border-left:3px solid ${GOLD};padding:14px 16px;border-radius:0 6px 6px 0;">
    <div style="color:${INK};font-size:13px;font-weight:700;margin-bottom:6px;">Two things to expect</div>
    <div style="color:${BODY};font-size:13px;line-height:1.65;">
      Your card receipt will come from <strong>EAN Aviation Ltd</strong>, the organiser of NBAC 2027 &mdash; that is expected, not an error.<br><br>
      The payment page asks you to enter the amount yourself, and shows a sample figure in the box. Clear it and enter <strong>${amountText}</strong>.
    </div>
  </div>
</td></tr>

<tr><td style="padding:20px 28px 28px;">
  <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
    This price is held until <strong style="color:${BODY};">${formatDeadline(paymentDeadline)}</strong>.
    Your official NBAC confirmation and delegate pass are issued within one business day of payment being confirmed by our finance desk.
  </p>
</td></tr>`

  const text = [
    `Hello ${firstName},`,
    ``,
    `Your delegate registration for NBAC 2027 is recorded. One step remains - payment.`,
    ``,
    `Reference:      ${reference}`,
    `Pass:           ${tierName}`,
    `Delegates:      ${delegateCount}`,
    `Standard total: ${formatUsd(grossAmount)}`,
    ...(discountAmount > 0 ? [`${discountLabel || 'Discount'}: -${formatUsd(discountAmount)}`] : []),
    ``,
    `AMOUNT TO PAY:  ${amountText}`,
    ``,
    `Pay here: ${payUrl}`,
    ``,
    `Two things to expect:`,
    `- Your card receipt comes from EAN Aviation Ltd, the organiser of NBAC 2027. That is expected.`,
    `- The payment page asks you to type the amount yourself and shows a sample figure in the box.`,
    `  Clear it and enter ${amountText}.`,
    ``,
    `This price is held until ${formatDeadline(paymentDeadline)}.`,
    `Your pass is issued within one business day of payment being confirmed.`,
  ].join('\n')

  return {
    subject: `Complete your NBAC 2027 registration — ${amountText} due (${reference})`,
    html: shell(inner),
    text,
  }
}

export interface ClaimEmailData {
  name: string
  reference: string
  amountReported: number
  providerReference?: string | null
  payerEmail?: string | null
}

/**
 * Acknowledges a delegate's self-reported payment.
 *
 * Deliberately does NOT say "payment confirmed" — we hold no Paystack API
 * keys, so at this point nobody has verified that money arrived. Wording that
 * implied otherwise would have us confirming payments that may not exist.
 */
export function paymentClaimReceivedEmail(data: ClaimEmailData) {
  const { name, reference, amountReported, providerReference } = data
  const firstName = name.split(' ')[0] || name

  const inner = `
<tr><td style="padding:28px 28px 8px;">
  <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.6;">Hello ${esc(firstName)},</p>
  <p style="margin:0 0 20px;color:${BODY};font-size:15px;line-height:1.6;">
    Thank you &mdash; we have received your payment details and passed them to our finance desk for verification.
  </p>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${BORDER};border-radius:10px;padding:4px 16px;margin-bottom:20px;">
    ${row('Reference', `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${esc(reference)}</span>`)}
    ${row('Amount reported', formatUsd(amountReported), { strong: true })}
    ${providerReference ? row('Your receipt reference', `<span style="font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${esc(providerReference)}</span>`) : ''}
  </table>

  <p style="margin:0 0 8px;color:${BODY};font-size:14px;line-height:1.65;">
    <strong>What happens next.</strong> Our finance desk confirms the payment against EAN's records, then your official
    confirmation and delegate pass are issued &mdash; normally within one business day.
  </p>
  <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
    You do not need to do anything else. If anything does not match, we will contact you on this address.
  </p>
</td></tr>`

  const text = [
    `Hello ${firstName},`,
    ``,
    `Thank you - we have received your payment details and passed them to our finance desk for verification.`,
    ``,
    `Reference:       ${reference}`,
    `Amount reported: ${formatUsd(amountReported)}`,
    ...(providerReference ? [`Your receipt ref: ${providerReference}`] : []),
    ``,
    `What happens next: our finance desk confirms the payment against EAN's records, then your`,
    `official confirmation and delegate pass are issued - normally within one business day.`,
    ``,
    `You do not need to do anything else.`,
  ].join('\n')

  return {
    subject: `Payment details received — verifying now (${reference})`,
    html: shell(inner),
    text,
  }
}

export interface DiscountCodeEmailData {
  name: string
  code: string
  /** Human label from the discount_codes row, e.g. "Early Bird Discount". */
  label: string
  /** e.g. "10%" for a percent code, "$25.00" for a fixed one. */
  valueText: string
  /** Null when the code has no end date. */
  validUntil: Date | null
  /** Deep link that prefills the code on the registration form. */
  registerUrl: string
}

/**
 * Delivers a discount code issued by the stand interest form.
 *
 * Exists because that form previously showed the code on one success screen
 * and nowhere else — close the tab and it was gone, recoverable only by
 * querying the interests table. A lead who loses their code is a lead who
 * either pays full price or does not come back.
 *
 * Values and expiry are passed in from the live discount_codes row rather
 * than hardcoded: the percentages have already drifted out of sync with the
 * database twice, and an email promising 10% after the campaign closed is
 * worse than no email.
 */
export function discountCodeIssuedEmail(data: DiscountCodeEmailData) {
  const { name, code, label, valueText, validUntil, registerUrl } = data
  const firstName = name.split(' ')[0] || name

  const expiryLine = validUntil
    ? `Valid until ${formatDeadline(validUntil)}`
    : 'No expiry date set'

  const inner = `
<tr><td style="padding:28px 28px 8px;">
  <p style="margin:0 0 14px;color:${BODY};font-size:15px;line-height:1.6;">
    Hello ${esc(firstName)},
  </p>
  <p style="margin:0 0 20px;color:${BODY};font-size:15px;line-height:1.6;">
    Thank you for your interest in NBAC 2027. Here is your discount code &mdash; keep this email,
    you will need the code when you register.
  </p>

  <div style="border:2px dashed ${GOLD};border-radius:10px;padding:20px;text-align:center;margin-bottom:18px;background:#fdf8ef;">
    <div style="color:${MUTED};font-size:11px;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">${esc(label)}</div>
    <div style="color:${INK};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:26px;font-weight:800;letter-spacing:2px;margin:8px 0 4px;">${esc(code)}</div>
    <div style="color:${GOLD};font-size:14px;font-weight:700;">${esc(valueText)} off your delegate pass</div>
    <div style="color:${MUTED};font-size:11px;margin-top:6px;">${esc(expiryLine)}</div>
  </div>
</td></tr>

<tr><td style="padding:4px 28px 4px;" align="center">
  <a href="${registerUrl}" style="display:inline-block;background:${GOLD};color:${INK};text-decoration:none;font-weight:700;font-size:15px;padding:14px 34px;border-radius:8px;">Register and apply my code</a>
  <div style="color:${MUTED};font-size:11px;margin-top:10px;">This link fills the code in for you.</div>
</td></tr>

<tr><td style="padding:22px 28px 28px;">
  <p style="margin:0 0 8px;color:${BODY};font-size:14px;line-height:1.65;">
    <strong>Registering your interest does not reserve a pass.</strong> To secure your place you need to
    complete the registration form, where your code is applied and you are given the exact amount to pay.
  </p>
  <p style="margin:0;color:${MUTED};font-size:12px;line-height:1.6;">
    Codes cannot be combined, and each expires on the date shown above.
  </p>
</td></tr>`

  const text = [
    `Hello ${firstName},`,
    ``,
    `Thank you for your interest in NBAC 2027. Here is your discount code - keep this email,`,
    `you will need the code when you register.`,
    ``,
    `${label}`,
    `CODE: ${code}`,
    `${valueText} off your delegate pass`,
    expiryLine,
    ``,
    `Register and apply your code: ${registerUrl}`,
    `(this link fills the code in for you)`,
    ``,
    `Registering your interest does not reserve a pass. To secure your place you need to`,
    `complete the registration form, where your code is applied and you are given the exact`,
    `amount to pay.`,
    ``,
    `Codes cannot be combined, and each expires on the date shown above.`,
  ].join('\n')

  return {
    subject: `Your NBAC 2027 discount code: ${code} (${valueText} off)`,
    html: shell(inner),
    text,
  }
}
