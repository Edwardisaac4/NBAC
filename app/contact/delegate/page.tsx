'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, User, Phone, Plus, Minus, Lock, CheckCircle2, Landmark, ArrowLeft, CreditCard, Tag, Percent, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PASS_TIERS } from '@/lib/constants'
import { fetchTicketTiers } from '@/lib/supabase/dynamic-content'
import { PassTierDetails } from '@/types'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/shared/toast'

/**
 * Two decimal places throughout: a percentage coupon can produce a fractional
 * total (5% off $250 is $237.50), and the delegate has to type the exact
 * figure into a free-entry amount box on Paystack. Rounding it in the display
 * would have them typing a number we are not expecting.
 */
const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)

/** Shape returned by /api/discounts/validate — the only source of money figures. */
interface QuoteResponse {
  tierId: string
  tierName: string
  unitPrice: number
  quantity: number
  currency: string
  grossAmount: number
  discountCode: string | null
  discountLabel: string | null
  discountAmount: number
  netAmount: number
  codeStatus: string
  codeMessage: string | null
  autoPromo: {
    code: string
    label: string
    value: number
    validUntil: string | null
  } | null
}

export default function DelegateRegistrationPage() {
  const toast = useToast()
  const [tiers, setTiers] = useState<PassTierDetails[]>(PASS_TIERS)
  const [selectedTier, setSelectedTier] = useState<PassTierDetails | null>(null)
  const [isTierLocked, setIsTierLocked] = useState(false)

  // ── Coupon state ──────────────────────────────────────────────────────
  // All discount arithmetic lives on the server. This page only ever displays
  // figures returned by /api/discounts/validate, which calls the same
  // quotePrice() that /api/register/delegate charges with. The previous
  // version hardcoded `gross * 0.1` here alongside a separate rule in the API,
  // and the two disagreeing produced both live coupon faults: every delegate
  // silently getting 10% off, and NBAC27-EARLY5 holders quoted 5% but charged
  // full price.
  const [couponInput, setCouponInput] = useState('')
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [isPricing, setIsPricing] = useState(false)
  const [couponNotice, setCouponNotice] = useState<string | null>(null)
  const [submittedQuote, setSubmittedQuote] = useState<QuoteResponse | null>(null)
  const [payUrl, setPayUrl] = useState<string>('')

  useEffect(() => {
    let active = true
    const params = new URLSearchParams(window.location.search)
    const tierParam = params.get('tier')

    // ?code=NBAC27-EARLY5 prefills the coupon field, so the codes issued by
    // /api/interest can be delivered as a one-click link rather than asking
    // the recipient to retype them. The server still validates it.
    const codeParam = params.get('code')

    async function load() {
      const data = await fetchTicketTiers()
      if (!active) return

      // Applied here rather than in the effect body so the state update lands
      // after the await, outside the render commit.
      if (codeParam) {
        setCouponInput(codeParam.trim().toUpperCase())
      }

      const activeTiers = data && data.length > 0 ? data : PASS_TIERS
      setTiers(activeTiers)

      const foundTier = activeTiers.find(t => t.id === (tierParam || 'vip')) || activeTiers[0] || null
      if (foundTier) {
        setSelectedTier(foundTier)
        if (tierParam) {
          setIsTierLocked(true)
        }
      }
    }
    load()

    return () => {
      active = false
    }
  }, [])

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    specialRequirements: ''
  })

  const [delegateCount, setDelegateCount] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submittedTier, setSubmittedTier] = useState<PassTierDetails | null>(null)
  const [submittedDelegateCount, setSubmittedDelegateCount] = useState<number>(1)
  const [submittedReference, setSubmittedReference] = useState<string>('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tierId = e.target.value
    const foundTier = tiers.find(t => t.id === tierId)
    if (foundTier) {
      setSelectedTier(foundTier)
    }
  }

  const handleIncrement = () => {
    if (delegateCount < 10) setDelegateCount(prev => prev + 1)
  }

  const handleDecrement = () => {
    if (delegateCount > 1) setDelegateCount(prev => prev - 1)
  }

  const generateReference = (tierId: string) => {
    const prefix = `NBAC-2027-${tierId.toUpperCase()}`
    const random = Math.floor(10000 + Math.random() * 90000)
    return `${prefix}-${random}`
  }

  /**
   * Optimistic list price, shown only until the server quote lands. Never used
   * to compute a discount — that is the server's job exclusively.
   */
  const calculateGrossTotal = (tier: PassTierDetails | null, count: number) => {
    if (!tier) return 0
    return tier.price * count
  }

  const grossTotal = quote?.grossAmount ?? calculateGrossTotal(selectedTier, delegateCount)
  const discountAmount = quote?.discountAmount ?? 0
  const totalPayable = quote?.netAmount ?? grossTotal
  const appliedCode = quote?.discountCode ?? null
  const appliedLabel = quote?.discountLabel ?? null

  /**
   * Re-price against the server. Called on tier/quantity change and whenever a
   * coupon is applied or cleared.
   *
   * `code` omitted (undefined) means "no code typed", which lets the server
   * apply any blanket dated promo that is currently running. Passing an empty
   * string is the same thing — the server treats both as absent.
   */
  /**
   * Only the most recent quote may be applied. Clicking the delegate stepper
   * quickly fires overlapping requests, and without this an earlier response
   * can land last and show a total for a basket the delegate has moved on
   * from — which then differs from what the server charges.
   */
  const quoteSeq = useRef(0)

  /**
   * The email is sent with a quote so per-email coupon caps can be checked,
   * but it must not be a dependency of refreshQuote.
   *
   * refreshQuote is in the re-pricing effect's dependency array, so if the
   * callback were rebuilt on every keystroke the effect would re-run per
   * character typed into the email field — firing a pricing request each time
   * and tripping the endpoint's rate limit mid-typing. Reading through a ref
   * keeps the callback stable while still sending the current value.
   */
  const emailRef = useRef(formData.email)
  useEffect(() => {
    emailRef.current = formData.email
  }, [formData.email])

  const refreshQuote = React.useCallback(
    async (opts: { tier: PassTierDetails | null; count: number; code: string; announce?: boolean }) => {
      const { tier, count, code, announce = false } = opts
      if (!tier) return

      const seq = ++quoteSeq.current
      const isStale = () => seq !== quoteSeq.current

      setIsPricing(true)
      try {
        const response = await fetch('/api/discounts/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tier: tier.id,
            delegateCount: count,
            code: code.trim() || undefined,
            email: emailRef.current || undefined,
          }),
        })

        if (isStale()) return

        if (response.status === 429) {
          setCouponNotice('Too many attempts. Please wait a moment before trying another code.')
          return
        }

        if (!response.ok) {
          // Pricing is advisory here; the server re-prices authoritatively on
          // submit, so a failed quote must not block the form.
          console.warn('[delegate form] pricing request failed:', response.status)
          return
        }

        const data: QuoteResponse = await response.json()
        if (isStale()) return
        setQuote(data)

        if (data.codeStatus === 'applied' && code.trim()) {
          setCouponNotice(null)
          if (announce) {
            toast.success('Discount applied', {
              description: `${data.discountLabel} — you save ${formatPrice(data.discountAmount)}.`,
            })
          }
        } else if (code.trim() && data.codeMessage) {
          setCouponNotice(data.codeMessage)
          if (announce) {
            toast.error('Code not applied', { description: data.codeMessage })
          }
        } else {
          setCouponNotice(null)
        }
      } catch (err) {
        console.warn('[delegate form] pricing request errored:', err)
      } finally {
        if (!isStale()) setIsPricing(false)
      }
    },
    // Deliberately stable: the email is read from emailRef, not captured here.
    [toast]
  )

  // Re-price whenever the basket changes, debounced so that walking the
  // delegate stepper from 1 to 8 sends one request for the final quantity
  // rather than eight. quoteSeq already stops a stale response from being
  // displayed, but the requests themselves still count against the
  // endpoint's rate limit and would lock the delegate out mid-edit.
  //
  // The timer also keeps the first setState off the render commit, which the
  // previous microtask deferral was there for.
  useEffect(() => {
    if (!selectedTier) return
    let active = true

    const timer = setTimeout(() => {
      if (!active) return
      void refreshQuote({ tier: selectedTier, count: delegateCount, code: couponInput })
    }, 400)

    return () => {
      active = false
      clearTimeout(timer)
    }
    // couponInput intentionally excluded: codes apply on explicit submit only,
    // so that typing a partial code does not fire a request per keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTier, delegateCount, refreshQuote])

  const handleApplyCoupon = () => {
    if (!selectedTier || isPricing) return
    refreshQuote({ tier: selectedTier, count: delegateCount, code: couponInput, announce: true })
  }

  const handleClearCoupon = () => {
    setCouponInput('')
    setCouponNotice(null)
    if (selectedTier) {
      refreshQuote({ tier: selectedTier, count: delegateCount, code: '' })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTier) return
    setIsSubmitting(true)

    // Both are advisory only. The server mints its own reference and re-prices
    // from scratch; these are sent for logging parity and used as a display
    // fallback if the response cannot be parsed.
    const reference = generateReference(selectedTier.id)
    const amount = totalPayable

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const response = await fetch('/api/register/delegate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          tier: selectedTier.name,
          reference: reference,
          amount: amount,
          currency: 'USD',
          specialRequirements: formData.specialRequirements,
          delegateCount: delegateCount,
          discountCode: couponInput.trim() || undefined
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      let resData: {
        data?: { reference?: string }
        payUrl?: string
        reference?: string
        pricing?: QuoteResponse
      } | null = null;
      if (!response.ok) {
        let errorMessage = `Registration failed with status ${response.status}`;
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errData = await response.json();
            if (errData && errData.error) {
              errorMessage = errData.error;
            }
          }
        } catch {
          // ignore parsing error
        }
        throw new Error(errorMessage);
      } else {
        try {
          resData = await response.json();
        } catch {
          // ignore parsing error
        }
      }

      // The server re-prices from scratch, so its figures are the ones that
      // will be charged — snapshot those for the success screen rather than
      // whatever the form was last showing.
      const serverPricing = resData?.pricing ?? quote

      // Delay slightly for visual checkout transition
      setTimeout(() => {
        setSubmittedTier(selectedTier)
        setSubmittedDelegateCount(delegateCount)
        setSubmittedReference(resData?.data?.reference || resData?.reference || '')
        setSubmittedQuote(serverPricing)
        setPayUrl(resData?.payUrl || '')
        setIsSubmitting(false)
        setSubmitSuccess(true)
      }, 1500)
    } catch (err: unknown) {
      clearTimeout(timeoutId);
      setIsSubmitting(false)
      console.error('Registration database persistence failure:', err)
      const error = err as Error
      const isAbort = error.name === 'AbortError'
      const desc = isAbort
        ? 'The request took too long to respond. Please check your network and try again.'
        : error.message || 'We were unable to process your registration. Please check your network connection and try again.'
      toast.error(isAbort ? 'Request Timeout' : 'Registration Error', {
        description: desc
      })
    }
  }

  const isVipSelected = selectedTier?.id === 'vip'
  const isVipSubmitted = submittedTier?.id === 'vip'

  // A registration whose response could not be parsed leaves the success
  // screen without pricing. Showing $0.00 there reads as "nothing to pay" —
  // point at the emailed instructions instead, which always carry the figure
  // the server locked.
  const submittedNet =
    typeof submittedQuote?.netAmount === 'number' && Number.isFinite(submittedQuote.netAmount)
      ? submittedQuote.netAmount
      : null

  return (
    <>
      <Navbar />

      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-16 md:pb-24">

        {/* Header Hero Section */}
        <section className="max-w-4xl mx-auto px-6 w-full text-center pt-6 pb-10">
          {/* Back Button */}
          <div className="mb-6 flex justify-center">
            <Link
              href="/reservations?type=delegate"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-nbac-muted hover:text-nbac-emerald transition-colors cursor-pointer group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Pass Selection</span>
            </Link>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
              DELEGATE PORTAL
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-nbac-text tracking-tight max-w-2xl leading-tight">
              Secure Your Pass
            </h1>
            <p className="font-sans text-sm md:text-base font-light text-nbac-body max-w-2xl leading-relaxed">
              Complete your delegate registration details. Upon secure payment confirmation, credentials and access passes will be dispatched.
            </p>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="max-w-3xl mx-auto px-6 w-full">
          <div className="relative">
            <AnimatePresence mode="wait">
              {submitSuccess && submittedTier ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="bg-nbac-panel/80 border border-nbac-border rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[600px] shadow-2xl relative overflow-hidden"
                >
                  <div className={cn(
                    "absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none",
                    isVipSubmitted ? "bg-nbac-gold/8" : "bg-nbac-emerald/8"
                  )} />
                  <div className={cn(
                    "absolute -bottom-24 -right-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none",
                    isVipSubmitted ? "bg-nbac-gold/4" : "bg-nbac-emerald/4"
                  )} />

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className={cn(
                      "p-4 rounded-full border",
                      isVipSubmitted
                        ? "bg-nbac-gold/10 border-nbac-gold/30 shadow-[0_0_30px_rgba(197,160,89,0.25)]"
                        : "bg-nbac-emerald/10 border-nbac-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                    )}
                  >
                    <CheckCircle2 className={cn("h-12 w-12", isVipSubmitted ? "text-nbac-gold" : "text-nbac-emerald")} />
                  </motion.div>

                  <div className="max-w-md space-y-3">
                    <span className={cn(
                      "font-sans text-xs uppercase tracking-widest font-semibold",
                      isVipSubmitted ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                    )}>
                      Registration Received
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
                      Welcome to NBAC
                    </h3>
                    <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                      Thank you, <span className="font-semibold text-nbac-text">{formData.fullName}</span>. Your delegate seat reservation for the <span className="font-semibold text-nbac-text">{submittedTier.name}</span> package has been securely recorded.
                    </p>
                    <p className="font-sans text-xs text-nbac-muted font-light leading-relaxed">
                      Your reservation{submittedNet !== null ? <> of <span className="font-semibold text-nbac-text">{formatPrice(submittedNet)}</span></> : null} is pending payment. Complete it below — {submittedNet !== null ? 'a copy of these instructions is on its way to your inbox.' : 'the exact amount due is in the payment instructions on their way to your inbox.'}
                    </p>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-5 w-full max-w-md text-left space-y-3 shadow-inner">
                    {submittedReference && (
                      <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                        <span className="text-nbac-muted uppercase tracking-wider">Booking Ref</span>
                        <span className="font-mono font-bold text-nbac-emerald-light">{submittedReference}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                      <span className="text-nbac-muted uppercase tracking-wider">Package</span>
                      <span className="font-bold text-nbac-text uppercase">{submittedTier.name}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                      <span className="text-nbac-muted uppercase tracking-wider">
                        {submittedTier.billingModel === 'package' ? 'Package Quantity' : 'Delegate Count'}
                      </span>
                      <span className="font-bold text-nbac-text">
                        {submittedTier.billingModel === 'package'
                          ? `${submittedDelegateCount} Package(s) (${submittedDelegateCount * (submittedTier.includedDelegates || 1)} Passes)`
                          : `${submittedDelegateCount} Pass(es)`}
                      </span>
                    </div>

                    {(submittedQuote?.discountAmount ?? 0) > 0 && (
                      <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2 text-nbac-gold-light">
                        <span className="uppercase tracking-wider font-semibold flex items-center gap-1">
                          <Sparkles size={11} /> {submittedQuote?.discountLabel || 'Discount'}
                        </span>
                        <span className="font-mono font-bold">
                          -{formatPrice(submittedQuote?.discountAmount ?? 0)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-nbac-muted uppercase tracking-wider font-semibold">
                        {(submittedQuote?.discountAmount ?? 0) > 0 ? 'Total Payable After Discount' : 'Total Due'}
                      </span>
                      <span className={cn(
                        "font-bold text-sm",
                        isVipSubmitted ? "text-nbac-gold-light" : "text-nbac-emerald"
                      )}>
                        {submittedNet !== null ? formatPrice(submittedNet) : 'See emailed instructions'}
                      </span>
                    </div>
                  </div>

                  {/* Proceed to payment.
                      Points at our own /pay/<token> page rather than the EAN
                      Paystack link, so the click-through is recorded against
                      the reservation before the delegate leaves the site. */}
                  {payUrl && (
                    <a
                      href={payUrl}
                      className={cn(
                        "w-full max-w-md inline-flex items-center justify-center gap-2 font-sans text-sm font-bold uppercase tracking-wider px-6 py-4 rounded-lg transition-all cursor-pointer",
                        isVipSubmitted
                          ? "bg-nbac-gold text-[#0b0f10] shadow-[0_0_20px_rgba(197,160,89,0.3)] hover:brightness-110"
                          : "bg-nbac-emerald text-[#0b0f10] shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:brightness-110"
                      )}
                    >
                      <CreditCard size={16} />
                      <span>{submittedNet !== null ? `Pay ${formatPrice(submittedNet)} now` : 'Complete your payment'}</span>
                    </a>
                  )}

                  {/* Payment Link Notice on Success Card */}
                  <div className="w-full max-w-md bg-nbac-canvas/60 border border-nbac-border rounded-lg p-4 text-xs text-left space-y-1.5 text-nbac-body font-light">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-gold-light block">
                      Official Payment Link Instructions
                    </span>
                    <p>
                      Your payment instructions{(submittedQuote?.discountAmount ?? 0) > 0 && <> — reflecting your {submittedQuote?.discountLabel}</>} have been sent to <strong className="text-nbac-text">{formData.email}</strong>, with the exact amount to pay and your booking reference.
                    </p>
                    <p>
                      Your card receipt will come from <strong className="text-nbac-text">EAN Aviation Ltd</strong>, the organiser of NBAC 2027 — that is expected. Your official NBAC confirmation and delegate pass follow within one business day of payment being confirmed.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitSuccess(false)
                      setSubmittedTier(null)
                      setSubmittedReference('')
                      setSubmittedDelegateCount(1)
                      // Pricing and payment state belong to the booking just
                      // completed. Left behind, the fresh form opens showing
                      // the previous coupon and total, and the success screen
                      // would carry the old /pay/<token> link.
                      setSubmittedQuote(null)
                      setPayUrl('')
                      setCouponInput('')
                      setQuote(null)
                      setCouponNotice(null)
                      setFormData({
                        fullName: '',
                        email: '',
                        company: '',
                        phone: '',
                        specialRequirements: ''
                      })
                      setDelegateCount(1)
                      setIsTierLocked(false)
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href)
                        url.search = ''
                        window.history.pushState({}, '', url.toString())
                      }
                    }}
                    className="border border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-canvas font-sans font-medium px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Book Another Pass
                  </button>
                </motion.div>
              ) : (
                <div
                  key="form-card"
                  className="sponsor-animated-border rounded-2xl p-6 md:p-10 backdrop-blur-xl shadow-2xl relative"
                >
                  <form onSubmit={handleSubmit} className="space-y-8 relative z-10">

                    {/* Header Intro inside form */}
                    <div className="flex flex-col space-y-2 border-b border-nbac-border pb-4">
                      <span className={cn(
                        "font-sans text-xs uppercase tracking-widest font-semibold",
                        isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                      )}>
                        Registration Intake
                      </span>
                      <h2 className="font-display text-2xl font-bold text-nbac-text tracking-tight">
                        Credentials Registration Desk
                      </h2>
                    </div>

                    {/* Pre-selected Tier & Price Banner */}
                    {selectedTier && (
                      <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className={cn(
                            "font-sans text-[10px] uppercase tracking-widest font-semibold",
                            isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                          )}>
                            Selected Access Pass
                          </span>
                          <h4 className="font-sans text-base font-bold text-nbac-text uppercase tracking-wide mt-0.5">
                            {selectedTier.name}
                          </h4>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted">
                            {selectedTier.billingModel === 'package' ? 'Package Cost' : 'Cost Per Seat'}
                          </span>
                          <p className="font-sans text-lg font-bold text-nbac-text mt-0.5">
                            {formatPrice(selectedTier.price)}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Dropdown to change tier */}
                    <div className="space-y-2">
                      <label htmlFor="tierSelect" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                        Select Access Package
                        {isTierLocked && (
                          <span className={cn(
                            "text-[10px] normal-case flex items-center gap-1",
                            isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                          )}>
                            (Locked)
                          </span>
                        )}
                      </label>
                      <div className="relative">
                        <select
                          id="tierSelect"
                          value={selectedTier?.id || ''}
                          onChange={handleTierChange}
                          disabled={isTierLocked}
                          className={cn(
                            "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm appearance-none focus:outline-none transition-all duration-300",
                            isTierLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer",
                            isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                          )}
                        >
                          {tiers.map((t) => (
                            <option key={t.id} value={t.id} className="bg-nbac-panel text-nbac-text">
                              {t.name} ({formatPrice(t.price)} USD)
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-nbac-muted">
                          {isTierLocked ? (
                            <Lock size={13} className={cn(isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light")} />
                          ) : (
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delegate Inclusions List */}
                    {selectedTier && (
                      <div className="border border-nbac-border/60 bg-nbac-canvas/20 rounded-lg p-4">
                        <h4 className={cn("font-sans text-[10px] uppercase tracking-widest font-bold mb-3", isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light")}>
                          Package Privileges & Inclusions
                        </h4>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-sans font-light leading-relaxed text-nbac-body">
                          {selectedTier.privileges.map((p, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className={cn("mt-1 w-1.5 h-1.5 rounded-full shrink-0", isVipSelected ? "bg-nbac-gold" : "bg-nbac-emerald")} />
                              <span>{p}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Delegate Credentials details */}
                    <div className="space-y-5">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                        Delegate Contact Details
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <User size={13} className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"} />
                            Full Name <span className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"}>*</span>
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Aliko Dangote"
                            className={cn(
                              "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none transition-all duration-300",
                              isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                            )}
                          />
                        </div>

                        {/* Company / Operator */}
                        <div className="space-y-2">
                          <label htmlFor="company" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Landmark size={13} className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"} />
                            Company / Operator <span className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"}>*</span>
                          </label>
                          <input
                            type="text"
                            id="company"
                            required
                            value={formData.company}
                            onChange={handleInputChange}
                            placeholder="e.g. Dangote Group"
                            className={cn(
                              "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none transition-all duration-300",
                              isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                            )}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Contact Email */}
                        <div className="space-y-2">
                          <label htmlFor="email" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Mail size={13} className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"} />
                            Corporate Email <span className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"}>*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g. a.dangote@dangotegroup.com"
                            className={cn(
                              "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none transition-all duration-300",
                              isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                            )}
                          />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                          <label htmlFor="phone" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Phone size={13} className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"} />
                            Direct Phone <span className={isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"}>*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+234 803 123 4567"
                            className={cn(
                              "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none transition-all duration-300",
                              isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delegate Quantity Counter */}
                    {selectedTier && (
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border border-nbac-border bg-nbac-canvas/40 rounded-lg gap-4">
                        <div className="space-y-0.5">
                          <h5 className="font-sans text-xs font-bold text-nbac-text uppercase tracking-wider">
                            {selectedTier.billingModel === 'package' ? 'Package Quantity' : 'Delegate Attendance'}
                          </h5>
                          <p className="font-sans text-xs text-nbac-muted">
                            {selectedTier.billingModel === 'package'
                              ? `Specify the number of packages (each package includes ${selectedTier.includedDelegates || 1} delegate passes)`
                              : 'Specify the number of delegates registering together'}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 bg-nbac-canvas border border-nbac-border px-4 py-2 rounded-full select-none">
                          <button
                            type="button"
                            onClick={handleDecrement}
                            className={cn(
                              "text-nbac-body transition-colors disabled:opacity-30 cursor-pointer",
                              isVipSelected ? "hover:text-nbac-gold" : "hover:text-nbac-emerald"
                            )}
                            aria-label="Decrease count"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="font-sans font-bold text-sm w-6 text-center text-nbac-text">{delegateCount}</span>
                          <button
                            type="button"
                            onClick={handleIncrement}
                            className={cn(
                              "text-nbac-body transition-colors disabled:opacity-30 cursor-pointer",
                              isVipSelected ? "hover:text-nbac-gold" : "hover:text-nbac-emerald"
                            )}
                            aria-label="Increase count"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Custom Requirements */}
                    <div className="space-y-2">
                      <label htmlFor="specialRequirements" className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
                        Dietary, Accessibility, or Operational Requirements
                      </label>
                      <textarea
                        id="specialRequirements"
                        rows={4}
                        value={formData.specialRequirements}
                        onChange={handleInputChange}
                        placeholder="Outline any special VIP requirements, dietary conditions, accessibility needs or preferences here..."
                        className={cn(
                          "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none transition-all duration-300 resize-none",
                          isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                        )}
                      />
                    </div>

                    {/* Discount Code Entry */}
                    <div className="bg-nbac-canvas/90 border border-nbac-gold/40 rounded-xl p-4 sm:p-5 space-y-3 shadow-md">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-nbac-border/60 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-nbac-gold text-[#0b0f10] text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Tag size={11} /> Discount Code
                          </span>
                          {quote?.autoPromo && (
                            <span className="text-xs font-mono font-bold text-nbac-gold-light">
                              {quote.autoPromo.value}% OFF ALREADY APPLIED
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-nbac-muted">
                          {quote?.autoPromo
                            ? quote.autoPromo.validUntil
                              ? `${quote.autoPromo.label} — ends ${new Date(quote.autoPromo.validUntil).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`
                              : quote.autoPromo.label
                            : 'Have an AfBAA or early bird code? Enter it below.'}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        <div className="flex-1 relative">
                          <Percent size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-nbac-muted pointer-events-none" />
                          <input
                            type="text"
                            value={couponInput}
                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                            onKeyDown={(e) => {
                              // Enter inside a coupon field must apply the code,
                              // not submit a half-filled registration.
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                handleApplyCoupon()
                              }
                            }}
                            placeholder="e.g. NBAC27-EARLY5"
                            autoComplete="off"
                            spellCheck={false}
                            aria-label="Discount code"
                            className={cn(
                              "w-full bg-nbac-canvas/80 border rounded-lg pl-10 pr-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-mono text-sm tracking-wider focus:outline-none transition-all duration-300",
                              appliedCode
                                ? "border-nbac-gold/60 focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30"
                                : "border-nbac-border focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30"
                            )}
                          />
                        </div>

                        <div className="flex items-center gap-2 self-start">
                          <button
                            type="button"
                            onClick={handleApplyCoupon}
                            disabled={isPricing || !couponInput.trim()}
                            className={cn(
                              "text-xs uppercase tracking-wider font-bold px-4 py-3 rounded-lg transition-all whitespace-nowrap flex items-center gap-1.5",
                              isPricing || !couponInput.trim()
                                ? "bg-nbac-panel text-nbac-muted border border-nbac-border cursor-not-allowed"
                                : "bg-nbac-gold text-[#0b0f10] shadow-[0_0_12px_rgba(197,160,89,0.3)] cursor-pointer hover:brightness-110"
                            )}
                          >
                            {isPricing ? (
                              <span>Checking…</span>
                            ) : appliedCode && appliedCode === couponInput.trim().toUpperCase() ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>Applied</span>
                              </>
                            ) : (
                              <span>Apply</span>
                            )}
                          </button>

                          {couponInput.trim() && (
                            <button
                              type="button"
                              onClick={handleClearCoupon}
                              className="text-xs uppercase tracking-wider font-semibold px-3 py-3 rounded-lg text-nbac-muted hover:text-nbac-text border border-nbac-border transition-colors cursor-pointer"
                            >
                              Clear
                            </button>
                          )}
                        </div>
                      </div>

                      {couponNotice && (
                        <p className="text-[11px] text-nbac-amber leading-relaxed flex items-start gap-1.5">
                          <Sparkles size={12} className="shrink-0 mt-0.5" />
                          <span>{couponNotice}</span>
                        </p>
                      )}

                      {appliedCode && !couponNotice && (
                        <p className="text-[11px] text-nbac-gold-light leading-relaxed flex items-start gap-1.5">
                          <CheckCircle2 size={12} className="shrink-0 mt-0.5" />
                          <span>
                            {appliedLabel} applied — you save {formatPrice(discountAmount)}.
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Total Billing Display */}
                    <div className="bg-nbac-alt/80 border border-nbac-border rounded-lg p-5 space-y-3 shadow-inner">
                      <div className="flex justify-between items-center text-xs text-nbac-muted border-b border-nbac-border/60 pb-2">
                        <span>Standard Package Subtotal</span>
                        <span className="font-semibold text-nbac-text">
                          {formatPrice(grossTotal)}
                        </span>
                      </div>

                      {discountAmount > 0 && (
                        <div className="flex justify-between items-center text-xs text-nbac-gold-light border-b border-nbac-border/60 pb-2 font-medium">
                          <span className="flex items-center gap-1.5">
                            <Tag size={13} /> {appliedLabel || 'Discount'}
                            {appliedCode && (
                              <span className="font-mono text-[10px] text-nbac-muted">({appliedCode})</span>
                            )}
                          </span>
                          <span>
                            -{formatPrice(discountAmount)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <div className="space-y-0.5">
                          <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted">
                            {discountAmount > 0 ? 'Total Payable After Discount' : 'Total Due'}
                          </span>
                          <span className={cn(
                            "block font-sans text-[10px]",
                            isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                          )}>
                            All-inclusive VIP conference access
                          </span>
                        </div>
                        <span className={cn(
                          "font-display text-xl md:text-2xl font-extrabold tracking-tight transition-opacity",
                          isVipSelected ? "text-nbac-gold" : "text-nbac-emerald",
                          isPricing && "opacity-50"
                        )}>
                          {formatPrice(totalPayable)}
                        </span>
                      </div>
                    </div>

                    {/* Payment Link & Gateway Notice */}
                    <div className="flex items-start gap-2.5 bg-nbac-canvas/40 border border-nbac-border/40 rounded-lg p-3.5 text-nbac-muted text-xs leading-relaxed">
                      <Lock size={15} className={cn("shrink-0 mt-0.5", isVipSelected ? "text-nbac-gold" : "text-nbac-emerald")} />
                      <p>
                        <strong className="text-nbac-text">Payment Link Dispatch:</strong> Hold a discount code? Enter it above before submitting — codes are not applied automatically. Your official payment link, the exact amount due and your booking reference will be sent to your email on registration.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={cn(
                        "w-full font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98] cursor-pointer",
                        isVipSelected
                          ? "bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] shadow-[0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[0_6px_20px_rgba(197,160,89,0.45)]"
                          : "bg-linear-to-r from-nbac-emerald via-[#10b981] to-nbac-emerald text-white shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)]"
                      )}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          Initializing Gateway...
                        </>
                      ) : (
                        <>
                          <CreditCard size={13} />
                          Transmit Payment & Register
                        </>
                      )}
                    </button>

                  </form>
                </div>
              )}
            </AnimatePresence>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
