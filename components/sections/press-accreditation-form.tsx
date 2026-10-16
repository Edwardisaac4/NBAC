'use client'

import React, { useState } from 'react'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'
import { motion, AnimatePresence } from 'framer-motion'
import { Newspaper, CheckCircle2, AlertCircle, Send, Check } from 'lucide-react'
import Link from 'next/link'
import { MEDIA_TYPES, type MediaType } from '@/lib/press'

// 16px type on mobile keeps iOS from zooming the page in on focus
const inputClass =
  'w-full bg-[#0b0f10] border border-nbac-border focus:border-nbac-gold rounded-lg px-4 py-3 text-base sm:text-sm text-nbac-text focus:outline-none transition-colors'
const labelClass =
  'block text-xs font-semibold uppercase tracking-wider text-nbac-muted mb-1.5'

function StepHeading({ step, children }: { step: number; children: React.ReactNode }) {
  return (
    <h3 className="font-sans text-lg font-bold text-nbac-text flex items-center gap-2">
      <span className="w-6 h-6 rounded-full bg-nbac-gold/20 text-nbac-gold border border-nbac-gold/30 text-xs font-bold flex items-center justify-center">
        {step}
      </span>
      <span>{children}</span>
    </h3>
  )
}
/**
 * The journalist / media accreditation form, shared by /contact/press and the
 * Media tab on /reservations so the two can never drift apart.
 *
 * showHeader=false drops the built-in title block for hosts that render their
 * own, such as the Reservations page hero.
 */
