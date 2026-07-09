'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mail, CheckCircle2 } from 'lucide-react'

export function ContactFormUI() {
  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'aerolabs', label: 'AeroLabs' },
    { value: 'sponsorship', label: 'Sponsorships' },
    { value: 'registration', label: 'Event Registration' },
    { value: 'aircraft_display', label: 'Aircraft Display' },
    { value: 'others', label: 'Others' }
  ]

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    phone: '',
    inquiryType: '',
    message: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          company: formData.company || null,
          phone: formData.phone || null,
          inquiryType: formData.inquiryType,
          message: formData.message
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`)
      }

      setTimeout(() => {
        setIsSubmitting(false)
        setSubmitSuccess(true)
      }, 1500)
    } catch (err) {
      setIsSubmitting(false)
      const msg = err instanceof Error ? err.message : String(err)
      alert(`Submission Error: ${msg}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 mb-6">
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
          Secure Communication
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
          Executive Inquiry Desk
        </h2>
      </div>

      <motion.div
        className="sponsor-animated-border rounded-2xl p-6 md:p-8 backdrop-blur-xl relative shadow-2xl"
        whileHover={{
          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.06)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Subtle glow background */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-nbac-emerald/[0.03] blur-[80px] rounded-full pointer-events-none" />

        <AnimatePresence mode="wait">
          {submitSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-10 space-y-6 relative z-10"
            >
              <div className="p-4 rounded-full border bg-nbac-emerald/10 border-nbac-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.2)] w-20 h-20 flex items-center justify-center mx-auto">
                <CheckCircle2 size={40} className="text-nbac-emerald" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-2xl font-bold text-nbac-text">Inquiry Transmitted</h3>
                <p className="font-sans text-sm text-nbac-body font-light max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="font-semibold text-nbac-text">{formData.fullName}</span>. Your message has been received by the NBAC Organizing Secretariat. We will contact you shortly.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubmitSuccess(false)
                  setFormData({ fullName: '', email: '', company: '', phone: '', inquiryType: '', message: '' })
                }}
                className="border border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-canvas font-sans font-medium px-8 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Send Another Inquiry
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <label htmlFor="fullName" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted">
                    Full Name <span className="text-nbac-emerald">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    required
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Capt. Tunde Demuren"
                    className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all duration-300"
                  />
                </div>

                {/* Corporate Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted">
                    Corporate Email <span className="text-nbac-emerald">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="executive@airline.com"
                    className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Company / Operator */}
                <div className="space-y-2">
                  <label htmlFor="company" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted">
                    Company / Operator
                  </label>
                  <input
                    type="text"
                    id="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Aero Contractors Ltd."
                    className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all duration-300"
                  />
                </div>

                {/* Contact Number */}
                <div className="space-y-2">
                  <label htmlFor="phone" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+234 (0) 803 123 4567"
                    className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Inquiry Type */}
              <div className="space-y-2">
                <label htmlFor="inquiryType" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted">
                  Inquiry Type <span className="text-nbac-emerald">*</span>
                </label>
                <div className="relative">
                  <select
                    id="inquiryType"
                    value={formData.inquiryType}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text font-sans text-sm appearance-none focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all duration-300 cursor-pointer"
                  >
                    <option value="" disabled className="bg-nbac-panel text-nbac-muted">
                      Select inquiry classification...
                    </option>
                    {inquiryTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-nbac-panel text-nbac-text">
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-nbac-muted">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label htmlFor="message" className="font-sans text-xs uppercase tracking-widest font-medium text-nbac-muted">
                  Inquiry Details / Requirements <span className="text-nbac-emerald">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  value={formData.message}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Outline your specific coordination requests, sponsorship requirements, or pass queries here..."
                  className="w-full bg-nbac-canvas/80 border border-nbac-border rounded-lg px-4 py-3 text-nbac-text placeholder:text-nbac-muted/65 font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald/30 transition-all duration-300 resize-none"
                />
              </div>

              {/* Note on data handling */}
              <div className="flex items-start gap-2.5 bg-nbac-canvas/30 border border-nbac-border/30 rounded-lg p-3 text-nbac-muted text-[11px] leading-relaxed">
                <Mail size={16} className="text-nbac-emerald shrink-0 mt-0.5" />
                <p>
                  By submitting this inquiry, your details will be securely routed directly to the NBAC Organizing Secretariat for immediate review and follow-up.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_6px_20px_rgba(197,160,89,0.45)] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0b0f10] border-t-transparent" />
                    Transmitting Inquiry...
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    Transmit Executive Inquiry
                  </>
                )}
              </button>
            </form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
