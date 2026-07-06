'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Shield, User, Landmark, Phone, Plus, Minus, CreditCard, Lock, CheckCircle2 } from 'lucide-react'
import { PassTierDetails } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface RegistrationFormUIProps {
  selectedTier: PassTierDetails | null
}

export function RegistrationFormUI({ selectedTier }: RegistrationFormUIProps) {
  const [delegateCount, setDelegateCount] = useState(1)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    specialRequirements: ''
  })
  
  // UI states for interactive feedback (simulating payment)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [submittedTier, setSubmittedTier] = useState<PassTierDetails | null>(null)
  const [submittedDelegateCount, setSubmittedDelegateCount] = useState<number>(1)
  const [submittedReference, setSubmittedReference] = useState<string>('')

  const generateReference = (tierId: string) => {
    const prefix = `NBAC-2026-${tierId.toUpperCase()}`;
    const random = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${random}`;
  }

  const calculateTotal = (tier: PassTierDetails | null, count: number) => {
    if (!tier) return 0
    return tier.price * count
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleIncrement = () => {
    if (delegateCount < 10) setDelegateCount(prev => prev + 1)
  }

  const handleDecrement = () => {
    if (delegateCount > 1) setDelegateCount(prev => prev - 1)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTier) return
    setIsSubmitting(true)
    
    const reference = generateReference(selectedTier.id)
    const amount = calculateTotal(selectedTier, delegateCount)
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('reservations')
        .insert({
          name: formData.fullName,
          email: formData.email,
          company: formData.company,
          phone: formData.phone,
          tier: selectedTier.name,
          status: 'pending',
          reference: reference,
          amount: amount,
          currency: 'NGN',
          special_requirements: formData.specialRequirements,
          delegate_count: delegateCount
        })

      if (error) {
        throw error
      }

      // Simulate payment processing delay on uploader
      setTimeout(() => {
        setSubmittedTier(selectedTier)
        setSubmittedDelegateCount(delegateCount)
        setSubmittedReference(reference)
        setIsSubmitting(false)
        setPaymentSuccess(true)
      }, 2000)
    } catch (err) {
      setIsSubmitting(false)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Registration Error: ${msg}`)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="space-y-3 relative">
      <div className="flex flex-col space-y-2 mb-2">
        <span className={cn(
          "font-sans text-xs uppercase tracking-widest font-semibold",
          selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald-light"
        )}>
          Securing Access Pass
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
          Delegate Registration Desk
        </h2>
      </div>

      <div className={cn("relative", !selectedTier && "min-h-[550px]")}>
        <AnimatePresence mode="wait">
          {/* STATE 1: Locked overlay if no tier is selected */}
          {!selectedTier && (
            <motion.div
              key="locked-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-nbac-panel/40 border border-nbac-border rounded-xl p-8 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6 z-20 min-h-[550px]"
            >
              <div className="p-5 bg-nbac-panel/80 rounded-full border border-nbac-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <Shield size={36} className="text-nbac-muted" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-sans text-lg font-bold text-nbac-text uppercase tracking-wide">
                  Select a Pass Package
                </h3>
                <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                  Please review the conference pass options on the left and select your package to activate the secure delegate credentials form.
                </p>
              </div>
            </motion.div>
          )}

          {/* STATE 2: Success Confirmation Page */}
          {submittedTier && paymentSuccess && (
            <motion.div
              key="success-state"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-nbac-panel/80 border border-nbac-border rounded-xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6 z-30 min-h-[550px] shadow-2xl relative overflow-hidden"
            >
              {/* Luxury gold/emerald glow particles */}
              <div className="absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-emerald/8" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-emerald/5" />

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className={cn(
                  "p-4 rounded-full border",
                  submittedTier?.id === 'vip'
                    ? "bg-nbac-gold/10 border-nbac-gold/30 shadow-[0_0_30px_rgba(197,160,89,0.2)]"
                    : "bg-nbac-emerald/10 border-nbac-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                )}
              >
                <CheckCircle2 size={48} className={submittedTier?.id === 'vip' ? "text-nbac-gold" : "text-nbac-emerald"} />
              </motion.div>

              <div className="max-w-md space-y-3">
                <span className={cn(
                  "font-sans text-xs uppercase tracking-widest font-semibold",
                  submittedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                )}>
                  Transaction Authenticated
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
                  Welcome to NBAC
                </h3>
                <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                  Thank you, <span className="font-semibold text-nbac-text">{formData.fullName || 'Delegate'}</span>. Your delegate seat reservation for the <span className="font-semibold text-nbac-text">{submittedTier.name}</span> package has been securely requested. 
                </p>
                <p className="font-sans text-xs text-nbac-muted font-light leading-relaxed">
                  In a production environment, this would verify your payment of <span className="font-semibold text-nbac-text">{formatPrice(calculateTotal(submittedTier, submittedDelegateCount))}</span> via Paystack, save your record in Supabase, and dispatch your access passes via Resend.
                </p>
              </div>

               <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-5 w-full max-w-sm text-left space-y-3.5 shadow-inner">
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
                <div className="flex justify-between items-center text-xs">
                  <span className="text-nbac-muted uppercase tracking-wider font-semibold">Total Amount</span>
                  <span className={cn(
                    "font-bold text-sm",
                    submittedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"
                  )}>{formatPrice(calculateTotal(submittedTier, submittedDelegateCount))}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPaymentSuccess(false)
                  setSubmittedTier(null)
                  setSubmittedDelegateCount(1)
                  setFormData({ fullName: '', email: '', company: '', phone: '', specialRequirements: '' })
                  setDelegateCount(1)
                }}
                className="border border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-canvas font-sans font-medium px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                Book Another Pass
              </button>
            </motion.div>
          )}

          {/* STATE 3: Active Form Panel */}
          {selectedTier && !paymentSuccess && (
            <motion.div
              key="active-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="sponsor-animated-border rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative"
            >
              {/* Subtle accent glow inside card */}
               <div className={cn(
                "absolute -bottom-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none",
                selectedTier?.id === 'vip' ? "bg-nbac-gold/3" : "bg-nbac-emerald/3"
              )} />

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Active Package Banner */}
                <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className={cn(
                      "font-sans text-[10px] uppercase tracking-widest font-semibold",
                      selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                    )}>Selected Tier</span>
                    <h4 className="font-sans text-sm font-bold text-nbac-text uppercase tracking-wide mt-0.5">{selectedTier.name}</h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted">
                      {selectedTier.billingModel === 'package' ? 'Package Price' : 'Price Per Seat'}
                    </span>
                    <p className="font-sans text-sm font-bold text-nbac-text mt-0.5">{formatPrice(selectedTier.price)}</p>
                  </div>
                </div>

                {/* Delegate Credentials */}
                <div className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                      <User size={12} className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"} />
                      Full Name <span className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"}>*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Aliko Dangote"
                      className={cn(
                        "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300",
                        selectedTier?.id === 'vip' ? "focus:border-nbac-gold focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-nbac-emerald/30"
                      )}
                    />
                  </div>

                  {/* Corporate Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                      <Mail size={12} className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"} />
                      Corporate Email <span className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="e.g. a.dangote@dangotegroup.com"
                      className={cn(
                        "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300",
                        selectedTier?.id === 'vip' ? "focus:border-nbac-gold focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-nbac-emerald/30"
                      )}
                    />
                  </div>

                  {/* Company / Operator */}
                  <div className="space-y-2">
                    <label htmlFor="company" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                      <Landmark size={12} className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"} />
                      Company / Operator <span className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"}>*</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="e.g. Dangote Group"
                      className={cn(
                        "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300",
                        selectedTier?.id === 'vip' ? "focus:border-nbac-gold focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-nbac-emerald/30"
                      )}
                    />
                  </div>

                  {/* Contact Number */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                      <Phone size={12} className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"} />
                      Contact Number <span className={selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald"}>*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+234 803 123 4567"
                      className={cn(
                        "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300",
                        selectedTier?.id === 'vip' ? "focus:border-nbac-gold focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-nbac-emerald/30"
                      )}
                    />
                  </div>
                </div>

                {/* Delegate Quantity Counter */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-nbac-border bg-nbac-canvas/40 rounded-lg gap-4">
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
                  <div className="flex items-center gap-4 bg-nbac-canvas border border-nbac-border px-3 py-1.5 rounded-full select-none">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      className={cn(
                        "text-nbac-body transition-colors disabled:opacity-30 disabled:hover:text-nbac-body",
                        selectedTier?.id === 'vip' ? "hover:text-nbac-gold" : "hover:text-nbac-emerald"
                      )}
                      aria-label="Decrease delegate count"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="font-sans font-bold text-sm w-6 text-center text-nbac-text">{delegateCount}</span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      className={cn(
                        "text-nbac-body transition-colors disabled:opacity-30 disabled:hover:text-nbac-body",
                        selectedTier?.id === 'vip' ? "hover:text-nbac-gold" : "hover:text-nbac-emerald"
                      )}
                      aria-label="Increase delegate count"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Special Requirements */}
                <div className="space-y-2">
                  <label htmlFor="specialRequirements" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted">
                    Dietary, Accessibility, or Operational Requirements
                  </label>
                  <textarea
                    id="specialRequirements"
                    rows={3}
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="Outline any special VIP requirements, dietary conditions, aircraft handling requests (for static display) or preferences here..."
                    className={cn(
                      "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 transition-all duration-300 resize-none",
                      selectedTier?.id === 'vip' ? "focus:border-nbac-gold focus:ring-nbac-gold/30" : "focus:border-nbac-emerald focus:ring-nbac-emerald/30"
                    )}
                  />
                </div>

                {/* Total Billing Display */}
                <div className="bg-nbac-alt/80 border border-nbac-border rounded-lg p-4 flex justify-between items-center shadow-inner">
                  <div className="space-y-0.5">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted">Estimated Total Due</span>
                    <span className={cn(
                      "block font-sans text-[10px]",
                      selectedTier?.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald-light"
                    )}>All-inclusive VIP conference access</span>
                  </div>
                  <span className="font-display text-xl md:text-2xl font-extrabold text-nbac-text tracking-tight">
                    {formatPrice(calculateTotal(selectedTier, delegateCount))}
                  </span>
                </div>

                {/* Paystack Security Notice */}
                <div className="flex items-center gap-2.5 bg-nbac-canvas/30 border border-nbac-border/30 rounded-lg p-3 text-nbac-muted text-[11px] leading-relaxed">
                  <Lock size={16} className={cn("shrink-0", selectedTier?.id === 'vip' ? "text-nbac-gold" : "text-nbac-emerald")} />
                  <p>
                    Payments are encrypted and processed by Paystack. Upon approval, digital access passes will be dispatched.
                  </p>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98] bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_6px_20px_rgba(197,160,89,0.45)]"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0f10] border-t-transparent" />
                      Initializing Secure Gateway...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Transmit Payment & Register
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
