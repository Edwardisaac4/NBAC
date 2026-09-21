import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatUsd, formatNgn } from '@/lib/pricing'
import { usdAccount, ngnAccount, paystackEnabled } from '@/lib/bank'
import { paystackPaymentUrl } from '@/lib/site'
import { CopyField } from './payment-actions'

/**
 * Delegate payment instruction page.
 *
 * EAN's Paystack terminal began rejecting cards in September 2026, so
 * delegates now transfer into an NBAC-dedicated GTB account — USD through a
 * Citibank New York correspondent, or naira directly.
 *
 * Two things this page exists to get right:
 *
 *  1. THE NARRATION. A bank transfer carries a description the payer types
 *     themselves — the reference field the Paystack terminal never had. Get
 *     it filled in and a statement line identifies its delegate outright;
 *     leave it blank and the credit is anonymous. It is the single most
 *     important instruction here, so it sits above the account details
 *     rather than below them.
 *  2. THE EXACT AMOUNT, in the currency of whichever account they use. The
 *     naira figure was locked onto the reservation at registration, so it
 *     does not drift with the rate between quoting and paying.
 *
 * Addressed by pay_token, never by `reference`: the reference is quoted over
 * the phone and printed on statements, and must not also be the thing that
 * unlocks a delegate's name, email, amount and our account details.
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
  expected_total_ngn: number | null
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
      'id, name, email, company, tier, reference, delegate_count, currency, gross_amount, discount_code, discount_amount, expected_total, expected_total_ngn, amount, payment_status, payment_deadline'
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

  // Locked at registration. Null on rows written before migration 007, or
  // when no rate row was configured — in which case only USD is offered,
  // rather than quoting a naira figure we cannot stand behind.
  const ngnDue = data.expected_total_ngn ? Number(data.expected_total_ngn) : null
  const ngnText = ngnDue ? formatNgn(ngnDue) : null

  const usd = usdAccount()
  const ngn = ngnDue ? ngnAccount() : null
  // What THIS delegate can actually be offered, which is not the same question
  // as whether any account exists in the environment: the naira account is only
  // shown when a naira figure was locked at registration. Asking the broader
  // question rendered "transfer to one of these accounts" above nothing at all
  // whenever only the NGN account was configured and no rate had been locked.
  const accountsConfigured = Boolean(usd || ngn || paystackEnabled())

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
            /* Deliberately does NOT say "paid". Nobody has confirmed the money
               landed — that happens against the account statement. */
            <div className="bg-nbac-panel border border-nbac-gold/40 rounded-2xl p-8 text-center space-y-3">
              <p className="font-sans text-base text-nbac-text">
                Thank you — your transfer details are with our finance desk.
              </p>
              <p className="font-sans text-xs text-nbac-muted leading-relaxed">
                Local transfers usually clear within a few hours; an
                international wire can take two to five working days. Once it
                shows against our account your pass is issued to{' '}
                <strong className="text-nbac-body">{data.email}</strong>.
                <br />
                <br />
                Please do not transfer again. If something looks wrong, reply to
                your registration email and we will sort it out.
              </p>
            </div>
          ) : !accountsConfigured ? (
            /* Never render half a set of wire instructions. */
            <div className="bg-nbac-panel border border-nbac-amber/40 rounded-2xl p-8 text-center space-y-3">
              <p className="font-sans text-base text-nbac-text">
                Payment details are not available on this page right now.
              </p>
              <p className="font-sans text-xs text-nbac-muted leading-relaxed">
                Please reply to your registration email quoting{' '}
                <span className="font-mono text-nbac-body">{data.reference}</span>{' '}
                and our delegate desk will send them to you directly.
              </p>
            </div>
          ) : (
            <>
              {/* ── The amount. The single most important figure here. ────── */}
              <div className="bg-nbac-panel border-2 border-nbac-gold rounded-2xl p-6 sm:p-8 text-center shadow-2xl">
                <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted block">
                  Amount to pay
                </span>
                <div className="font-display text-5xl sm:text-6xl font-extrabold text-nbac-gold tracking-tight my-2 tabular-nums">
                  {amountText}
                </div>
                {ngnText && (
                  <div className="font-sans text-sm text-nbac-body">
                    or{' '}
                    <strong className="text-nbac-text font-mono tabular-nums">
                      {ngnText}
                    </strong>{' '}
                    if paying in naira
                  </div>
                )}
                <span className="font-sans text-xs text-nbac-muted block mt-2">
                  {data.tier} &middot; {data.delegate_count}{' '}
                  {data.delegate_count === 1 ? 'delegate' : 'delegates'}
                </span>
              </div>

              {/* ── The narration. Above the accounts on purpose. ─────────── */}
              {!isExpired && (
                <div className="mt-5 bg-nbac-emerald/10 border-2 border-nbac-emerald/50 rounded-xl p-5">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-emerald-light mb-1">
                    Step 1 &mdash; use this as your narration
                  </h2>
                  <p className="font-sans text-xs text-nbac-body leading-relaxed mb-3">
                    Your bank will ask for a description, narration or reference
                    for the transfer. Enter this exactly. It is how we match
                    your payment to your registration.
                  </p>
                  <div className="bg-nbac-canvas/60 border border-nbac-emerald/30 rounded-lg px-4">
                    <CopyField
                      label="Transfer narration"
                      value={data.reference}
                      token={token}
                      emphasis
                    />
                  </div>
                </div>
              )}

              {/* ── The accounts ─────────────────────────────────────────── */}
              {!isExpired && (
                <div className="mt-5 space-y-5">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-gold-light">
                    Step 2 &mdash; transfer to one of these accounts
                  </h2>

                  {ngn && ngnDue && (
                    <div className="bg-nbac-panel border border-nbac-border rounded-xl p-5">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="font-display text-base font-bold text-nbac-text">
                          Naira account
                        </h3>
                        <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted">
                          Local transfer
                        </span>
                      </div>
                      <CopyField
                        label="Amount"
                        value={String(ngnDue)}
                        token={token}
                        emphasis
                      />
                      <CopyField
                        label="Account number"
                        value={ngn.accountNumber}
                        token={token}
                      />
                      <CopyField label="Account name" value={ngn.accountName} mono={false} />
                      <CopyField label="Bank" value={ngn.bank} mono={false} />
                    </div>
                  )}

                  {usd && (
                    <div className="bg-nbac-panel border border-nbac-border rounded-xl p-5">
                      <div className="flex items-baseline justify-between mb-2">
                        <h3 className="font-display text-base font-bold text-nbac-text">
                          US dollar account
                        </h3>
                        <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted">
                          International wire
                        </span>
                      </div>
                      <CopyField
                        label="Amount"
                        value={amountDue.toFixed(2)}
                        token={token}
                        emphasis
                      />
                      <CopyField
                        label="Beneficiary account"
                        value={usd.beneficiaryAccount}
                        token={token}
                      />
                      <CopyField
                        label="Beneficiary name"
                        value={usd.beneficiaryName}
                        mono={false}
                      />
                      <CopyField
                        label="Beneficiary bank"
                        value={usd.beneficiaryBank}
                        mono={false}
                      />
                      <CopyField label="Beneficiary SWIFT" value={usd.beneficiarySwift} />
                      <CopyField
                        label="Beneficiary address"
                        value={usd.beneficiaryAddress}
                        mono={false}
                      />
                      <CopyField
                        label="Correspondent bank"
                        value={usd.correspondentBank}
                        mono={false}
                      />
                      <CopyField
                        label="Correspondent SWIFT"
                        value={usd.correspondentSwift}
                      />
                      <CopyField label="ABA / routing number" value={usd.abaNumber} />
                      <CopyField
                        label="Correspondent account"
                        value={usd.correspondentAccount}
                      />
                    </div>
                  )}

                  {paystackEnabled() && (
                    <a
                      href={paystackPaymentUrl()}
                      className="block text-center font-sans text-xs font-bold uppercase tracking-wider text-nbac-gold hover:brightness-110 underline underline-offset-4"
                    >
                      Or pay by card instead
                    </a>
                  )}
                </div>
              )}

              {/* ── What actually goes wrong with transfers ───────────────── */}
              {!isExpired && (
                <div className="mt-5 bg-nbac-alt/60 border-l-4 border-nbac-amber rounded-r-lg p-4 sm:p-5 space-y-2.5">
                  <h2 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-amber">
                    Before you transfer &mdash; please read
                  </h2>
                  <ul className="space-y-2 font-sans text-xs text-nbac-body leading-relaxed">
                    <li className="flex gap-2">
                      <span className="text-nbac-amber font-bold shrink-0">1.</span>
                      <span>
                        Send{' '}
                        <strong className="text-nbac-text">
                          exactly {amountText}
                          {ngnText ? ` or ${ngnText}` : ''}
                        </strong>
                        . Do not round.
                      </span>
                    </li>
                    {usd && (
                      <li className="flex gap-2">
                        <span className="text-nbac-amber font-bold shrink-0">2.</span>
                        <span>
                          For the dollar wire, choose{' '}
                          <strong className="text-nbac-text">
                            &ldquo;all charges borne by sender&rdquo;
                          </strong>{' '}
                          (OUR). Intermediary banks deduct their fees along the
                          way, and a wire sent without this arrives short &mdash;
                          leaving a balance you would have to settle later.
                        </span>
                      </li>
                    )}
                    <li className="flex gap-2">
                      <span className="text-nbac-amber font-bold shrink-0">
                        {usd ? '3.' : '2.'}
                      </span>
                      <span>
                        Paying from a company or a colleague&rsquo;s account is
                        fine &mdash; just keep the narration above, and tell us
                        afterwards so we can match it.
                      </span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-nbac-amber font-bold shrink-0">
                        {usd ? '4.' : '3.'}
                      </span>
                      <span>
                        <strong className="text-nbac-text">
                          We will never email you different account details.
                        </strong>{' '}
                        If you receive a message changing these, it is not from
                        us &mdash; always come back to this page.
                      </span>
                    </li>
                  </ul>
                </div>
              )}

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
                    {ngnText && (
                      <span className="text-nbac-body font-normal"> / {ngnText}</span>
                    )}
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

              {/* Optional, and said so. The account statement is what actually
                  confirms a payment; this only speeds up the match. */}
              <div className="mt-8 pt-6 border-t border-nbac-border text-center">
                <p className="font-sans text-xs text-nbac-muted mb-2">
                  Already made this transfer?
                </p>
                <Link
                  href={`/pay/${token}/confirm`}
                  className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-emerald-light hover:text-nbac-emerald underline underline-offset-4"
                >
                  Let us know
                </Link>
                <p className="font-sans text-[11px] text-nbac-muted mt-2 leading-relaxed">
                  Optional &mdash; it helps us find your payment faster, but we
                  will spot it either way.
                </p>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
