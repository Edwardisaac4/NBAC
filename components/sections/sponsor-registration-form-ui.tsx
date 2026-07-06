'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Shield, User, Phone, Plus, Minus, CreditCard, Lock, CheckCircle2, Globe, Building2, Layers, Briefcase, ChevronDown, ChevronUp } from 'lucide-react'
import { SponsorTierDetails } from '@/types'
import { cn } from '@/lib/utils'
import { SPONSOR_ADD_ONS } from '@/lib/constants'

interface SponsorRegistrationFormUIProps {
  selectedTier: SponsorTierDetails | null
}

export function SponsorRegistrationFormUI({ selectedTier }: SponsorRegistrationFormUIProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    industry: 'charter_operator',
    website: '',
    fullName: '',
    designation: '',
    email: '',
    phone: '',
    specialRequirements: ''
  })
  
  // Track selected add-ons
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  // For Hackathon Track Sponsor, number of tracks (1 to 3)
  const [trackCount, setTrackCount] = useState(1)
  const [showFormBenefits, setShowFormBenefits] = useState(false)

  // UI states for interactive feedback (simulating corporate invoice checkout)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [submittedTier, setSubmittedTier] = useState<SponsorTierDetails | null>(null)
  const [submittedAddOns, setSubmittedAddOns] = useState<string[]>([])
  const [submittedTrackCount, setSubmittedTrackCount] = useState(1)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId) 
        : [...prev, addonId]
    )
  }

  const handleTrackIncrement = () => {
    if (trackCount < 5) setTrackCount(prev => prev + 1)
  }

  const handleTrackDecrement = () => {
    if (trackCount > 1) setTrackCount(prev => prev - 1)
  }

  const calculateTotal = (tier: SponsorTierDetails | null) => {
    if (!tier) return 0
    return tier.price
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTier) return
    setSubmittedTier(selectedTier)
    setSubmittedAddOns([...selectedAddOns])
    setSubmittedTrackCount(trackCount)
    setIsSubmitting(true)
    
    // Simulate premium invoice routing and CRM ingestion
    setTimeout(() => {
      setIsSubmitting(false)
      setPaymentSuccess(true)
    }, 2500)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }



  return (
    <div className="space-y-3 relative">
      <div className="flex flex-col space-y-2 mb-2">
        <span className={cn(
          "font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light"
        )}>
          Partnering with NBAC
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
          Sponsor Partnership Desk
        </h2>
      </div>

      <div className={cn("relative", !selectedTier && "min-h-[650px]")}>
        <AnimatePresence mode="wait">
          {/* STATE 1: Locked overlay if no tier is selected */}
          {!selectedTier && (
            <motion.div
              key="locked-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-nbac-panel/40 border border-nbac-border rounded-xl p-8 backdrop-blur-md flex flex-col items-center justify-center text-center space-y-6 z-20 min-h-[650px]"
            >
              <div className="p-5 bg-nbac-panel/80 rounded-full border border-nbac-border/80 shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
                <Shield size={36} className="text-nbac-muted" />
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="font-sans text-lg font-bold text-nbac-text uppercase tracking-wide">
                  Select a Partnership Tier
                </h3>
                <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                  Please review the sponsorship details on the left and select your preferred tier to activate the corporate partnership application.
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
              className="bg-nbac-panel/80 border border-nbac-border rounded-xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6 z-30 min-h-[650px] shadow-2xl relative overflow-hidden"
            >
              {/* Gold/emerald glow effects */}
              <div className="absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-gold/8" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-emerald/5" />

              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                className="p-4 rounded-full border bg-nbac-gold/10 border-nbac-gold/30 shadow-[0_0_30px_rgba(197,160,89,0.2)]"
              >
                <CheckCircle2 size={48} className="text-nbac-gold" />
              </motion.div>

              <div className="max-w-md space-y-3">
                <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
                  Partnership Intent Logged
                </span>
                <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
                  Welcome as a Partner
                </h3>
                <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                  Thank you, <span className="font-semibold text-nbac-text">{formData.fullName}</span>. The sponsorship application for <span className="font-semibold text-nbac-text">{formData.companyName}</span> has been processed successfully.
                </p>
                <p className="font-sans text-xs text-nbac-muted font-light leading-relaxed">
                  In a production environment, our executive liaison team would be notified via Supabase, a corporate invoice of <span className="font-semibold text-nbac-text">{formatPrice(calculateTotal(submittedTier))}</span> would be issued, and a sponsor coordinator would reach out to ingest your branding assets.
                </p>
              </div>

              {/* Invoice Breakdown */}
              <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-5 w-full max-w-md text-left space-y-3 shadow-inner">
                <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                  <span className="text-nbac-muted uppercase tracking-wider">Company</span>
                  <span className="font-bold text-nbac-text truncate max-w-[200px]">{formData.companyName}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                  <span className="text-nbac-muted uppercase tracking-wider">Primary Tier</span>
                  <span className="font-bold text-nbac-gold uppercase">{submittedTier.name}</span>
                </div>
                
                {submittedAddOns.length > 0 && (
                  <div className="border-b border-nbac-border/60 pb-2 space-y-1.5">
                    <span className="text-nbac-muted uppercase tracking-wider text-[10px] block">Activations & Add-ons</span>
                    {submittedAddOns.map(addonId => {
                      const addon = SPONSOR_ADD_ONS.find(a => a.id === addonId)
                      if (!addon) return null
                      const isTrack = addonId === 'hackathon_track'
                      return (
                        <div key={addonId} className="flex justify-between items-center text-xs pl-2 border-l border-nbac-border">
                          <span className="text-nbac-body font-light">
                            + {addon.name} {isTrack ? `(x${submittedTrackCount})` : ''}
                          </span>
                          <span className="font-medium text-nbac-muted italic">
                            Price TBD
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="text-nbac-muted uppercase tracking-wider font-semibold">Total Invoice Amount</span>
                  <span className="font-bold text-nbac-gold-light text-sm">
                    {formatPrice(calculateTotal(submittedTier))} 
                    {submittedAddOns.length > 0 ? ' + Add-ons TBD' : ''}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setPaymentSuccess(false)
                  setSubmittedTier(null)
                  setSubmittedAddOns([])
                  setSubmittedTrackCount(1)
                  setFormData({
                    companyName: '',
                    industry: 'charter_operator',
                    website: '',
                    fullName: '',
                    designation: '',
                    email: '',
                    phone: '',
                    specialRequirements: ''
                  })
                  setSelectedAddOns([])
                  setTrackCount(1)
                }}
                className="border border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-canvas font-sans font-medium px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-colors"
              >
                Apply for Another Tier
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
              className="animated-glowing-border rounded-xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden group"
            >
              {/* Subtle gold glow background */}
              <div className="absolute -bottom-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-gold/4" />

              <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                {/* Active Package Banner */}
                <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-gold-light">Selected Partnership</span>
                    <h4 className="font-sans text-sm font-bold text-nbac-text uppercase tracking-wide mt-0.5">{selectedTier.name}</h4>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted">Base Price</span>
                    <p className="font-sans text-sm font-bold text-nbac-text mt-0.5">{formatPrice(selectedTier.price)}</p>
                  </div>
                </div>

                {/* Collapsible Benefits Preview inside the Form Container */}
                <div className="border border-nbac-border/60 bg-nbac-canvas/20 rounded-lg p-3">
                  <button
                    type="button"
                    onClick={() => setShowFormBenefits(!showFormBenefits)}
                    className="w-full flex items-center justify-between text-xs font-sans font-bold text-nbac-gold-light uppercase tracking-wider focus:outline-none cursor-pointer"
                  >
                    <span>What&apos;s included in this package?</span>
                    <span className="text-[10px] text-nbac-muted font-normal hover:text-nbac-text flex items-center gap-1">
                      {showFormBenefits ? 'Hide benefits' : 'Show benefits'}
                      {showFormBenefits ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showFormBenefits && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-nbac-border/40 text-[11px] font-sans font-light leading-relaxed text-nbac-body space-y-3"
                      >
                        <div>
                          <span className="font-bold text-nbac-text block mb-1">Branding & Presence:</span>
                          <ul className="list-disc pl-4 space-y-1">
                            {selectedTier.brandingPrivileges.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-nbac-text block mb-1">Speaking & Content:</span>
                          <ul className="list-disc pl-4 space-y-1">
                            {selectedTier.speakingPrivileges.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                        <div>
                          <span className="font-bold text-nbac-text block mb-1">Digital, Media & Access:</span>
                          <ul className="list-disc pl-4 space-y-1">
                            {selectedTier.digitalPrivileges.map((p, i) => <li key={i}>{p}</li>)}
                          </ul>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Company & Corporate Info */}
                <div className="space-y-4">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                    Company Information
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Company Name */}
                    <div className="space-y-2">
                      <label htmlFor="companyName" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                        <Building2 size={12} className="text-nbac-gold-light" />
                        Company Name <span className="text-nbac-gold-light">*</span>
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="e.g. ExecuJet Aviation"
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                      />
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                      <label htmlFor="industry" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                        <Layers size={12} className="text-nbac-gold-light" />
                        Industry Sector
                      </label>
                      <select
                        id="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                      >
                        <option value="charter_operator">Charter / Fleet Operator</option>
                        <option value="fbo_ground">FBO & Ground Handling</option>
                        <option value="aircraft_oem">Aircraft Manufacturer (OEM)</option>
                        <option value="legal_finance">Legal & Aviation Finance</option>
                        <option value="regulatory">Regulatory / CAA Authority</option>
                        <option value="services">Aviation Services & Maintenance</option>
                        <option value="other">Other Corporate Entity</option>
                      </select>
                    </div>
                  </div>

                  {/* Company Website */}
                  <div className="space-y-2">
                    <label htmlFor="website" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                      <Globe size={12} className="text-nbac-gold-light" />
                      Corporate Website <span className="text-nbac-gold-light">*</span>
                    </label>
                    <input
                      type="url"
                      id="website"
                      required
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="e.g. https://www.execujet.com"
                      className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Primary Contact details */}
                <div className="space-y-4">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                    Primary Liaison Contact
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact Full Name */}
                    <div className="space-y-2">
                      <label htmlFor="fullName" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                        <User size={12} className="text-nbac-gold-light" />
                        Full Name <span className="text-nbac-gold-light">*</span>
                      </label>
                      <input
                        type="text"
                        id="fullName"
                        required
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Captain Ruona"
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                      />
                    </div>

                    {/* Contact Designation */}
                    <div className="space-y-2">
                      <label htmlFor="designation" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                        <Briefcase size={12} className="text-nbac-gold-light" />
                        Designation / Title <span className="text-nbac-gold-light">*</span>
                      </label>
                      <input
                        type="text"
                        id="designation"
                        required
                        value={formData.designation}
                        onChange={handleInputChange}
                        placeholder="e.g. VP Marketing"
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Contact Email */}
                    <div className="space-y-2">
                      <label htmlFor="email" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                        <Mail size={12} className="text-nbac-gold-light" />
                        Email Address <span className="text-nbac-gold-light">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. liaison@execujet.com"
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div className="space-y-2">
                      <label htmlFor="phone" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted flex items-center gap-1.5">
                        <Phone size={12} className="text-nbac-gold-light" />
                        Direct Phone <span className="text-nbac-gold-light">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+234 803 999 8888"
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Sponsorship Add-Ons */}
                <div className="space-y-3.5">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                    Bolt-On Activations (Add-ons)
                  </h4>
                  <div className="space-y-3.5">
                    {SPONSOR_ADD_ONS.map(addon => {
                      const isSelected = selectedAddOns.includes(addon.id)
                      const isTrack = addon.id === 'hackathon_track'
                      return (
                        <div 
                          key={addon.id} 
                          onClick={() => toggleAddOn(addon.id)}
                          className={cn(
                            "p-3.5 rounded-lg border text-left cursor-pointer transition-all duration-300 relative select-none",
                            isSelected 
                              ? "bg-nbac-gold/5 border-nbac-gold/40 shadow-inner" 
                              : "bg-nbac-canvas/40 border-nbac-border hover:bg-nbac-canvas/80"
                          )}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                readOnly
                                className="mt-1 h-3.5 w-3.5 accent-nbac-gold cursor-pointer"
                              />
                              <div>
                                <h5 className="font-sans text-xs font-bold text-nbac-text">{addon.name}</h5>
                                <p className="font-sans text-[11px] text-nbac-muted leading-relaxed mt-0.5">{addon.description}</p>
                              </div>
                            </div>
                            <span className="font-sans font-semibold text-[10px] uppercase tracking-wider shrink-0 text-nbac-muted italic">
                              TBD
                            </span>
                          </div>
                          
                          {/* Sub-counter for Track Sponsor */}
                          {isTrack && isSelected && (
                            <div 
                              onClick={(e) => e.stopPropagation()} 
                              className="mt-3.5 flex items-center justify-between pl-6 border-t border-nbac-border/40 pt-2.5"
                            >
                              <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted">Number of challenge tracks:</span>
                              <div className="flex items-center gap-3 bg-nbac-canvas border border-nbac-border px-3 py-1 rounded-full">
                                <button
                                  type="button"
                                  onClick={handleTrackDecrement}
                                  disabled={trackCount <= 1}
                                  className="text-nbac-body hover:text-nbac-gold disabled:opacity-30 transition-colors"
                                >
                                  <Minus size={12} />
                                </button>
                                <span className="font-sans font-bold text-xs text-nbac-text w-4 text-center">{trackCount}</span>
                                <button
                                  type="button"
                                  onClick={handleTrackIncrement}
                                  disabled={trackCount >= 5}
                                  className="text-nbac-body hover:text-nbac-gold disabled:opacity-30 transition-colors"
                                >
                                  <Plus size={12} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Custom requirements / remarks */}
                <div className="space-y-2">
                  <label htmlFor="specialRequirements" className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-muted">
                    Custom Activations, Hospitality, or Branding Requests
                  </label>
                  <textarea
                    id="specialRequirements"
                    rows={3}
                    value={formData.specialRequirements}
                    onChange={handleInputChange}
                    placeholder="E.g. customized chalet hospitality, co-sponsored airport transfer service, custom booth layouts, or VIP catering requirements..."
                    className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:ring-1 focus:border-nbac-gold focus:ring-nbac-gold/30 transition-all duration-300 resize-none"
                  />
                </div>

                {/* Total Billing Display */}
                <div className="bg-nbac-alt/80 border border-nbac-border rounded-lg p-4 flex justify-between items-center shadow-inner">
                  <div className="space-y-0.5">
                    <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted">Estimated Sponsorship Cost</span>
                    <span className="block font-sans text-[10px] text-nbac-gold-light">All-inclusive VIP activations in USD</span>
                  </div>
                  <span className="font-display text-xl md:text-2xl font-extrabold tracking-tight text-nbac-gold">
                    {formatPrice(calculateTotal(selectedTier))}
                    {selectedAddOns.length > 0 ? ' + TBD' : ''}
                  </span>
                </div>

                {/* Corporate Security Notice */}
                <div className="flex items-center gap-2.5 bg-nbac-canvas/30 border border-nbac-border/30 rounded-lg p-3 text-nbac-muted text-[11px] leading-relaxed">
                  <Lock size={16} className="shrink-0 text-nbac-gold" />
                  <p>
                    Sponsorship applications generate a formal intent record. Our corporate liaison desk will review details and issue a secure invoice.
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
                      Ingesting Corporate Intent...
                    </>
                  ) : (
                    <>
                      <CreditCard size={14} />
                      Submit Partnership Application
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
