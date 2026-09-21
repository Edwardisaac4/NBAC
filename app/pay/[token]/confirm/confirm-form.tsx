'use client'

import { useState } from 'react'
import { CheckCircle2, Receipt, Mail, Coins, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/shared/toast'

/**
 * Lets a delegate tell us they have transferred.
 *
 * Deliberately a single button with everything else folded away. Payments
 * land in an NBAC-dedicated GTB account, so every credit on that statement is
 * a delegate and the narration identifies which one — meaning this page is a
 * shortcut for reconciliation, never the mechanism. A delegate who ignores it
 * is still found on the statement, so asking them to fill four boxes after
 * they have already paid buys us very little and costs us completions.
 *
 * The optional details still earn their place for the awkward cases: a
 * finance officer paying from a company account, a wire that arrived short
 * after correspondent charges, or someone who forgot the narration.
 */
export function ConfirmForm({
  token,
  registeredEmail,
  expectedAmount,
  expectedAmountNgn,
}: {
  token: string
  registeredEmail: string
  /** USD figure locked at registration. */
  expectedAmount: number
  /** Naira figure locked at registration, or null if none was quoted. */
  expectedAmountNgn: number | null
}) {
  const toast = useToast()
  const [bankAccount, setBankAccount] = useState<'NGN' | 'USD'>(
    expectedAmountNgn ? 'NGN' : 'USD',
  )
  const [providerReference, setProviderReference] = useState('')
  const [payerEmail, setPayerEmail] = useState(registeredEmail)
  const [amountPaid, setAmountPaid] = useState('')
  const [note, setNote] = useState('')
  const [showDetails, setShowDetails] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  // Blank means "the amount you asked for". Prefilling the box invites people
  // to leave a wrong figure in place, and an unedited default tells us nothing
  // the reservation does not already say.
  const amountPlaceholder =
    bankAccount === 'NGN' && expectedAmountNgn
      ? String(expectedAmountNgn)
      : expectedAmount.toFixed(2)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)

    try {
      const response = await fetch('/api/pay/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          bankAccount,
          providerReference: providerReference.trim() || undefined,
          payerEmail: payerEmail.trim() || undefined,
          amountPaid: amountPaid.trim() || undefined,
          note: note.trim() || undefined,
        }),
      })

      const result = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(result?.error || 'We could not record your confirmation.')
      }

      setDone(true)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'We could not record your confirmation.'
      toast.error('Not recorded', { description: message })
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="bg-nbac-panel border border-nbac-emerald/40 rounded-2xl p-8 text-center space-y-4">
        <div className="flex justify-center">
          <div className="p-3 rounded-full bg-nbac-emerald/10 border border-nbac-emerald/30">
            <CheckCircle2 className="h-9 w-9 text-nbac-emerald" />
          </div>
        </div>
        <h2 className="font-display text-xl font-bold text-nbac-text">
          Thank you — that&rsquo;s noted
        </h2>
        {/* Careful wording: nothing has been verified at this point. */}
        <p className="font-sans text-xs text-nbac-muted leading-relaxed">
          We&rsquo;ll match your transfer against our account. Local transfers
          usually show within a few hours; an international wire can take two to
          five working days. Your delegate pass follows once it clears.
          <br />
          <br />
          Please don&rsquo;t transfer again. We&rsquo;ll email you if anything
          doesn&rsquo;t match.
        </p>
      </div>
    )
  }

  const inputClass =
    'w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all'
  const labelClass =
    'font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5'

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-nbac-panel/80 border border-nbac-border rounded-2xl p-6 sm:p-8 space-y-5"
    >
      {/* The whole form in one tap. Everything below is optional. */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-nbac-emerald text-[#0b0f10] font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2.5 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110 cursor-pointer"
      >
        {submitting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            Recording…
          </>
        ) : (
          <>
            <CheckCircle2 size={14} />
            Yes, I&rsquo;ve made this transfer
          </>
        )}
      </button>

      <p className="font-sans text-[11px] text-nbac-muted leading-relaxed text-center">
        That&rsquo;s all we need. The details below only help us find your
        payment faster if something is unusual.
      </p>

      <button
        type="button"
        onClick={() => setShowDetails((v) => !v)}
        aria-expanded={showDetails}
        className="w-full flex items-center justify-center gap-1.5 font-sans text-[11px] font-bold uppercase tracking-wider text-nbac-muted hover:text-nbac-body transition-colors cursor-pointer pt-1"
      >
        <span>Add transfer details (optional)</span>
        <ChevronDown
          size={13}
          className={cn('transition-transform', showDetails && 'rotate-180')}
        />
      </button>

      {showDetails && (
        <div className="space-y-6 pt-2 border-t border-nbac-border/60">
          {expectedAmountNgn && (
            <div className="space-y-2">
              <span className={labelClass}>Which account did you pay into?</span>
              <div className="grid grid-cols-2 gap-2">
                {(['NGN', 'USD'] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setBankAccount(option)}
                    className={cn(
                      'font-sans text-xs font-bold uppercase tracking-wider py-3 rounded-lg border transition-all cursor-pointer',
                      bankAccount === option
                        ? 'border-nbac-emerald bg-nbac-emerald/10 text-nbac-emerald-light'
                        : 'border-nbac-border text-nbac-muted hover:text-nbac-body',
                    )}
                  >
                    {option === 'NGN' ? 'Naira account' : 'US dollar account'}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="providerReference" className={labelClass}>
              <Receipt size={13} className="text-nbac-emerald-light" />
              Bank transaction reference
            </label>
            <input
              id="providerReference"
              type="text"
              value={providerReference}
              onChange={(e) => setProviderReference(e.target.value)}
              placeholder="From your transfer receipt or alert"
              autoComplete="off"
              spellCheck={false}
              className={cn(inputClass, 'font-mono tracking-wider')}
            />
            <p className="font-sans text-[11px] text-nbac-muted leading-relaxed">
              Your bank gives every transfer a reference. Leave it blank if you
              can&rsquo;t find it.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="payerEmail" className={labelClass}>
              <Mail size={13} className="text-nbac-emerald-light" />
              Who paid?
            </label>
            <input
              id="payerEmail"
              type="email"
              value={payerEmail}
              onChange={(e) => setPayerEmail(e.target.value)}
              placeholder="e.g. finance@yourcompany.com"
              className={inputClass}
            />
            <p className="font-sans text-[11px] text-nbac-muted leading-relaxed">
              Change this if a colleague or your finance team paid for you.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="amountPaid" className={labelClass}>
              <Coins size={13} className="text-nbac-emerald-light" />
              Amount sent ({bankAccount})
            </label>
            <input
              id="amountPaid"
              type="text"
              inputMode="decimal"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              placeholder={amountPlaceholder}
              className={cn(inputClass, 'tabular-nums')}
            />
            <p className="font-sans text-[11px] text-nbac-muted leading-relaxed">
              Only fill this in if you sent a different figure. Telling us now is
              far easier than sorting out a mismatch later.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="note" className={labelClass}>
              Anything we should know?
            </label>
            <textarea
              id="note"
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. I forgot the narration, or I paid for two delegates together"
              className={cn(inputClass, 'resize-none')}
            />
          </div>
        </div>
      )}
    </form>
  )
}
