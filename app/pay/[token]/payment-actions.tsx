'use client'

import { useRef, useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Copy controls for bank transfer details.
 *
 * EAN's Paystack terminal began rejecting cards in September 2026, so there
 * is no longer a hand-off to an external page — the delegate copies an
 * account number, an amount and a narration into their own banking app. Every
 * one of those is a value that fails silently if mistyped: a wrong narration
 * makes the credit unattributable, a wrong amount reads as an underpayment.
 *
 * The first copy also stamps payment_status -> 'initiated'. With a card
 * hand-off the click-through was that signal; with a transfer, reaching for
 * the account number is the closest equivalent we get, and it is what builds
 * the chase-up list.
 */
export function CopyField({
  label,
  value,
  token,
  mono = true,
  emphasis = false,
}: {
  label: string
  value: string
  /** Present on the fields worth treating as intent-to-pay. */
  token?: string
  mono?: boolean
  emphasis?: boolean
}) {
  const [copied, setCopied] = useState(false)
  // One stamp per page view is plenty; the route is idempotent regardless.
  const stamped = useRef(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Blocked in some in-app browsers. Every value is displayed in full as
      // selectable text, so copying is a convenience, never a dependency.
    }

    if (token && !stamped.current) {
      stamped.current = true
      try {
        // Fire and forget: a failed stamp costs us a row on the chase-up
        // list, never a payment.
        await fetch('/api/pay/initiate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        })
      } catch {
        // Ignored deliberately — see above.
      }
    }
  }

  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b border-nbac-border/50 last:border-0">
      <div className="min-w-0 flex-1">
        <div className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted font-semibold">
          {label}
        </div>
        <div
          className={cn(
            'break-words',
            mono ? 'font-mono' : 'font-sans',
            emphasis
              ? 'text-nbac-gold font-bold text-base'
              : 'text-nbac-text text-sm',
          )}
        >
          {value}
        </div>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy ${label}`}
        className={cn(
          'shrink-0 mt-1 inline-flex items-center gap-1.5 font-sans text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-md border transition-all cursor-pointer',
          copied
            ? 'border-nbac-emerald/60 text-nbac-emerald-light bg-nbac-emerald/10'
            : 'border-nbac-border text-nbac-muted hover:text-nbac-text hover:border-nbac-gold/50',
        )}
      >
        {copied ? <Check size={11} /> : <Copy size={11} />}
        <span>{copied ? 'Copied' : 'Copy'}</span>
      </button>
    </div>
  )
}
