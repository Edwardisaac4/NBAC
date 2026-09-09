'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, useReducedMotion } from 'framer-motion'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export interface DescriptiveObjective {
  number: string
  title: string
  tagline: string
  description: string
  image: string
  imageAlt: string
  keyFocus: string[]
}

export const DETAILED_OBJECTIVES: DescriptiveObjective[] = [
  {
    number: '01',
    title: 'Strengthen Industry Dialogue and Collaboration',
    tagline: 'Convening the Full Business Aviation Value Chain',
    description:
      'Create a platform that brings together regulators, operators, financiers, OEMs, and service providers to address key issues and opportunities shaping Nigeria’s business aviation sector.',
    image: '/images/NBAC/2017/AfRS_NBAC17_Day1_0022.jpg',
    imageAlt: 'Industry leaders in a roundtable discussion at NBAC',
    keyFocus: [
      'Regulator & Operator Engagement',
      'OEM and Service Provider Partnerships',
      'Sector-Wide Issue Resolution',
    ],
  },
  {
    number: '02',
    title: 'Facilitate Access to Aviation Financing and Leasing Solutions',
    tagline: 'Unlocking Regionally Relevant Capital Structures',
    description:
      'Explore innovative and regionally relevant financing structures, including aircraft leasing models, that can support aircraft acquisition, fleet modernisation, infrastructure development, and emerging aviation technologies within Nigeria and across Africa.',
    image: '/images/NBAC/2017/AfRS_NBAC17_Day1_0004.jpg',
    imageAlt: 'Financiers and operators on an NBAC industry panel',
    keyFocus: [
      'Aircraft Acquisition & Leasing Models',
      'Fleet Modernisation Funding',
      'Infrastructure & Technology Investment',
    ],
  },
  {
    number: '03',
    title: 'Support Progressive and Enabling Regulatory Frameworks',
    tagline: 'Championing Safe, Efficient and Globally Competitive Operations',
    description:
      'Encourage constructive dialogue between industry stakeholders and regulators to support policies that enable safe, efficient, and globally competitive business aviation operations in Nigeria.',
    image: '/images/NBAC/2017/AfRS_NBAC17_Day1_0062.jpg',
    imageAlt: 'Regulators exchanging views with industry stakeholders at NBAC',
    keyFocus: [
      'Stakeholder–Regulator Dialogue',
      'Safety & Operational Efficiency',
      'Global Competitiveness',
    ],
  },
  {
    number: '04',
    title: 'Promote Sustainable Growth of the Business Aviation Ecosystem',
    tagline: 'Building Capability Across the Entire Value Chain',
    description:
      'Highlight opportunities across the business aviation value chain including operations, maintenance, charter services, fixed-base operations (FBOs), and aviation support services.',
    image: '/images/NBAC/2017/AfRS_NBAC17_Day1_0010.jpg',
    imageAlt: 'FBO and aviation services showcase at NBAC',
    keyFocus: [
      'Maintenance & Charter Services',
      'Fixed-Base Operations (FBOs)',
      'Aviation Support Services',
    ],
  },
  {
    number: '05',
    title: 'Encourage Innovation and Technology Development in Aviation',
    tagline: 'Advancing Emerging Aviation Technologies',
    description:
      'Promote dialogue and collaboration around emerging technologies including artificial intelligence, digital aviation systems, advanced air mobility, and e-VTOL solutions, while exploring initiatives such as innovation showcases or aviation technology hackathons.',
    image: '/images/NBAC/2017/AfRS_NBAC17_Day1_0061.jpg',
    imageAlt: 'Aviation technology and innovation showcase at NBAC',
    keyFocus: [
      'AI & Digital Aviation Systems',
      'Advanced Air Mobility & e-VTOL',
      'Innovation Showcases & Hackathons',
    ],
  },
  {
    number: '06',
    title: 'Demonstrate the Value of Business Aviation for Economic Productivity',
    tagline: 'Positioning Aviation as a Corporate Productivity Engine',
    description:
      'Highlight how business aviation enhances executive mobility, productivity, and strategic decision-making for corporate leaders, high-net-worth individuals (HNIs), and investors operating within Nigeria and across Africa.',
    image: '/images/NBAC/2017/AfRS_NBAC17_Day1_0013.jpg',
    imageAlt: 'Business aircraft at a previous NBAC conference',
    keyFocus: [
      'Executive Mobility & Productivity',
      'Strategic Corporate Decision-Making',
      'HNI & Investor Value Proposition',
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
      className="relative overflow-hidden border-b border-nbac-border bg-nbac-alt py-16 sm:py-20 lg:py-32"
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute left-1/4 top-1/3 h-56 w-56 rounded-full bg-nbac-emerald/5 blur-[90px] sm:h-80 sm:w-80 sm:blur-[120px] lg:h-96 lg:w-96 lg:blur-[140px]" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/6 h-48 w-48 rounded-full bg-nbac-gold/4 blur-[80px] sm:h-72 sm:w-72 sm:blur-[100px] lg:h-80 lg:w-80 lg:blur-[120px]" />

      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-12 xl:px-24">
        {/* Section Header */}
        <div className="mx-auto mb-12 max-w-3xl space-y-3 text-center sm:mb-16 sm:space-y-4 lg:mb-24">
          <SectionEyebrow className="obj-eyebrow">
            Strategic Purpose
          </SectionEyebrow>
          <h2 className="obj-title font-display text-[1.75rem] font-bold leading-tight tracking-tight text-nbac-text sm:text-4xl lg:text-5xl">
            Conference <span className="text-nbac-emerald">Objectives</span>
          </h2>
          <div className="obj-divider mx-auto h-1 w-16 origin-center rounded-full bg-linear-to-r from-nbac-gold via-nbac-emerald to-nbac-gold sm:w-24" />
          <p className="obj-subtitle font-sans text-sm font-light leading-relaxed text-nbac-body sm:text-base sm:pt-2">
            Driving systemic growth, regulatory advancement, capital formation, and infrastructure expansion across West African business aviation.
          </p>
        </div>

        {/* Objective cards — single column on mobile, two from lg up */}
        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
          {DETAILED_OBJECTIVES.map((obj) => (
            <motion.article
              key={obj.number}
              className="obj-card group relative overflow-hidden rounded-xl border border-nbac-border/70 bg-nbac-panel transition-colors duration-500 hover:border-nbac-emerald/50 sm:rounded-2xl pointer-fine:h-[470px]"
              whileHover={shouldReduceMotion ? undefined : cardHover}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              {/* Objective imagery */}
              <Image
                src={obj.image}
                alt={obj.imageAlt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 46vw"
                className="object-cover object-center transition-transform duration-[900ms] ease-out motion-reduce:transition-none group-hover:scale-[1.06]"
              />

              {/* Legibility scrim — deepens on hover so the write-up reads cleanly */}
              <div className="absolute inset-0 bg-linear-to-t from-[#04080a] via-[#04080a]/80 to-[#04080a]/30 transition-all duration-700 pointer-fine:via-[#04080a]/55 pointer-fine:to-[#04080a]/10 pointer-fine:group-hover:from-[#04080a] pointer-fine:group-hover:via-[#04080a]/88 pointer-fine:group-hover:to-[#04080a]/60" />

              {/* Executive top accent border */}
              <div className="absolute left-0 right-0 top-0 z-10 h-[3px] bg-linear-to-r from-nbac-emerald/80 via-nbac-emerald to-nbac-gold/70 transition-colors duration-500 group-hover:from-nbac-gold group-hover:via-nbac-emerald group-hover:to-nbac-gold" />

              {/* Content — title always visible, write-up reveals on hover where hovering exists */}
              <div className="relative z-10 flex h-full min-h-[22rem] flex-col justify-end p-6 sm:min-h-[24rem] sm:p-8 lg:p-10">
                <span className="mb-4 self-start rounded-full border border-nbac-gold/30 bg-black/40 px-3 py-1 font-mono text-[10px] font-bold tracking-widest text-nbac-gold-light backdrop-blur-sm sm:mb-5 sm:px-3.5 sm:py-1.5 sm:text-xs">
                  PILLAR {obj.number}
                </span>

                <span className="mb-1.5 font-sans text-[10px] font-semibold uppercase tracking-widest text-nbac-gold-light sm:mb-2 sm:text-[11px]">
                  {obj.tagline}
                </span>

                <h3 className="font-display text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl lg:text-[1.75rem]">
                  {obj.title}
                </h3>

                {/* Write-up: open by default on touch, hover/focus reveal on pointer devices */}
                <div className="max-h-[600px] overflow-hidden opacity-100 transition-all duration-500 ease-out motion-reduce:transition-none pointer-fine:max-h-0 pointer-fine:opacity-0 pointer-fine:group-hover:max-h-[600px] pointer-fine:group-hover:opacity-100 pointer-fine:group-focus-within:max-h-[600px] pointer-fine:group-focus-within:opacity-100">
                  <div className="mb-3.5 mt-4 h-px w-12 bg-nbac-gold/70 sm:mb-4 sm:mt-5 sm:w-16" />

                  <p className="font-sans text-[13px] font-light leading-relaxed text-white/85 sm:text-sm">
                    {obj.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5 sm:mt-5 sm:gap-2">
                    {obj.keyFocus.map((focus) => (
                      <span
                        key={focus}
                        className="inline-flex select-none items-center rounded-full border border-white/20 bg-white/8 px-2.5 py-1 font-sans text-[11px] font-light text-white/85 backdrop-blur-sm sm:px-3 sm:py-1.5 sm:text-xs"
                      >
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
