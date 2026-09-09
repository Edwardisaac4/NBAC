import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatUsd } from '@/lib/pricing'
import { paystackPaymentUrl } from '@/lib/site'
import { PaymentActions } from './payment-actions'

/**
 * Delegate payment instruction page.
 *
 * Sits between the delegate and EAN's Paystack terminal for two reasons:
 *
 *  1. It records the click-through (payment_status -> 'initiated'). We hold no
 *     Paystack API keys, so this is the only signal we ever get that somebody
 *     intended to pay — it becomes the chase-up list.
 *  2. That terminal has a FREE-ENTRY amount box pre-filled with a sample
 *     figure. Sending a delegate straight there is how you collect $1,000
 *     instead of $225. This page's whole job is to make the exact figure
 *     impossible to miss and trivial to copy.
 *
 * Addressed by pay_token, never by `reference`: the reference is a ~90k search
 * space and would let anyone enumerate delegate names, emails and amounts.
 */

// Reads live payment state — must never be prerendered or cached.
export const dynamic = 'force-dynamic'

interface Reservation {
  id: string
  name: string
  email: string
  company: string | null
  tier: string
  reference: string
  delegate_count: number
  currency: string
  gross_amount: number | null
  discount_code: string | null
  discount_amount: number | null
  expected_total: number | null
  amount: number
  payment_status: string
  payment_deadline: string | null
}

function formatDeadline(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'long',
    timeZone: 'Africa/Lagos',
  }).format(new Date(iso))
}

/**
 * Kept out of the component body: reading the clock inside render trips the
 * purity rule. This page is force-dynamic and server-rendered per request, so
 * evaluating it per render is the intended behaviour.
 */
function isPastDeadline(iso: string | null): boolean {
  if (!iso) return false
  return new Date(iso).getTime() < Date.now()
}

