'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export function SponsorsStrip() {
  const containerRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set('.partner-cta', { opacity: 1, y: 0 })
        return
      }

      gsap.set('.partner-cta', { opacity: 0, y: 24 })

      gsap.to('.partner-cta', {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative py-16 md:py-24 bg-nbac-canvas overflow-hidden border-t border-nbac-border"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nbac-gold/5 blur-[140px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-24">
        {/* Sponsorship CTA Banner */}
        <div className="partner-cta rounded-2xl border border-nbac-gold/30 bg-linear-to-r from-nbac-panel via-nbac-panel to-nbac-gold/5 p-8 md:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-3 text-center lg:text-left max-w-3xl">
            <span className="font-sans text-[11px] uppercase tracking-widest font-semibold text-nbac-gold block">
              Become a NBAC 2027 Sponsor
            </span>
            <h3 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-nbac-text tracking-tight">
              Position your company at the heart of West African Aviation
            </h3>
            <p className="font-sans text-xs md:text-sm font-light text-nbac-body leading-relaxed">
              NBAC sponsors gain direct access to the stakeholders driving West African business aviation, including
              aircraft operators and fleet managers, high-net-worth individuals, regulators, financiers, leasing
              providers and innovators. The conference provides exceptional visibility for organizations seeking to
              demonstrate leadership and showcase aviation technologies and solutions to their target markets while
              creating opportunities to build strategic relationships and participate in the growth of one of aviation’s
              most promising markets.
            </p>
          </div>

          <Link
            href="/reservations?type=sponsor"
            className="shrink-0 inline-flex items-center gap-2 bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-7 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-nbac-gold/20 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <span>Become a Sponsor</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
