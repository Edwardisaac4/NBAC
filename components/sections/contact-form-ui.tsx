'use client'

import { motion } from 'framer-motion'
import { Send, Mail } from 'lucide-react'

export function ContactFormUI() {
  const inquiryTypes = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'hotel', label: 'Hotel & Accommodation' },
    { value: 'charter', label: 'Charter Flight Coordination' },
    { value: 'sponsorship', label: 'Sponsorship & Exhibitions' },
    { value: 'media', label: 'Media Relations' },
    { value: 'vip', label: 'VIP Delegation Handling' }
  ]

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
        className="animated-glowing-border rounded-xl p-6 md:p-8 backdrop-blur-xl relative overflow-hidden group shadow-2xl"
        whileHover={{
          boxShadow: '0 12px 40px rgba(16, 185, 129, 0.06)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Subtle glow background */}
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-nbac-emerald/[0.03] blur-[80px] rounded-full pointer-events-none" />

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6 relative z-10">
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
                defaultValue=""
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
            className="w-full bg-gradient-to-r from-nbac-emerald to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-sans font-bold py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_15px_rgba(16,185,129,0.2)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_6px_20px_rgba(16,185,129,0.4)] active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Send size={14} />
            Transmit Executive Inquiry
          </button>
        </form>
      </motion.div>
    </div>
  )
}
