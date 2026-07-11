'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, User, Phone, Plus, Minus, Lock, CheckCircle2, Landmark, Send, ArrowLeft, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PASS_TIERS } from '@/lib/constants'
import { PassTierDetails } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/toast'

export default function DelegateRegistrationPage() {
  const toast = useToast()
  const [selectedTier, setSelectedTier] = useState<PassTierDetails | null>(null)
  const [isTierLocked, setIsTierLocked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tierParam = params.get('tier')
    const foundTier = PASS_TIERS.find(t => t.id === (tierParam || 'vip')) || null

    const timer = setTimeout(() => {
      if (foundTier) {
        setSelectedTier(foundTier)
        if (tierParam) {
          setIsTierLocked(true)
        }
      }
    }, 0)

    return () => clearTimeout(timer)
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
    const foundTier = PASS_TIERS.find(t => t.id === tierId)
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

  const calculateTotal = (tier: PassTierDetails | null, count: number) => {
    if (!tier) return 0
    return tier.price * count
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTier) return
    setIsSubmitting(true)

    const reference = generateReference(selectedTier.id)
    const amount = calculateTotal(selectedTier, delegateCount)

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
          delegateCount: delegateCount
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Registration failed');
      }

      // Delay slightly for visual checkout transition
      setTimeout(() => {
        setSubmittedTier(selectedTier)
        setSubmittedDelegateCount(delegateCount)
        setSubmittedReference(reference)
        setIsSubmitting(false)
        setSubmitSuccess(true)
      }, 1500)
    } catch (err) {
      setIsSubmitting(false)
      console.error('Registration database persistence failure:', err)
      toast.error('Registration Error', { description: 'We were unable to process your registration. Please check your network connection and try again.' })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const isVipSelected = selectedTier?.id === 'vip'
  const isVipSubmitted = submittedTier?.id === 'vip'

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
                      Transaction Authenticated
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
                      Welcome to NBAC
                    </h3>
                    <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                      Thank you, <span className="font-semibold text-nbac-text">{formData.fullName}</span>. Your delegate seat reservation for the <span className="font-semibold text-nbac-text">{submittedTier.name}</span> package has been processed successfully.
                    </p>
                    <p className="font-sans text-xs text-nbac-muted font-light leading-relaxed">
                      In a production environment, this would verify your payment of <span className="font-semibold text-nbac-text">{formatPrice(calculateTotal(submittedTier, submittedDelegateCount))}</span> via Paystack, save your record in Supabase, and dispatch your access passes via Resend.
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

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-nbac-muted uppercase tracking-wider font-semibold">Total Paid</span>
                      <span className={cn(
                        "font-bold text-sm",
                        isVipSubmitted ? "text-nbac-gold-light" : "text-nbac-emerald"
                      )}>
                        {formatPrice(calculateTotal(submittedTier, submittedDelegateCount))}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitSuccess(false)
                      setSubmittedTier(null)
                      setSubmittedReference('')
                      setSubmittedDelegateCount(1)
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
                          {PASS_TIERS.map((t) => (
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
                        placeholder="Outline any special VIP requirements, dietary conditions, aircraft handling requests (for static display) or preferences here..."
                        className={cn(
                          "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none transition-all duration-300 resize-none",
                          isVipSelected ? "focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30"
                        )}
                      />
                    </div>

                    {/* Total Billing Display */}
                    <div className="bg-nbac-alt/80 border border-nbac-border rounded-lg p-5 flex justify-between items-center shadow-inner">
                      <div className="space-y-0.5">
                        <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted">Estimated Total Due</span>
                        <span className={cn(
                          "block font-sans text-[10px]",
                          isVipSelected ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                        )}>All-inclusive VIP conference access</span>
                      </div>
                      <span className={cn(
                        "font-display text-xl md:text-2xl font-extrabold tracking-tight",
                        isVipSelected ? "text-nbac-gold" : "text-nbac-emerald"
                      )}>
                        {formatPrice(calculateTotal(selectedTier, delegateCount))}
                      </span>
                    </div>

                    {/* Paystack Security Notice */}
                    <div className="flex items-center gap-2.5 bg-nbac-canvas/30 border border-nbac-border/30 rounded-lg p-3.5 text-nbac-muted text-xs leading-relaxed">
                      <Lock size={15} className={cn("shrink-0", isVipSelected ? "text-nbac-gold" : "text-nbac-emerald")} />
                      <p>
                        Payments are encrypted and processed by Paystack. Upon approval, digital access passes will be dispatched.
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
