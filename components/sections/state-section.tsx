'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { LayoutDashboard, Gavel, Gauge, Coins } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function StateSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.state-eyebrow', '.state-heading', '.state-divider', '.reveal-item'],
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
        .fromTo('.state-eyebrow',
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo('.state-heading',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.state-divider',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          '-=0.4'
        )

      /* ── Card stagger entrance ────────────────────────── */
      gsap.fromTo(
        '.reveal-item',
        { opacity: 0, y: 40, x: -20 },
        {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.state-grid',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  const pillars = [
    {
      title: 'Infrastructure Development',
      description: 'Modernizing airports and private terminals with state-of-the-art facilities for seamless, premium executive operations across the continent.',
      icon: LayoutDashboard,
    },
    {
      title: 'Policy & Regulation',
      description: 'Navigating and shaping the evolving regulatory frameworks to ensure sustainable growth, safety, and international compliance in Nigerian airspace.',
      icon: Gavel,
    },
    {
      title: 'Operational Efficiency',
      description: 'Optimizing flight routes, reducing turnaround times, and perfecting ground handling services through digital innovation and technical expertise.',
      icon: Gauge,
      highlighted: true,
    },
    {
      title: 'Investment Opportunities',
      description: 'Exploring high-yield capital injection points within the burgeoning West African aviation market and aircraft ownership landscape.',
      icon: Coins,
    },
  ]

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-alt px-6 md:px-24">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 space-y-3 max-w-2xl">
          <SectionEyebrow className="state-eyebrow opacity-0">Market Landscape</SectionEyebrow>
          <h2 className="state-heading opacity-0 font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            The State of Nigerian Business Aviation
          </h2>
          <div className="state-divider h-1 w-24 bg-nbac-gold mx-auto rounded-full mt-4 origin-center opacity-0" />
        </div>

        {/* Pillars Grid */}
        <div className="state-grid grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
          {pillars.map((pillar) => {
            const Icon = pillar.icon
            return (
              <motion.div
                key={pillar.title}
                className={`reveal-item opacity-0 bg-nbac-panel border rounded-lg p-8 border-l-4 flex gap-6 ${
                  pillar.highlighted
                    ? 'border-nbac-border border-l-nbac-gold shadow-[0_0_20px_rgba(197,160,89,0.08)]'
                    : 'border-nbac-border border-l-nbac-emerald/40'
                }`}
                whileHover={{
                  y: -6,
                  borderTopColor: pillar.highlighted ? 'rgba(197, 160, 89, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                  borderRightColor: pillar.highlighted ? 'rgba(197, 160, 89, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                  borderBottomColor: pillar.highlighted ? 'rgba(197, 160, 89, 0.5)' : 'rgba(16, 185, 129, 0.5)',
                  borderLeftColor: pillar.highlighted ? 'rgba(197, 160, 89, 0.8)' : 'rgba(16, 185, 129, 0.8)',
                  boxShadow: pillar.highlighted ? '0 12px 40px rgba(197, 160, 89, 0.1)' : '0 12px 40px rgba(16, 185, 129, 0.1)',
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {/* Icon Column */}
                <div className={`shrink-0 p-3 rounded-lg h-12 w-12 flex items-center justify-center ${
                  pillar.highlighted ? 'bg-nbac-gold/10 text-nbac-gold' : 'bg-nbac-emerald/10 text-nbac-emerald'
                }`}>
                  <Icon size={24} />
                </div>
                {/* Content Column */}
                <div className="space-y-2">
                  <h3 className="font-sans text-lg font-semibold text-nbac-text">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
