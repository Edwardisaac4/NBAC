'use client'

import { useState } from 'react'
import { CheckCircle2, Receipt, Mail, Coins } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/shared/toast'

/**
 * Collects what a delegate can tell us about a payment we cannot see.
 *
 * The "which email did you pay with" field is the important one. Corporate
 * delegates routinely have an assistant or a finance officer pay on their
 * behalf, and when that happens the payer email in EAN's Paystack export
 * matches nobody in our reservations table. Without this field those payments
 * are unattributable; with it they reconcile on the first pass.
 */
export function ConfirmForm({
  token,
  registeredEmail,
  expectedAmount,
}: {
  token: string
  registeredEmail: string
  expectedAmount: number
}) {
  const toast = useToast()
  const [providerReference, setProviderReference] = useState('')
  const [payerEmail, setPayerEmail] = useState(registeredEmail)
  const [amountPaid, setAmountPaid] = useState(expectedAmount.toFixed(2))
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

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
          Thank you — details received
        </h2>
        {/* Careful wording: nothing has been verified at this point. */}
        <p className="font-sans text-xs text-nbac-muted leading-relaxed">
          Your payment details are with our finance desk for verification against
          EAN&rsquo;s records. Your official confirmation and delegate pass follow
          within one business day.
          <br />
          <br />
          Please don&rsquo;t pay again. We&rsquo;ll email you if anything doesn&rsquo;t match.
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
      className="bg-nbac-panel/80 border border-nbac-border rounded-2xl p-6 sm:p-8 space-y-6"
    >
      <div className="space-y-2">
        <label htmlFor="providerReference" className={labelClass}>
          <Receipt size={13} className="text-nbac-emerald-light" />
          Paystack receipt reference
        </label>
        <input
          id="providerReference"
          type="text"
          value={providerReference}
          onChange={(e) => setProviderReference(e.target.value)}
          placeholder="From the receipt email Paystack sent you"
          autoComplete="off"
          spellCheck={false}
          className={cn(inputClass, 'font-mono tracking-wider')}
        />
        <p className="font-sans text-[11px] text-nbac-muted leading-relaxed">
          Paystack emails a receipt to whoever paid. Pasting its reference lets us
          match your payment immediately — but leave it blank if you can&rsquo;t find it.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="payerEmail" className={labelClass}>
          <Mail size={13} className="text-nbac-emerald-light" />
          Which email was used to pay?
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
          Change this if a colleague or your finance team paid for you — it&rsquo;s how we
          find the payment.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="amountPaid" className={labelClass}>
          <Coins size={13} className="text-nbac-emerald-light" />
          Amount paid (USD)
        </label>
        <input
          id="amountPaid"
          type="text"
          inputMode="decimal"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
          className={cn(inputClass, 'tabular-nums')}
        />
        <p className="font-sans text-[11px] text-nbac-muted leading-relaxed">
          Correct this if you paid a different figure. Telling us now is far easier
          than sorting out a mismatch later.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="note" className={labelClass}>
          Anything we should know? (optional)
        </label>
        <textarea
          id="note"
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. paid by bank transfer instead, or paid for two delegates together"
          className={cn(inputClass, 'resize-none')}
        />
      </div>

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
            Submit payment details
          </>
        )}
      </button>
    </form>
  )
}
