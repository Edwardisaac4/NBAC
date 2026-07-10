'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, User, Phone, Plus, Minus, Lock, CheckCircle2, Globe, Building2, Layers, Briefcase, Send, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SPONSOR_TIERS, SPONSOR_ADD_ONS } from '@/lib/constants'
import { SponsorTierDetails } from '@/types'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/shared/toast'

export default function SponsorContactPage() {
  const toast = useToast()
  const [selectedTier, setSelectedTier] = useState<SponsorTierDetails | null>(null)
  const [isTierLocked, setIsTierLocked] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tierParam = params.get('tier')
    const foundTier = SPONSOR_TIERS.find(t => t.id === (tierParam || 'bronze')) || null

    const timer = setTimeout(() => {
      if (foundTier) {
        setSelectedTier(foundTier)
      }
      if (tierParam) {
        setIsTierLocked(true)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])
  
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
  
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [trackCount, setTrackCount] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
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

  const handleTierChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tierId = e.target.value
    const foundTier = SPONSOR_TIERS.find(t => t.id === tierId)
    if (foundTier) {
      setSelectedTier(foundTier)
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTier) return
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('sponsors')
        .insert({
          company_name: formData.companyName,
          industry: formData.industry,
          website: formData.website,
          full_name: formData.fullName,
          designation: formData.designation,
          email: formData.email,
          phone: formData.phone,
          tier: selectedTier.name,
          add_ons: selectedAddOns,
          track_count: trackCount,
          special_requirements: formData.specialRequirements
        })
        
      if (error) {
        throw error
      }
      
      // Delay slightly for visual checkout uploader transition
      setTimeout(() => {
        setSubmittedTier(selectedTier)
        setSubmittedAddOns([...selectedAddOns])
        setSubmittedTrackCount(trackCount)
        setIsSubmitting(false)
        setSubmitSuccess(true)
      }, 1500)
    } catch (err) {
      setIsSubmitting(false)
      const msg = err instanceof Error ? err.message : String(err)
      toast.error('Sponsorship Submission Error', { description: msg })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <>
      <Navbar />
      
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-16 md:pb-24">
        
        {/* Header Hero Section */}
        <section className="max-w-4xl mx-auto px-6 w-full text-center pt-6 pb-10">
          {/* Back Button */}
          <div className="mb-6 flex justify-center">
            <Link 
              href="/reservations?type=sponsor"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-nbac-muted hover:text-nbac-gold transition-colors cursor-pointer group"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Catalog</span>
            </Link>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
              PARTNERSHIP ENGAGEMENT
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-nbac-text tracking-tight max-w-2xl leading-tight">
              Corporate Partnership desk
            </h1>
            <p className="font-sans text-sm md:text-base font-light text-nbac-body max-w-2xl leading-relaxed">
              Initiate your sponsorship intent for West Africa&apos;s premier aviation summit. Our executive liaison team will review your requirements and coordinate branding alignments.
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
                  className="bg-nbac-panel/80 border border-nbac-border rounded-2xl p-8 backdrop-blur-xl flex flex-col items-center justify-center text-center space-y-6 min-h-[650px] shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute -top-24 -left-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-gold/8" />
                  <div className="absolute -bottom-24 -right-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none bg-nbac-emerald/5" />

                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                    className="p-4 rounded-full border bg-nbac-gold/10 border-nbac-gold/30 shadow-[0_0_30px_rgba(197,160,89,0.25)]"
                  >
                    <CheckCircle2 className="h-12 w-12 text-nbac-gold" />
                  </motion.div>

                  <div className="max-w-md space-y-3">
                    <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
                      Partnership Inquiry Received
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
                      Thank You for Your Intent
                    </h3>
                    <p className="font-sans text-sm text-nbac-body font-light leading-relaxed">
                      Thank you, <span className="font-semibold text-nbac-text">{formData.fullName}</span>. The partnership intent for <span className="font-semibold text-nbac-text">{formData.companyName}</span> has been transmitted successfully.
                    </p>
                    <p className="font-sans text-xs text-nbac-muted font-light leading-relaxed">
                      Our corporate liaison team will review your application details, issue the corresponding sponsorship contract, and reach out to ingest your brand assets.
                    </p>
                  </div>

                  {/* Summary Details */}
                  <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-5 w-full max-w-md text-left space-y-3 shadow-inner">
                    <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                      <span className="text-nbac-muted uppercase tracking-wider">Company</span>
                      <span className="font-bold text-nbac-text truncate max-w-[200px]">{formData.companyName}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs border-b border-nbac-border/60 pb-2">
                      <span className="text-nbac-muted uppercase tracking-wider">Requested Tier</span>
                      <span className="font-bold text-nbac-gold uppercase">{submittedTier.name}</span>
                    </div>
                    
                    {submittedAddOns.length > 0 && (
                      <div className="border-b border-nbac-border/60 pb-2 space-y-1.5">
                        <span className="text-nbac-muted uppercase tracking-wider text-[10px] block">Bolt-On Activations</span>
                        {submittedAddOns.map(addonId => {
                          const addon = SPONSOR_ADD_ONS.find(a => a.id === addonId)
                          if (!addon) return null
                          const isTrack = addonId === 'hackathon_track'
                          return (
                            <div key={addonId} className="flex justify-between items-center text-xs pl-2 border-l border-nbac-border">
                              <span className="text-nbac-body font-light">
                                + {addon.name} {isTrack ? `(x${submittedTrackCount})` : ''}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-nbac-muted uppercase tracking-wider font-semibold">Base Sponsorship Cost</span>
                      <span className="font-bold text-nbac-gold-light text-sm">
                        {formatPrice(calculateTotal(submittedTier))} 
                        {submittedAddOns.length > 0 ? ' + Add-ons TBD' : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSubmitSuccess(false)
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
                      setIsTierLocked(false)
                      if (typeof window !== 'undefined') {
                        const url = new URL(window.location.href)
                        url.search = ''
                        window.history.pushState({}, '', url.toString())
                      }
                    }}
                    className="border border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-canvas font-sans font-medium px-8 py-3 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Submit Another Inquiry
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
                      <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold-light">
                        Partnership Intake
                      </span>
                      <h2 className="font-display text-2xl font-bold text-nbac-text tracking-tight">
                        Executive Liaison desk
                      </h2>
                    </div>

                    {/* Pre-selected Tier & Price Banner */}
                    {selectedTier && (
                      <div className="bg-nbac-canvas/80 border border-nbac-border rounded-lg p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-gold-light">
                            Selected Partnership Tier
                          </span>
                          <h4 className="font-sans text-base font-bold text-nbac-text uppercase tracking-wide mt-0.5">
                            {selectedTier.name}
                          </h4>
                        </div>
                        <div className="text-left sm:text-right">
                          <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted">
                            Cost (USD)
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
                        Select Sponsorship Classification
                        {isTierLocked && (
                          <span className="text-[10px] text-nbac-gold-light normal-case flex items-center gap-1">
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
                            "w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm appearance-none focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300",
                            isTierLocked ? "cursor-not-allowed opacity-70" : "cursor-pointer"
                          )}
                        >
                          {SPONSOR_TIERS.map((t) => (
                            <option key={t.id} value={t.id} className="bg-nbac-panel text-nbac-text">
                              {t.name} ({formatPrice(t.price)} USD)
                            </option>
                          ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-nbac-muted">
                          {isTierLocked ? (
                            <Lock size={13} className="text-nbac-gold-light" />
                          ) : (
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="space-y-5">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                        Company Details
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Company Name */}
                        <div className="space-y-2">
                          <label htmlFor="companyName" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Building2 size={13} className="text-nbac-gold-light" />
                            Company Name <span className="text-nbac-gold-light">*</span>
                          </label>
                          <input
                            type="text"
                            id="companyName"
                            required
                            value={formData.companyName}
                            onChange={handleInputChange}
                            placeholder="e.g. Executive Jets West Africa"
                            className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300"
                          />
                        </div>

                        {/* Industry */}
                        <div className="space-y-2">
                          <label htmlFor="industry" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Layers size={13} className="text-nbac-gold-light" />
                            Industry Sector
                          </label>
                          <select
                            id="industry"
                            value={formData.industry}
                            onChange={handleInputChange}
                            className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300 cursor-pointer"
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
                        <label htmlFor="website" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                          <Globe size={13} className="text-nbac-gold-light" />
                          Corporate Website <span className="text-nbac-gold-light">*</span>
                        </label>
                        <input
                          type="url"
                          id="website"
                          required
                          value={formData.website}
                          onChange={handleInputChange}
                          placeholder="e.g. https://www.executivejets.com"
                          className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300"
                        />
                      </div>
                    </div>

                    {/* Primary Contact details */}
                    <div className="space-y-5">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                        Primary Liaison Contact
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Contact Full Name */}
                        <div className="space-y-2">
                          <label htmlFor="fullName" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <User size={13} className="text-nbac-gold-light" />
                            Full Name <span className="text-nbac-gold-light">*</span>
                          </label>
                          <input
                            type="text"
                            id="fullName"
                            required
                            value={formData.fullName}
                            onChange={handleInputChange}
                            placeholder="e.g. Captain Ruona"
                            className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300"
                          />
                        </div>

                        {/* Contact Designation */}
                        <div className="space-y-2">
                          <label htmlFor="designation" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Briefcase size={13} className="text-nbac-gold-light" />
                            Designation / Title <span className="text-nbac-gold-light">*</span>
                          </label>
                          <input
                            type="text"
                            id="designation"
                            required
                            value={formData.designation}
                            onChange={handleInputChange}
                            placeholder="e.g. VP Marketing"
                            className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Contact Email */}
                        <div className="space-y-2">
                          <label htmlFor="email" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Mail size={13} className="text-nbac-gold-light" />
                            Email Address <span className="text-nbac-gold-light">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            required
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="e.g. liaison@executivejets.com"
                            className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300"
                          />
                        </div>

                        {/* Contact Phone */}
                        <div className="space-y-2">
                          <label htmlFor="phone" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted flex items-center gap-1.5">
                            <Phone size={13} className="text-nbac-gold-light" />
                            Direct Phone <span className="text-nbac-gold-light">*</span>
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="+234 803 999 8888"
                            className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Sponsorship Add-Ons */}
                    <div className="space-y-4">
                      <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-nbac-text border-b border-nbac-border pb-1">
                        Bolt-On Activations (Optional)
                      </h4>
                      <div className="space-y-3">
                        {SPONSOR_ADD_ONS.map(addon => {
                          const isSelected = selectedAddOns.includes(addon.id)
                          const isTrack = addon.id === 'hackathon_track'
                          return (
                            <div 
                              key={addon.id} 
                              onClick={() => toggleAddOn(addon.id)}
                              className={cn(
                                "p-4 rounded-lg border text-left cursor-pointer transition-all duration-300 relative select-none",
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
                                      className="text-nbac-body hover:text-nbac-gold disabled:opacity-30 transition-colors cursor-pointer"
                                    >
                                      <Minus size={12} />
                                    </button>
                                    <span className="font-sans font-bold text-xs text-nbac-text w-4 text-center">{trackCount}</span>
                                    <button
                                      type="button"
                                      onClick={handleTrackIncrement}
                                      disabled={trackCount >= 5}
                                      className="text-nbac-body hover:text-nbac-gold disabled:opacity-30 transition-colors cursor-pointer"
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

                    {/* Custom Requirements / Remarks */}
                    <div className="space-y-2">
                      <label htmlFor="specialRequirements" className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-muted">
                        Custom Activations, Hospitality, or Branding Requests
                      </label>
                      <textarea
                        id="specialRequirements"
                        rows={4}
                        value={formData.specialRequirements}
                        onChange={handleInputChange}
                        placeholder="E.g. customized chalet hospitality, co-sponsored airport transfer service, custom booth layouts, or VIP catering requirements..."
                        className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-gold focus:ring-1 focus:ring-nbac-gold/30 transition-all duration-300 resize-none"
                      />
                    </div>

                    {/* Security Info */}
                    <div className="flex items-center gap-2.5 bg-nbac-canvas/30 border border-nbac-border/30 rounded-lg p-3.5 text-nbac-muted text-xs leading-relaxed">
                      <Lock size={15} className="shrink-0 text-nbac-gold" />
                      <p>
                        Your details are securely routed to the conference secretariat. Our liaison desk will contact you within 24 business hours.
                      </p>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2.5 disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98] bg-linear-to-r from-nbac-gold to-nbac-gold-light text-[#0b0f10] shadow-[0_4px_15px_rgba(197,160,89,0.2)] hover:shadow-[0_6px_20px_rgba(197,160,89,0.35)] cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0f10] border-t-transparent" />
                          Ingesting Intent...
                        </>
                      ) : (
                        <>
                          <Send size={13} />
                          Transmit Partnership Intent
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
