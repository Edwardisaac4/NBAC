'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useReducedMotion } from 'framer-motion'
import { Target, Coins, ShieldCheck, Building2, CheckCircle2, Sparkles } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export interface DescriptiveObjective {
  number: string
  title: string
  tagline: string
  description: string
  icon: typeof Target
  keyFocus: string[]
}

export const DETAILED_OBJECTIVES: DescriptiveObjective[] = [
  {
    number: '01',
    title: 'Stakeholder Engagement & Ecosystem Synergy',
    tagline: 'Fostering High-Level Cross-Industry Dialogue & Collaboration',
    description:
      'Elevating awareness of business aviation as a critical catalyst for regional economic growth. NBAC serves as West Africa’s premier closed-door platform where high-net-worth aircraft owners, operators, regulators, FBO providers, and OEM executives convene to exchange strategic insights, align on operational priorities, and drive regional aviation integration.',
    icon: Target,
    keyFocus: [
      'C-Suite & Ministerial Dialogue',
      'Cross-Border Operational Integration',
      'Strategic OEM & Operator Partnerships',
    ],
  },
  {
    number: '02',
    title: 'Custom Financial Structures & Asset Capitalization',
    tagline: 'Unlocking Customized Financing & Leasing Models for Africa',
    description:
      'Addressing liquidity, currency volatility, and cross-border asset registration challenges across African markets. The conference convenes international aviation financiers, domestic commercial banks, lessor syndicates, and private equity leaders to structure specialized debt facilities, lease-to-own models, and risk mitigation tools tailored for regional operators.',
    icon: Coins,
    keyFocus: [
      'Aircraft Acquisition & Leasing Frameworks',
      'Domestic Bank Debt Syndication',
      'Cross-Border Asset Protection & Insurance',
    ],
  },
  {
    number: '03',
    title: 'Regulatory Harmonization & Safety Standards',
    tagline: 'Championing World-Class Standards & Policy Advocacy',
    description:
      'Spearheading the adoption of progressive regulatory frameworks aligned with International Civil Aviation Organization (ICAO) standards and Nigerian Civil Aviation Regulations (Nig. CARs). We facilitate direct interaction with NCAA, NAMA, FAAN, Customs, and Immigration to streamline aircraft import protocols, charter permits, and airport security clearances.',
    icon: ShieldCheck,
    keyFocus: [
      'NCAA Policy Advocacy & Streamlining',
      'IS-BAH & IS-BAO Safety Accreditation',
      'Diplomatic & Customs Clearance Efficiency',
    ],
  },
  {
    number: '04',
    title: 'Institutionalization of Executive Aviation',
    tagline: 'Establishing Nigeria as Africa’s Business Aviation Hub',
    description:
      'Transforming private aviation from a perceived luxury privilege into an indispensable corporate productivity engine across West Africa. By driving investments in Maintenance Repair Organisations (MROs), Fixed-Base Operator (FBO) infrastructure, hangar expansion, and Sustainable Aviation Fuel (SAF) initiatives, NBAC builds a resilient foundation for the continent.',
    icon: Building2,
    keyFocus: [
      'FBO & Hangar Infrastructure Expansion',
      'MRO & Technical Capability Growth',
      'Sustainable Aviation Fuel (SAF) Adoption',
    ],
  },
]

