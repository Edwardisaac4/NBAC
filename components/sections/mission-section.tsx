'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function MissionSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      const targets = [
        '.mission-eyebrow',
        '.mission-heading',
        '.mission-divider',
        '.mission-copy',
        '.mission-cta',
      ]

      if (prefersReduced) {
        gsap.set(targets, { opacity: 1, y: 0, scaleX: 1 })
        return
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      tl.fromTo('.mission-eyebrow',
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo('.mission-heading',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.mission-divider',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          '-=0.4'
        )
        .fromTo('.mission-copy',
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', stagger: 0.15 },
          '-=0.3'
        )
        .fromTo('.mission-cta',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
          '-=0.2'
        )
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-canvas px-6 md:px-24">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl">
          <SectionEyebrow className="mission-eyebrow">Our Goals</SectionEyebrow>
          <h2 className="mission-heading font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            SHAPING THE FUTURE OF WEST AFRICAN AVIATION
          </h2>
          <div className="mission-divider h-1 w-24 bg-nbac-gold mx-auto rounded-full mt-4 origin-center" />
        </div>

        {/* Copy */}
        <div className="mt-10 md:mt-14 max-w-3xl space-y-6 text-center">
          <p className="mission-copy font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed">
            The Nigerian Business Aviation Conference (NBAC) is the premier summit dedicated to
            shaping the future of business and general aviation across West Africa.
          </p>
          <p className="mission-copy font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed">
            We unite industry leaders, regulatory bodies, innovators, financiers and high-net-worth
            individuals to drive systemic growth, regulatory advancement, capital investment, and
            infrastructure expansion across West African business aviation.
          </p>
        </div>

        {/* CTA */}
        <div className="mission-cta mt-10 md:mt-12">
          <Link href="/reservations">
            <button className="bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-8 md:px-10 py-3 rounded-full transition-all duration-300 shadow-lg shadow-nbac-gold/15 hover:shadow-nbac-gold/30 hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-widest cursor-pointer">
              Join Us
            </button>
          </Link>
        </div>
      </div>
    </section>
  )
}
