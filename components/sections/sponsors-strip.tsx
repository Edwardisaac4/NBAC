'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plane, Globe, Shield, Navigation, Compass, Star, ArrowRight } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function SponsorsStrip() {
  const containerRef = useRef<HTMLElement>(null)

  const featuredPartners = [
    { name: 'Bombardier', type: 'OEM Partner', icon: Shield },
    { name: 'Gulfstream', type: 'OEM Partner', icon: Compass },
    { name: 'Embraer', type: 'OEM Partner', icon: Navigation },
    { name: 'VistaJet', type: 'Global Fleet', icon: Globe },
    { name: 'EAN Aviation', type: 'Host FBO', icon: Star },
    { name: 'NCAA', type: 'Civil Aviation', icon: Plane },
  ]

  const marqueeSponsors = [
    { name: 'Falcon Aero', icon: Plane },
    { name: 'VistaJet', icon: Globe },
    { name: 'Bombardier', icon: Shield },
    { name: 'Embraer', icon: Navigation },
    { name: 'Gulfstream', icon: Compass },
    { name: 'NCAA', icon: Star },
    { name: 'FAAN', icon: Navigation },
    { name: 'ExecuJet', icon: Shield },
  ]

  const doubledMarquee = [...marqueeSponsors, ...marqueeSponsors, ...marqueeSponsors]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.partner-eyebrow', '.partner-heading', '.partner-chip', '.partner-cta'],
          { opacity: 1, y: 0, scale: 1 }
        )
        return
      }

      gsap.set('.partner-eyebrow', { opacity: 0, y: -12 })
      gsap.set('.partner-heading', { opacity: 0, y: 24 })
      gsap.set('.partner-chip', { opacity: 0, y: 30, scale: 0.96 })
      gsap.set('.partner-cta', { opacity: 0, y: 20 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 82%',
          once: true,
        },
      })

      tl.to('.partner-eyebrow', { opacity: 1, y: 0, duration: 0.6 })
      tl.to('.partner-heading', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
      tl.to(
        '.partner-chip',
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
        },
        '-=0.4'
      )
      tl.to('.partner-cta', { opacity: 1, y: 0, duration: 0.7 }, '-=0.3')
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-24 bg-nbac-canvas overflow-hidden border-t border-nbac-border"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nbac-gold/3 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-24 space-y-10">
        {/* Compact Header */}
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <SectionEyebrow className="partner-eyebrow">
            Industry Ecosystem
          </SectionEyebrow>
          <h2 className="partner-heading font-display text-2xl md:text-4xl font-bold text-nbac-text tracking-tight">
            Strategic Partners &amp; <span className="text-nbac-gold">Sponsors</span>
          </h2>
        </div>

        {/* Compact Key Partners Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {featuredPartners.map((partner) => {
            const Icon = partner.icon
            return (
              <motion.div
                key={partner.name}
                className="partner-chip group bg-nbac-panel/80 border border-nbac-border/60 hover:border-nbac-gold/40 rounded-xl p-4 flex flex-col items-center text-center transition-all duration-300 shadow-sm"
                whileHover={{ y: -4, boxShadow: '0 8px 24px rgba(197,160,89,0.1)' }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-10 h-10 rounded-lg bg-nbac-gold/10 border border-nbac-gold/20 flex items-center justify-center text-nbac-gold group-hover:bg-nbac-gold/20 transition-colors mb-2.5">
                  <Icon size={18} />
                </div>
                <h4 className="font-sans text-sm font-bold text-nbac-text group-hover:text-nbac-gold-light transition-colors leading-tight">
                  {partner.name}
                </h4>
                <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted font-medium mt-1">
                  {partner.type}
                </span>
              </motion.div>
            )
          })}
        </div>

        {/* Continuous Marquee Strip */}
        <div className="overflow-hidden border-y border-nbac-border/30 py-4 bg-nbac-panel/30 rounded-xl select-none">
          <div className="flex animate-marquee gap-8 w-max hover:[animation-play-state:paused]">
            {doubledMarquee.map((sponsor, i) => {
              const Icon = sponsor.icon
              return (
                <div
                  key={`${sponsor.name}-${i}`}
                  className="flex items-center gap-2.5 px-4 py-2 bg-nbac-panel border border-nbac-border/40 rounded-full text-nbac-muted hover:text-nbac-gold hover:border-nbac-gold/40 transition-all duration-300 cursor-pointer text-xs font-sans uppercase tracking-wider font-medium"
                >
                  <Icon size={14} className="text-nbac-gold shrink-0" />
                  <span className="text-nbac-text">{sponsor.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Streamlined Sponsorship CTA Banner linking solely to /contact/sponsor */}
        <div className="partner-cta rounded-xl border border-nbac-gold/30 bg-linear-to-r from-nbac-panel via-nbac-panel to-nbac-gold/5 p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <span className="font-sans text-[11px] uppercase tracking-widest font-semibold text-nbac-gold block">
              Corporate Sponsorship Desk
            </span>
            <h3 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
              Elevate Your Brand at NBAC 2027
            </h3>
            <p className="font-sans text-xs font-light text-nbac-body">
              Align your company with West Africa&apos;s premier business aviation summit.
            </p>
          </div>

          <Link
            href="/reservations?type=sponsor"
            className="shrink-0 inline-flex items-center gap-2 bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-6 py-3 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-md shadow-nbac-gold/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Become a Sponsor</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