export function AboutObjectives() {
  const sectionRef = useRef<HTMLElement>(null)
  const shouldReduceMotion = useReducedMotion()

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.obj-eyebrow', '.obj-title', '.obj-subtitle', '.obj-card', '.obj-divider'],
          { opacity: 1, y: 0, scale: 1, scaleX: 1 }
        )
        return
      }

      // Set initial hidden states
      gsap.set('.obj-eyebrow', { opacity: 0, y: -16 })
      gsap.set('.obj-title', { opacity: 0, y: 30 })
      gsap.set('.obj-subtitle', { opacity: 0, y: 20 })
      gsap.set('.obj-divider', { opacity: 0, scaleX: 0 })
      gsap.set('.obj-card', { opacity: 0, y: 44, scale: 0.95 })

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
      tl.to('.obj-divider', { opacity: 1, scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.4')
      tl.to('.obj-subtitle', { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      tl.to(
        '.obj-card',
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.15,
          ease: 'power3.out',
        },
        '-=0.4'
      )
    },
    { scope: sectionRef }
  )

  const cardHover = {
    y: -8,
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 bg-nbac-alt overflow-hidden border-b border-nbac-border"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-nbac-emerald/5 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/6 w-80 h-80 bg-nbac-gold/4 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-24">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 space-y-4 max-w-3xl mx-auto">
          <SectionEyebrow className="obj-eyebrow">
            Strategic Purpose
          </SectionEyebrow>
          <h2 className="obj-title font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight leading-tight">
            Conference <span className="text-nbac-emerald">Objectives</span>
          </h2>
          <div className="obj-divider h-1 w-24 bg-linear-to-r from-nbac-gold via-nbac-emerald to-nbac-gold mx-auto rounded-full origin-center" />
          <p className="obj-subtitle font-sans text-base font-light text-nbac-body leading-relaxed pt-2">
            Driving systemic growth, regulatory advancement, capital formation, and infrastructure expansion across West African executive aviation.
          </p>
        </div>

        {/* 2x2 Grid of Executive Objectives */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {DETAILED_OBJECTIVES.map((obj) => {
            const Icon = obj.icon
            return (
              <motion.div
                key={obj.number}
                className="obj-card relative overflow-hidden group rounded-2xl border border-nbac-border/70 bg-linear-to-br from-nbac-panel/95 via-nbac-panel to-nbac-emerald/[0.04] p-8 md:p-10 flex flex-col justify-between transition-all duration-500 hover:border-nbac-emerald/40 hover:bg-nbac-panel"
                whileHover={shouldReduceMotion ? undefined : cardHover}
                transition={{ duration: 0.35, ease: 'easeOut' }}
              >
                {/* Executive Top Accent Border (Kept & Enhanced) */}
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-linear-to-r from-nbac-emerald/80 via-nbac-emerald to-nbac-gold/70 group-hover:from-nbac-gold group-hover:via-nbac-emerald group-hover:to-nbac-gold transition-colors duration-500" />
                
                {/* Left Subtle Accent Line */}
                <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-nbac-emerald/20 group-hover:bg-nbac-emerald/60 transition-colors duration-500" />

                {/* Corner Glow Effect */}
                <div className="absolute -top-24 -right-24 w-56 h-56 bg-nbac-emerald/6 blur-[70px] rounded-full pointer-events-none group-hover:bg-nbac-emerald/12 transition-colors duration-700" />

                <div>
                  {/* Top Bar: Icon Badge + Metallic Number Pill */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-nbac-emerald/10 border border-nbac-emerald/30 shadow-[0_0_20px_rgba(16,185,129,0.12)] flex items-center justify-center text-nbac-emerald group-hover:bg-nbac-emerald/20 group-hover:border-nbac-emerald/50 group-hover:scale-105 transition-all duration-400">
                      <Icon size={26} strokeWidth={1.8} />
                    </div>
                    
                    <span className="font-mono text-xs font-bold tracking-widest text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/25 px-3.5 py-1.5 rounded-full shadow-sm">
                      PILLAR {obj.number}
                    </span>
                  </div>

                  {/* Tagline & Title */}
                  <div className="space-y-2 mb-4">
                    <span className="font-sans text-[11px] uppercase tracking-widest font-semibold text-nbac-gold-light flex items-center gap-1.5">
                      <Sparkles size={12} className="text-nbac-gold" />
                      <span>{obj.tagline}</span>
                    </span>
                    <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight leading-snug group-hover:text-white transition-colors">
                      {obj.title}
                    </h3>
                  </div>

                  {/* Descriptive Body Copy */}
                  <p className="font-sans text-sm font-light text-nbac-body leading-relaxed mb-6">
                    {obj.description}
                  </p>
                </div>

                {/* Strategic Focus Areas */}
                <div className="pt-6 border-t border-nbac-border/50 space-y-3">
                  <span className="font-sans text-[10px] uppercase tracking-widest font-bold text-nbac-muted block">
                    Strategic Focus Areas
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {obj.keyFocus.map((focus) => (
                      <div
                        key={focus}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-nbac-canvas/80 border border-nbac-border/80 text-nbac-body text-xs font-sans font-light hover:border-nbac-emerald/40 hover:text-nbac-text hover:bg-nbac-emerald/5 transition-all duration-300 select-none"
                      >
                        <CheckCircle2 size={13} className="text-nbac-emerald shrink-0" />
                        <span>{focus}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Background Watermark Icon */}
                <Icon
                  size={190}
                  strokeWidth={0.4}
                  className="absolute -bottom-10 -right-10 text-nbac-emerald/[0.02] group-hover:text-nbac-emerald/[0.06] group-hover:rotate-6 transition-all duration-700 pointer-events-none"
                />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