export default async function PayPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = createAdminClient()
  if (!supabase) {
    throw new Error('Payment service unavailable: Supabase credentials missing.')
  }

  // Service role: `reservations` holds delegate PII and has no anon read policy.
  const { data, error } = await supabase
    .from('reservations')
    .select(
      'id, name, email, company, tier, reference, delegate_count, currency, gross_amount, discount_code, discount_amount, expected_total, amount, payment_status, payment_deadline'
    )
    .eq('pay_token', token)
    .maybeSingle<Reservation>()

  if (error) {
    console.error('[pay] reservation lookup failed:', error.message)
    throw new Error('Could not load your payment details. Please try again.')
  }
  if (!data) notFound()

  // expected_total is authoritative; `amount` is the legacy column kept in step
  // with it, and only used if a pre-migration row somehow reaches this page.
  const amountDue = Number(data.expected_total ?? data.amount)
  const grossAmount = Number(data.gross_amount ?? amountDue)
  const discountAmount = Number(data.discount_amount ?? 0)
  const amountText = formatUsd(amountDue)

  const isSettled = data.payment_status === 'verified'
  const isClaimed = data.payment_status === 'claimed'
  const isWaived = data.payment_status === 'waived'
  const isExpired = isPastDeadline(data.payment_deadline) && !isSettled && !isClaimed

  return (
    <>
      <Navbar />

      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-16 md:pb-24">
        <section className="max-w-2xl mx-auto px-6 w-full">
          {/* Header */}
          <div className="text-center space-y-2 mb-8">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
              Delegate Payment
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              {isSettled
                ? 'Payment Confirmed'
                : isClaimed
                  ? 'Payment Being Verified'
                  : isWaived
                    ? 'Nothing To Pay'
                    : 'Complete Your Payment'}
            </h1>
            <p className="font-sans text-sm text-nbac-body font-light">
              {data.name} &middot;{' '}
              <span className="font-mono text-nbac-muted">{data.reference}</span>
            </p>
          </div>

          {/* ── Terminal states ───────────────────────────────────────────── */}
          {isSettled || isWaived ? (
            <div className="bg-nbac-panel border border-nbac-emerald/40 rounded-2xl p-8 text-center space-y-3">
              <p className="font-sans text-base text-nbac-text">
                {isWaived
                  ? 'Your pass has been issued at no charge. No payment is required.'
                  : `We have confirmed ${amountText} against your registration.`}
              </p>
              <p className="font-sans text-xs text-nbac-muted leading-relaxed">
                Your delegate pass and joining instructions are on their way to{' '}
                <strong className="text-nbac-body">{data.email}</strong>. Nothing
                further is needed from you.
              </p>
            </div>
          ) : isClaimed ? (
            /* Deliberately does NOT say "paid". Nobody has verified that money
               arrived — we cannot see EAN's Paystack account. */
            <div className="bg-nbac-panel border border-nbac-gold/40 rounded-2xl p-8 text-center space-y-3">
              <p className="font-sans text-base text-nbac-text">
                Thank you — your payment details are with our finance desk.
              </p>
              <p className="font-sans text-xs text-nbac-muted leading-relaxed">
                Verification against EAN&rsquo;s records normally completes within one
                business day, after which your pass is issued to{' '}
                <strong className="text-nbac-body">{data.email}</strong>.
                <br />
                <br />
                Please do not pay again. If something looks wrong, reply to your
                registration email and we will sort it out.
              </p>
            </div>
          ) : (
            <>
              {/* ── The amount. The single most important element here. ──── */}
              <div className="bg-nbac-panel border-2 border-nbac-gold rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted block">
                  Amount to pay
                </span>
                <div className="font-display text-5xl sm:text-6xl font-extrabold text-nbac-gold tracking-tight my-2 tabular-nums">
                  {amountText}
                </div>
                <span className="font-sans text-xs text-nbac-body">
                  {data.tier} &middot; {data.delegate_count}{' '}
                  {data.delegate_count === 1 ? 'delegate' : 'delegates'}
                </span>

                <PaymentActions
                  token={token}
                  amountValue={amountDue.toFixed(2)}
                  amountText={amountText}
                  paystackUrl={paystackPaymentUrl()}
                  isExpired={isExpired}
                />
              </div>

              {/* ── The warning that stops wrong-amount payments ─────────── */}
              <div className="mt-5 bg-nbac-alt/60 border-l-4 border-nbac-amber rounded-r-lg p-4 sm:p-5 space-y-2.5">
                <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-amber">
                  Before you pay — please read
                </h2>
                <ul className="space-y-2 font-sans text-xs text-nbac-body leading-relaxed">
                  <li className="flex gap-2">
                    <span className="text-nbac-amber font-bold shrink-0">1.</span>
                    <span>
                      The payment page asks you to <strong>type the amount yourself</strong>,
                      and shows a sample figure already in the box.{' '}
                      <strong className="text-nbac-text">
                        Clear it and enter exactly {amountText}
                      </strong>{' '}
                      — including the decimals. Do not round.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nbac-amber font-bold shrink-0">2.</span>
                    <span>
                      Please pay using{' '}
                      <strong className="text-nbac-text">{data.email}</strong> if you
                      can. If a colleague or your finance team pays on your behalf,
                      tell us afterwards so we can match the payment to your booking.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-nbac-amber font-bold shrink-0">3.</span>
                    <span>
                      Your card receipt will come from{' '}
                      <strong className="text-nbac-text">EAN Aviation Ltd</strong>, the
                      organiser of NBAC 2027. That is expected, not an error.
                    </span>
                  </li>
                </ul>
              </div>

              {/* ── Breakdown ────────────────────────────────────────────── */}
              <div className="mt-5 bg-nbac-panel/60 border border-nbac-border rounded-lg p-5 space-y-2.5">
                <div className="flex justify-between text-xs">
                  <span className="text-nbac-muted">Standard total</span>
                  <span className="text-nbac-text font-semibold tabular-nums">
                    {formatUsd(grossAmount)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-nbac-gold-light border-t border-nbac-border/60 pt-2.5">
                    <span className="flex items-center gap-1.5">
                      Discount
                      {data.discount_code && (
                        <span className="font-mono text-[10px] text-nbac-muted">
                          ({data.discount_code})
                        </span>
                      )}
                    </span>
                    <span className="tabular-nums">
                      &minus;{formatUsd(discountAmount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm border-t border-nbac-border pt-2.5">
                  <span className="text-nbac-muted uppercase tracking-wider text-[10px] font-bold self-center">
                    Total due
                  </span>
                  <span className="text-nbac-gold font-bold tabular-nums">
                    {amountText}
                  </span>
                </div>
              </div>

              {isExpired ? (
                <p className="mt-5 text-center font-sans text-xs text-nbac-amber leading-relaxed">
                  This payment reference lapsed on{' '}
                  {formatDeadline(data.payment_deadline as string)}. Please reply to
                  your registration email and our delegate desk will reissue it at
                  current pricing.
                </p>
              ) : (
                data.payment_deadline && (
                  <p className="mt-5 text-center font-sans text-xs text-nbac-muted">
                    This price is held until{' '}
                    <strong className="text-nbac-body">
                      {formatDeadline(data.payment_deadline)}
                    </strong>
                    .
                  </p>
                )
              )}

              {/* Already paid? Route them to self-report rather than pay twice. */}
              <div className="mt-8 pt-6 border-t border-nbac-border text-center">
                <p className="font-sans text-xs text-nbac-muted mb-2">
                  Already completed this payment?
                </p>
                <Link
                  href={`/pay/${token}/confirm`}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-emerald-light hover:text-nbac-emerald underline underline-offset-4"
                >
                  Confirm your payment here
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
