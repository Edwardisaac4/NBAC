/**
 * Canonical absolute site URL.
 *
 * NEXT_PUBLIC_SITE_URL is set to a bare host ("nbac.com.ng") with no scheme,
 * while app/sitemap.ts, app/robots.ts and four other files hardcode
 * "https://nbac.com.ng". That was harmless while nothing depended on it, but
 * every payment email embeds an absolute link — a delegate mailed
 * "nbac.com.ng/pay/abc" gets a URL some clients will not linkify and none
 * will trust.
 *
 * Normalises whatever is configured into a scheme-qualified origin with no
 * trailing slash.
 */
const FALLBACK_ORIGIN = 'https://nbac.com.ng'

export function siteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (!configured) return FALLBACK_ORIGIN

  const withScheme = /^https?:\/\//i.test(configured)
    ? configured
    : `https://${configured}`

  return withScheme.replace(/\/+$/, '')
}

/** Absolute URL for a path, e.g. absoluteUrl('/pay/abc') */
export function absoluteUrl(path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`
  return `${siteOrigin()}${suffix}`
}

/** The delegate's payment instruction page — never the raw Paystack link. */
export function payUrl(token: string): string {
  return absoluteUrl(`/pay/${token}`)
}

export function payConfirmUrl(token: string): string {
  return absoluteUrl(`/pay/${token}/confirm`)
}

/**
 * The EAN-owned Paystack payment page delegates are sent to.
 *
 * A shared terminal collecting USD for all of EAN, with a free-entry amount
 * box and no reference field. Public URL, not a secret — held in env only so
 * finance can change it without a code change.
 */
export function paystackPaymentUrl(): string {
  return (
    process.env.PAYSTACK_PAYMENT_URL?.trim() ||
    'https://paystack.shop/pay/vt_5bg1h217'
  )
}
