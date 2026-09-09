'use client'

import { useState } from 'react'
import { Copy, Check, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Copy-the-amount control plus the hand-off to EAN's Paystack terminal.
 *
 * The copy button exists because the destination has a free-entry amount box
 * carrying a sample figure — a delegate who mistypes, rounds, or simply pays
 * the placeholder creates a reconciliation problem we cannot see for days,
 * since we have no API access to that Paystack account. Removing the typing
 * removes most of that class of error.
 */
export function PaymentActions({
  token,
  amountValue,
  amountText,
  paystackUrl,
  isExpired,
}: {
  token: string
  /** Bare digits for the clipboard, e.g. "225.00" — no currency symbol. */
  amountValue: string
  amountText: string
  paystackUrl: string
  isExpired: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(amountValue)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // Clipboard is blocked in some in-app browsers. The figure is displayed
      // in large type regardless, so this is a convenience, not a dependency.
    }
  }

  const handleContinue = async () => {
    setLeaving(true)
    try {
      // Records the click-through before we lose sight of the delegate. Fire
      // and continue: a failed stamp must never block a payment, it only
      // costs us a row on the chase-up list.
      await fetch('/api/pay/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
    } catch {
      // Ignored deliberately — see above.
    }
    window.location.href = paystackUrl
  }

  if (isExpired) return null

  return (
    <div className="mt-6 space-y-3">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'w-full inline-flex items-center justify-center gap-2 font-sans text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-lg border transition-all cursor-pointer',
          copied
            ? 'border-nbac-emerald/60 text-nbac-emerald-light bg-nbac-emerald/10'
            : 'border-nbac-border text-nbac-body hover:text-nbac-text hover:border-nbac-gold/50'
        )}
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
        <span>{copied ? `Copied ${amountValue}` : `Copy amount (${amountValue})`}</span>
      </button>

      <button
        type="button"
        onClick={handleContinue}
        disabled={leaving}
        className="w-full inline-flex items-center justify-center gap-2 bg-nbac-gold text-[#0b0f10] font-sans text-sm font-bold uppercase tracking-wider px-6 py-4 rounded-lg shadow-[0_4px_20px_rgba(197,160,89,0.3)] hover:brightness-110 transition-all disabled:opacity-70 disabled:cursor-wait cursor-pointer"
      >
        {leaving ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            <span>Opening secure payment…</span>
          </>
        ) : (
          <>
            <ExternalLink size={15} />
            <span>Continue to pay {amountText}</span>
          </>
        )}
      </button>
    </div>
  )
}
