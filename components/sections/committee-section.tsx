'use client'

import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { X, Eye, Sparkles, Award, ArrowUpRight } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { STEERING_COMMITTEE_MEMBERS } from '@/lib/constants'
import { CommitteeMember } from '@/types'

gsap.registerPlugin(ScrollTrigger)

export function CommitteeSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const [selectedMember, setSelectedMember] = useState<CommitteeMember | null>(null)

  useEffect(() => {
    if (!selectedMember) return

    const previousActiveElement = document.activeElement as HTMLElement | null
    if (modalRef.current) {
      modalRef.current.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMember(null)
        return
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusableElements.length === 0) return

        const firstElement = focusableElements[0]
        const lastElement = focusableElements[focusableElements.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            lastElement.focus()
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  }, [selectedMember])

  // Duplicate the list of members to ensure seamless infinite looping marquee
  const duplicatedMembers = [
    ...STEERING_COMMITTEE_MEMBERS,
    ...STEERING_COMMITTEE_MEMBERS,
  ]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.comm-eyebrow', '.comm-heading', '.comm-divider', '.committee-card'],
          { opacity: 1, y: 0, scaleX: 1 }
        )
        return
      }

      /* ── Header entrance ──────────────────────────────── */
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      headerTl
        .fromTo('.comm-eyebrow',
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo('.comm-heading',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.comm-divider',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          '-=0.4'
        )

      /* ── Card stagger with scale pop ──────────────────── */
      gsap.fromTo(
        '.committee-card',
        { opacity: 0, y: 50, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.comm-slider-wrapper',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-alt px-6 md:px-24 overflow-hidden border-b border-nbac-border">
      <div className="max-w-7xl mx-auto flex flex-col items-center relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 space-y-3 max-w-2xl relative w-full">
          <SectionEyebrow className="comm-eyebrow">Leadership &amp; Vision</SectionEyebrow>
          <h2 className="comm-heading font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            Steering Committee
          </h2>
          <p className="font-sans text-xs md:text-sm font-light text-nbac-body pt-1">
            Click any leader to view executive biography
          </p>
          <div className="comm-divider h-1 w-24 bg-nbac-gold mx-auto rounded-full mt-4 origin-center" />
        </div>

        {/* Slider Wrapper */}
        <div className="comm-slider-wrapper w-full max-w-6xl relative px-4 md:px-10">
          {/* Viewport */}
          <div className="overflow-hidden w-full">
            <div className="flex flex-nowrap w-max -ml-6 md:-ml-8 animate-marquee hover:[animation-play-state:paused]">
              {duplicatedMembers.map((member, index) => {
                const roleLower = member.role.toLowerCase()
                const isPremiumRole = roleLower === 'chairman' || roleLower === 'vice chairman'
                return (
                  <div
                    key={`${member.name}-${index}`}
                    onClick={() => setSelectedMember(member)}
                    className="committee-card w-[280px] shrink-0 pl-6 md:pl-8 py-4 flex flex-col items-center relative group cursor-pointer"
                  >
                    <motion.div
                      className="w-full flex flex-col items-center"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {/* Portrait Avatar with Glowing Ring */}
                      <div className={`w-44 h-56 rounded-2xl border-[3px] overflow-hidden relative z-10 shadow-lg transition-all duration-300 group-hover:scale-105 ${isPremiumRole
                          ? 'border-nbac-gold shadow-nbac-gold/15 group-hover:border-nbac-gold-light group-hover:shadow-nbac-gold/35'
                          : 'border-nbac-emerald shadow-nbac-emerald/10 group-hover:border-nbac-emerald-light group-hover:shadow-nbac-emerald/30'
                        }`}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={352}
                          height={448}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{ objectPosition: member.objectPosition || 'center' }}
                          quality={75}
                          sizes="(max-width: 768px) 176px, 224px"
                        />
                        {/* Hover "View Bio" Overlay Badge */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-sans text-[11px] uppercase tracking-wider font-medium">
                            <Eye size={12} className="text-nbac-gold-light" />
                            View Bio
                          </span>
                        </div>
                      </div>

                      {/* Information Pill Overlay */}
                      <div className={`w-full bg-nbac-panel border rounded-xl px-6 pt-16 pb-5 text-center -mt-12 relative z-0 transition-colors duration-300 group-hover:bg-nbac-panel/90 shadow-md ${isPremiumRole
                          ? 'border-nbac-border group-hover:border-nbac-gold/30'
                          : 'border-nbac-border group-hover:border-nbac-emerald/30'
                        }`}>
                        <h3 className={`font-sans text-base font-semibold text-nbac-text leading-snug transition-colors duration-300 ${isPremiumRole ? 'group-hover:text-nbac-gold-light' : 'group-hover:text-nbac-emerald'
                          }`}>
                          {member.name}
                        </h3>
                        {member.role ? (
                          <p className={`font-sans text-xs font-medium tracking-wide mt-1 uppercase ${isPremiumRole ? 'text-nbac-gold-light' : 'text-nbac-emerald-light'
                            }`}>
                            {member.role}
                          </p>
                        ) : null}
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Revamped Executive Bio Modal */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop with Hardware Acceleration */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setSelectedMember(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Card Container */}
            <motion.div
              ref={modalRef}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              aria-labelledby="member-modal-title"
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="relative w-full max-w-3xl bg-linear-to-b from-nbac-panel via-nbac-panel to-nbac-canvas border border-nbac-gold/30 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden z-10 my-auto focus:outline-none"
            >
              {/* Top Luxury Gradient Bar */}
              <div className="h-1.5 w-full bg-linear-to-r from-nbac-gold via-nbac-emerald to-nbac-gold" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedMember(null)}
                className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-nbac-canvas/90 border border-nbac-border text-nbac-muted hover:text-nbac-gold hover:border-nbac-gold/60 flex items-center justify-center transition-all cursor-pointer shadow-lg"
                aria-label="Close bio modal"
              >
                <X size={18} />
              </button>

              {/* Inner Content Layout */}
              <div className="p-6 md:p-10 max-h-[82vh] overflow-y-auto space-y-8">
                {/* Header Profile Section */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start text-center sm:text-left relative">
                  
                  {/* Portrait Column */}
                  <div className="relative shrink-0">
                    <div className="absolute -top-4 -left-4 w-32 h-32 bg-nbac-gold/10 blur-[50px] rounded-full pointer-events-none" />
                    <div className="w-36 h-48 sm:w-44 sm:h-56 rounded-2xl border-2 border-nbac-gold/50 overflow-hidden relative shadow-[0_12px_36px_rgba(197,160,89,0.2)] z-10">
                      <Image
                        src={selectedMember.image}
                        alt={selectedMember.name}
                        fill
                        className="object-cover"
                        style={{ objectPosition: selectedMember.objectPosition || 'center' }}
                        sizes="176px"
                        quality={85}
                      />
                    </div>
                  </div>

                  {/* Title & Metadata Column */}
                  <div className="flex-1 space-y-3 pt-1">
                    {selectedMember.role ? (
                      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-nbac-gold/10 border border-nbac-gold/30 text-nbac-gold-light text-xs font-mono font-semibold uppercase tracking-widest">
                        <Award size={14} className="text-nbac-gold" />
                        <span>{selectedMember.role}</span>
                      </div>
                    ) : null}

                    <h3 id="member-modal-title" className="font-display text-3xl sm:text-4xl font-bold text-nbac-text tracking-tight leading-tight">
                      {selectedMember.name}
                    </h3>

                    <p className="font-sans text-xs uppercase tracking-wider text-nbac-emerald font-semibold">
                      Nigerian Business Aviation Conference • Steering Committee
                    </p>

                    <div className="h-0.5 w-full bg-linear-to-r from-nbac-gold/40 via-nbac-emerald/30 to-transparent pt-1" />
                  </div>
                </div>

                {/* Executive Biography Text */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-nbac-border/60 pb-2">
                    <span className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-gold flex items-center gap-2">
                      <Sparkles size={13} />
                      <span>Executive Biography</span>
                    </span>
                  </div>

                  <div className="space-y-4 font-sans text-sm md:text-base font-light text-nbac-body leading-relaxed">
                    {selectedMember.bio ? (
                      selectedMember.bio.split('\n\n').map((paragraph, i) => (
                        <div key={i} className="pl-4 border-l-2 border-l-nbac-gold/40 hover:border-l-nbac-gold transition-colors duration-300 py-0.5">
                          <p>{paragraph}</p>
                        </div>
                      ))
                    ) : (
                      <p className="pl-4 border-l-2 border-l-nbac-gold/40">
                        Executive leader and committee member for the Nigerian Business Aviation Conference.
                      </p>
                    )}
                  </div>
                </div>

                {/* Modal Footer Controls */}
                <div className="pt-4 border-t border-nbac-border/50 flex justify-end">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="inline-flex items-center gap-2 bg-nbac-panel border border-nbac-border hover:border-nbac-gold/40 text-nbac-body hover:text-nbac-text font-sans font-medium px-6 py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <span>Close Profile</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
