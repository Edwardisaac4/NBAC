'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Plane, UserCheck, ShieldCheck, Banknote } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function AudienceSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.aud-eyebrow', '.aud-heading', '.aud-divider', '.audience-card'],
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
        .fromTo('.aud-eyebrow',
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo('.aud-heading',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.aud-divider',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          '-=0.4'
        )

      /* ── Card stagger — rise up with slight scale ─────── */
      gsap.fromTo(
        '.audience-card',
        { opacity: 0, y: 44, scale: 0.94 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.aud-grid',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  const audiences = [
    {
      title: 'Aircraft Operators & Fleet Managers',
      description: 'Streamline operational procedures, optimize route efficiencies, and network with leading regional charter brokers and flight departments.',
      icon: Plane,
    },
    {
      title: 'High-Net-Worth Individuals',
      description: 'Gain expert insights on business aircraft ownership lifecycle, customized financing, luxury aircraft interiors, and regulatory logistics.',
      icon: UserCheck,
    },
    {
      title: 'Aviation Regulators & Authorities',
      description: 'Engage with industry leaders to shape policies, promote safety, align regional standards, and encourage sustainable corporate aviation developments.',
      icon: ShieldCheck,
    },
    {
      title: 'Finance & Leasing Providers',
      description: 'Discover lucrative asset financing opportunities, connect with qualified buyers, and navigate private aviation risk management structures.',
      icon: Banknote,
    },
  ]

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-alt px-6 md:px-24">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 space-y-3 max-w-2xl">
          <SectionEyebrow className="aud-eyebrow opacity-0">Strategic Cohorts</SectionEyebrow>
          <h2 className="aud-heading opacity-0 font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            This Conference Is For...
          </h2>
          <div className="aud-divider h-1 w-24 bg-nbac-emerald mx-auto rounded-full mt-4 origin-center opacity-0" />
        </div>

        {/* Audience Grid */}
        <div className="aud-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {audiences.map((audience) => {
            const Icon = audience.icon
            return (
              <motion.div
                key={audience.title}
                className="audience-card opacity-0 bg-nbac-panel border border-nbac-border rounded-lg p-6 flex flex-col justify-between h-full"
                whileHover={{
                  y: -6,
                  borderColor: 'rgba(16, 185, 129, 0.5)',
                  boxShadow: '0 8px 32px rgba(16, 185, 129, 0.08)',
                }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <div className="space-y-4">
                  {/* Icon */}
                  <div className="bg-nbac-emerald/10 p-3 rounded-lg text-nbac-emerald h-11 w-11 flex items-center justify-center">
                    <Icon size={20} />
                  </div>
                  {/* Content */}
                  <h3 className="font-sans text-base font-semibold text-nbac-text leading-snug">
                    {audience.title}
                  </h3>
                  <p className="font-sans text-xs font-light text-nbac-body leading-relaxed">
                    {audience.description}
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
