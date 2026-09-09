import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatUsd } from '@/lib/pricing'
import { ConfirmForm } from './confirm-form'

/**
 * Delegate self-report of a completed payment.
 *
 * Necessary because EAN's Paystack page returns the delegate to Paystack's own
 * success screen, not ours, and we hold no API keys to query the transaction.
 * Without this step the only record of a payment is in a dashboard we cannot
 * read, so a delegate could pay and we would never know until finance exports
 * a spreadsheet.
 *
 * What this produces is a CLAIM, never a confirmation — see /api/pay/confirm.
 */

export const dynamic = 'force-dynamic'

interface Reservation {
  name: string
  email: string
  reference: string
  expected_total: number | null
  amount: number
  payment_status: string
}

export default async function ConfirmPaymentPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params

  const supabase = createAdminClient()
  if (!supabase) {
    throw new Error('Payment service unavailable: Supabase credentials missing.')
  }

  const { data, error } = await supabase
    .from('reservations')
    .select('name, email, reference, expected_total, amount, payment_status')
    .eq('pay_token', token)
    .maybeSingle<Reservation>()

  if (error) {
    console.error('[pay/confirm] reservation lookup failed:', error.message)
    throw new Error('Could not load your booking. Please try again.')
  }
  if (!data) notFound()

  const amountDue = Number(data.expected_total ?? data.amount)
  const alreadyReported =
    data.payment_status === 'claimed' ||
    data.payment_status === 'verified' ||
    data.payment_status === 'waived'

  return (
    <>
      <Navbar />

      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-16 md:pb-24">
        <section className="max-w-xl mx-auto px-6 w-full">
          <div className="mb-6">
            <Link
              href={`/pay/${token}`}
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-nbac-muted hover:text-nbac-emerald transition-colors group"
            >
              <ArrowLeft
                size={14}
                className="transition-transform group-hover:-translate-x-1"
              />
              <span>Back to payment</span>
            </Link>
          </div>

          <div className="text-center space-y-2 mb-8">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
              Confirm Payment
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Tell us you&rsquo;ve paid
            </h1>
            <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
              {data.name} &middot;{' '}
              <span className="font-mono text-nbac-muted">{data.reference}</span>
              <br />
              Expected: <strong className="text-nbac-text">{formatUsd(amountDue)}</strong>
            </p>
          </div>

          {alreadyReported ? (
            <div className="bg-nbac-panel border border-nbac-gold/40 rounded-2xl p-8 text-center space-y-3">
              <p className="font-sans text-base text-nbac-text">
                We already have your payment details on file.
              </p>
              <p className="font-sans text-xs text-nbac-muted leading-relaxed">
                There is nothing more to submit. Our finance desk is verifying
                against EAN&rsquo;s records and your pass will be issued to{' '}
                <strong className="text-nbac-body">{data.email}</strong> once
                confirmed.
              </p>
            </div>
          ) : (
            <ConfirmForm
              token={token}
              registeredEmail={data.email}
              expectedAmount={amountDue}
            />
          )}
        </section>
      </main>

      <Footer />
    </>
  )
}
