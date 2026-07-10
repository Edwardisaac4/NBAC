'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function ContactHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.contact-eyebrow', '.contact-title', '.contact-desc'],
          { opacity: 1, y: 0, rotateX: 0 }
        )
        return
      }

      /* ── Entrance timeline ─────────────────────────────── */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Eyebrow drops in
      tl.fromTo('.contact-eyebrow',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )

      // Title slides up with perspective rotation
      tl.fromTo('.contact-title',
        { opacity: 0, y: 40, rotateX: 8 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1 },
        '-=0.5'
      )

      // Description fades in
      tl.fromTo('.contact-desc',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )

      /* ── Scroll-driven content fade-out ────────────────── */
      gsap.to(contentRef.current, {
        y: -30,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '80% top',
          scrub: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="relative pt-16 pb-8 md:pt-24 md:pb-12 bg-nbac-canvas px-6 md:px-24 overflow-hidden" style={{ perspective: '800px' }}>
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nbac-emerald/[0.04] blur-[150px] rounded-full pointer-events-none" />

      <div ref={contentRef} className="max-w-7xl mx-auto text-center space-y-6 relative z-10">
        <SectionEyebrow className="contact-eyebrow opacity-0">Get In Touch</SectionEyebrow>
        <h1 className="contact-title opacity-0 font-display text-4xl md:text-6xl lg:text-7xl font-bold text-nbac-text tracking-tight leading-tight">
          Connect With <span className="text-glow text-nbac-emerald">NBAC Executive Desk</span>
        </h1>
        <p className="contact-desc opacity-0 font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed max-w-3xl mx-auto">
          Whether you are booking delegate passes, requesting aircraft display slots, or inquiring about event sponsorships, our executive team is at your service.
        </p>
      </div>
    </section>
  )
}
