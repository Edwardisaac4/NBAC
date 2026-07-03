'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Target, Users } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { CONFERENCE_OBJECTIVES, TARGET_AUDIENCE } from '@/lib/constants'

gsap.registerPlugin(ScrollTrigger)

export function AboutObjectives() {
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.obj-eyebrow', '.obj-title', '.obj-card'],
          { opacity: 1, y: 0, scale: 1 }
        )
        return
      }

      // Set initial hidden states
      gsap.set('.obj-eyebrow', { opacity: 0, y: -16 })
      gsap.set('.obj-title', { opacity: 0, y: 30 })
      gsap.set('.obj-card', { opacity: 0, y: 40, scale: 0.95 })

      // Entrance animation — fires once when section enters viewport
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      })

      tl.to('.obj-eyebrow', { opacity: 1, y: 0, duration: 0.6 })
      tl.to('.obj-title', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      tl.to('.obj-card', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.9,
        stagger: 0.2,
        ease: 'power3.out',
      }, '-=0.4')
    },
    { scope: sectionRef }
  )

  const cardHover = {
    y: -6,
    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.08)',
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 bg-nbac-alt overflow-hidden"
    >
      {/* Background glow */}
      <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-nbac-emerald/[0.04] blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-64 h-64 bg-nbac-emerald/[0.03] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-24">
        {/* Section Header */}
        <div className="text-center mb-14 md:mb-20">
          <SectionEyebrow className="obj-eyebrow">
            Purpose &amp; Audience
          </SectionEyebrow>
          <h2 className="obj-title font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight leading-tight mt-4">
            Why We Gather,{' '}
            <span className="text-nbac-emerald">Who We Serve</span>
          </h2>
        </div>

        {/* Two-column card grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Conference Objectives Card */}
          <motion.div
            className="obj-card relative overflow-hidden group rounded-2xl border border-nbac-border/60 bg-gradient-to-br from-nbac-panel via-nbac-panel to-nbac-emerald/[0.03] transition-all duration-500 hover:border-nbac-emerald/30 hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)]"
            whileHover={cardHover}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Emerald top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-nbac-emerald/80 via-nbac-emerald to-nbac-emerald/40" />

            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-nbac-emerald/[0.04] blur-[60px] rounded-full pointer-events-none group-hover:bg-nbac-emerald/[0.08] transition-colors duration-700" />

            <div className="relative z-10 p-7 md:p-9 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-nbac-emerald/10 border border-nbac-emerald/20 flex items-center justify-center text-nbac-emerald group-hover:bg-nbac-emerald/15 group-hover:border-nbac-emerald/30 transition-all duration-400">
                    <Target size={22} strokeWidth={1.8} />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-nbac-text tracking-widest uppercase">
                    Conference Objectives
                  </h3>
                  <p className="font-sans text-xs text-nbac-muted mt-0.5">Our strategic priorities</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-nbac-border via-nbac-border/50 to-transparent" />

              {/* Numbered list */}
              <ol className="space-y-0">
                {CONFERENCE_OBJECTIVES.map((text, i) => (
                  <li
                    key={i}
                    className="group/item flex items-start gap-4 py-3.5 border-b border-nbac-border/30 last:border-b-0 transition-colors duration-300 hover:bg-nbac-emerald/[0.02] -mx-3 px-3 rounded-lg"
                  >
                    <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-nbac-emerald/10 border border-nbac-emerald/20 flex items-center justify-center font-sans text-xs font-semibold text-nbac-emerald tabular-nums group-hover/item:bg-nbac-emerald/20 group-hover/item:border-nbac-emerald/40 transition-all duration-300">
                      {i + 1}
                    </span>
                    <span className="font-sans text-sm font-light text-nbac-body leading-relaxed pt-0.5 transition-colors duration-300 group-hover/item:text-nbac-text">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Watermark icon */}
            <Target
              size={160}
              strokeWidth={0.5}
              className="absolute -bottom-8 -right-8 text-nbac-emerald/[0.03] group-hover:text-nbac-emerald/[0.06] group-hover:rotate-6 transition-all duration-700 pointer-events-none"
            />
          </motion.div>

          {/* Target Audience Card */}
          <motion.div
            className="obj-card relative overflow-hidden group rounded-2xl border border-nbac-border/60 bg-gradient-to-br from-nbac-panel via-nbac-panel to-nbac-emerald/[0.03] transition-all duration-500 hover:border-nbac-emerald/30 hover:shadow-[0_8px_40px_rgba(16,185,129,0.08)]"
            whileHover={cardHover}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            {/* Emerald top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-nbac-emerald/40 via-nbac-emerald to-nbac-emerald/80" />

            {/* Corner glow */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-nbac-emerald/[0.04] blur-[60px] rounded-full pointer-events-none group-hover:bg-nbac-emerald/[0.08] transition-colors duration-700" />

            <div className="relative z-10 p-7 md:p-9 space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 rounded-xl bg-nbac-emerald/10 border border-nbac-emerald/20 flex items-center justify-center text-nbac-emerald group-hover:bg-nbac-emerald/15 group-hover:border-nbac-emerald/30 transition-all duration-400">
                    <Users size={22} strokeWidth={1.8} />
                  </div>
                </div>
                <div>
                  <h3 className="font-sans text-base font-bold text-nbac-text tracking-widest uppercase">
                    Target Audience
                  </h3>
                  <p className="font-sans text-xs text-nbac-muted mt-0.5">Who this conference is for</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-nbac-border via-nbac-border/50 to-transparent" />

              {/* Numbered list */}
              <ol className="space-y-0">
                {TARGET_AUDIENCE.map((text, i) => (
                  <li
                    key={i}
                    className="group/item flex items-start gap-4 py-3.5 border-b border-nbac-border/30 last:border-b-0 transition-colors duration-300 hover:bg-nbac-emerald/[0.02] -mx-3 px-3 rounded-lg"
                  >
                    <span className="mt-0.5 shrink-0 w-7 h-7 rounded-full bg-nbac-emerald/10 border border-nbac-emerald/20 flex items-center justify-center font-sans text-xs font-semibold text-nbac-emerald tabular-nums group-hover/item:bg-nbac-emerald/20 group-hover/item:border-nbac-emerald/40 transition-all duration-300">
                      {i + 1}
                    </span>
                    <span className="font-sans text-sm font-light text-nbac-body leading-relaxed pt-0.5 transition-colors duration-300 group-hover/item:text-nbac-text">
                      {text}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Watermark icon */}
            <Users
              size={160}
              strokeWidth={0.5}
              className="absolute -bottom-8 -right-8 text-nbac-emerald/[0.03] group-hover:text-nbac-emerald/[0.06] group-hover:rotate-6 transition-all duration-700 pointer-events-none"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