export function PressAccreditationForm({ showHeader = true }: { showHeader?: boolean }) {
  const [fullName, setFullName] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [country, setCountry] = useState('')
  const [mediaType, setMediaType] = useState<MediaType | ''>('')
  const [outlet, setOutlet] = useState('')
  const [outletWebsite, setOutletWebsite] = useState('')
  const [coveragePlan, setCoveragePlan] = useState('')
  const [additionalCrew, setAdditionalCrew] = useState('')
  const [consent, setConsent] = useState(false)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [submitted, setSubmitted] = useState<{ reference: string; emailed: boolean } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!fullName.trim() || !jobTitle.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Please complete your name, job title, email and phone number.')
      return
    }
    if (!mediaType) {
      setErrorMsg('Please select the type of media you represent.')
      return
    }
    if (!outlet.trim()) {
      setErrorMsg('Please enter the media outlet you represent, or "Freelance".')
      return
    }
    if (!consent) {
      setErrorMsg('Please confirm the declaration before submitting.')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/register/press', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          jobTitle: jobTitle.trim(),
          email: email.trim(),
          phone: phone.trim(),
          country: country.trim(),
          mediaType,
          outlet: outlet.trim(),
          outletWebsite: outletWebsite.trim(),
          coveragePlan: coveragePlan.trim(),
          additionalCrew: additionalCrew.trim(),
          consent,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit your accreditation request.')
      }

      setSubmitted({ reference: data.reference, emailed: Boolean(data.confirmationEmailed) })
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {submitted ? (
        /* Success Confirmation Card */
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="bg-nbac-panel border border-nbac-emerald/40 rounded-2xl p-6 sm:p-8 md:p-12 text-center space-y-6 shadow-2xl"
        >
          <div className="w-16 h-16 rounded-full bg-nbac-emerald/20 border border-nbac-emerald/40 flex items-center justify-center mx-auto text-nbac-emerald">
            <CheckCircle2 size={36} />
          </div>

          <div>
            <span className="font-sans text-xs font-bold uppercase tracking-widest text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-3 py-1 rounded-full inline-block mb-3">
              Registration Received
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-nbac-text mb-3">
              Thank you for registering, {fullName.split(' ')[0]}
            </h2>
            <p className="font-sans text-sm text-nbac-body max-w-lg mx-auto leading-relaxed">
              Your media accreditation request for <strong>{outlet}</strong> has been received and is being reviewed.
              A confirmation will be sent to <strong className="break-all">{email}</strong> once all due procedures
              have been completed.
            </p>
          </div>

          <div className="bg-nbac-panel/40 border border-nbac-border/60 rounded-xl p-5 max-w-lg mx-auto text-left text-xs font-light text-nbac-body leading-relaxed space-y-2">
            <p className="font-bold text-nbac-text text-sm mb-1 flex items-center gap-1.5">
              <Newspaper className="w-4 h-4 text-nbac-gold" />
              <span>What Happens Next?</span>
            </p>
            {submitted.emailed ? (
              <p>1. An acknowledgement of your registration has been emailed to you.</p>
            ) : (
              <p>1. We could not email you an acknowledgement just now, but your registration has been saved.</p>
            )}
            <p>2. Our media team is reviewing your request and the outlet you represent.</p>
            <p>3. Once all due procedures have been completed, your confirmation will be sent to your email.</p>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-bold text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition-colors"
            >
              Return Home
            </Link>
            <Link
              href="/contact"
              className="border border-nbac-border hover:border-nbac-gold/40 text-nbac-text font-sans font-medium text-xs uppercase tracking-widest px-8 py-3.5 rounded-full transition-colors"
            >
              Contact the Team
            </Link>
          </div>
        </motion.div>
      ) : (
        /* Accreditation Form */
        <motion.div
          key="form"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="space-y-10"
        >
          {/* Header — omitted when the host page renders its own */}
          {showHeader && (
            <div className="text-center md:text-left border-b border-nbac-border/50 pb-8">
              <SectionEyebrow>NBAC 2027 MEDIA</SectionEyebrow>
              <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-3">
                Media <span className="italic text-nbac-emerald font-semibold">Accreditation</span>
              </h1>
              <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl">
                Journalists, editors, photographers and broadcast crews covering NBAC 2027 can request
                accreditation here. Every request is reviewed by our media team before it is approved.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-10" noValidate>
            {/* Step 1: Personal Details */}
            <div className="space-y-4">
              <StepHeading step={1}>Your Details</StepHeading>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className={labelClass}>Full Name *</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    autoComplete="name"
                    maxLength={100}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Adaeze Okafor"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="jobTitle" className={labelClass}>Job Title / Role *</label>
                  <input
                    id="jobTitle"
                    type="text"
                    required
                    autoComplete="organization-title"
                    maxLength={100}
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Aviation Correspondent"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>Email *</label>
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    maxLength={254}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@outlet.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>Phone / WhatsApp *</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    autoComplete="tel"
                    maxLength={30}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+234 803 123 4567"
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="country" className={labelClass}>Country</label>
                  <input
                    id="country"
                    type="text"
                    autoComplete="country-name"
                    maxLength={100}
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. Nigeria"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Media Organisation */}
            <div className="space-y-4 pt-4 border-t border-nbac-border/40">
              <StepHeading step={2}>Media Organisation</StepHeading>

              <div>
                <span id="mediaTypeLabel" className={labelClass}>Media Type *</span>
                <div role="radiogroup" aria-labelledby="mediaTypeLabel" className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                  {MEDIA_TYPES.map((type) => {
                    const isSelected = mediaType === type.value
                    return (
                      <label
                        key={type.value}
                        className={`cursor-pointer rounded-lg px-3 py-3 border text-xs font-medium transition-all flex items-center justify-between gap-2 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-nbac-gold/70 ${
                          isSelected
                            ? 'bg-nbac-panel border-nbac-gold text-nbac-gold-light ring-1 ring-nbac-gold/50'
                            : 'bg-nbac-panel/30 border-nbac-border/60 text-nbac-body hover:border-nbac-border hover:bg-nbac-panel/60'
                        }`}
                      >
                        <input
                          type="radio"
                          name="mediaType"
                          value={type.value}
                          checked={isSelected}
                          onChange={() => setMediaType(type.value)}
                          className="sr-only"
                        />
                        <span>{type.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-nbac-gold" />}
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="outlet" className={labelClass}>Media Outlet *</label>
                  <input
                    id="outlet"
                    type="text"
                    required
                    autoComplete="organization"
                    maxLength={200}
                    value={outlet}
                    onChange={(e) => setOutlet(e.target.value)}
                    placeholder='e.g. BusinessDay, or "Freelance"'
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="outletWebsite" className={labelClass}>Outlet Website</label>
                  <input
                    id="outletWebsite"
                    type="url"
                    maxLength={2048}
                    value={outletWebsite}
                    onChange={(e) => setOutletWebsite(e.target.value)}
                    placeholder="https://"
                    className={`${inputClass} font-mono`}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Coverage */}
            <div className="space-y-4 pt-4 border-t border-nbac-border/40">
              <StepHeading step={3}>Coverage Plans</StepHeading>

              <div>
                <label htmlFor="coveragePlan" className={labelClass}>What do you plan to cover?</label>
                <textarea
                  id="coveragePlan"
                  rows={4}
                  maxLength={2000}
                  value={coveragePlan}
                  onChange={(e) => setCoveragePlan(e.target.value)}
                  placeholder="Sessions you plan to cover, interview requests, publication or broadcast plans..."
                  className={`${inputClass} leading-relaxed`}
                />
              </div>

              <div>
                <label htmlFor="additionalCrew" className={labelClass}>Additional Crew Needing Access</label>
                <textarea
                  id="additionalCrew"
                  rows={3}
                  maxLength={1000}
                  value={additionalCrew}
                  onChange={(e) => setAdditionalCrew(e.target.value)}
                  placeholder="Names and roles, e.g. camera operator, sound technician"
                  className={`${inputClass} leading-relaxed`}
                />
              </div>
            </div>

            {/* Declaration */}
            <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-nbac-border/60 bg-nbac-panel/30 p-4 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-nbac-gold/70">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#c5a059] cursor-pointer"
              />
              <span className="text-xs text-nbac-body leading-relaxed">
                I confirm the information above is accurate and that I am attending in a professional media
                capacity. I understand NBAC may verify my credentials, and that accreditation is subject to approval. *
              </span>
            </label>

            {errorMsg && (
              <div role="alert" className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-6 border-t border-nbac-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-nbac-muted font-light">
                Questions? <Link href="/contact" className="text-nbac-gold hover:underline">Contact the NBAC team</Link>.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto justify-center bg-nbac-emerald hover:bg-nbac-emerald-dark disabled:opacity-50 text-white font-sans font-bold text-xs uppercase tracking-widest px-10 py-4 rounded-full transition-colors flex items-center gap-2 shrink-0 shadow-lg shadow-nbac-emerald/20 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Request Accreditation</span>
                    <Send size={14} />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
