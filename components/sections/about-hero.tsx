'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      const allElements = ['.about-eyebrow', '.about-title', '.about-desc', '.about-image-wrapper']

      if (prefersReduced) {
        gsap.set(allElements, { opacity: 1, y: 0, x: 0, scale: 1 })
        return
      }

      // Set initial hidden states via GSAP (not CSS classes) to avoid conflicts
      gsap.set('.about-eyebrow', { opacity: 0, y: -20 })
      gsap.set('.about-title', { opacity: 0, y: 40, rotateX: 8 })
      gsap.set('.about-desc', { opacity: 0, y: 24 })
      gsap.set('.about-image-wrapper', { opacity: 0, x: 60, scale: 0.94 })

      /* ── Entrance timeline — plays when section scrolls into view ── */
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
      })

      // Eyebrow drops in
      tl.to('.about-eyebrow', { opacity: 1, y: 0, duration: 0.8 })

      // Title slides up with perspective
      tl.to('.about-title', { opacity: 1, y: 0, rotateX: 0, duration: 1 }, '-=0.5')

      // Description fades in
      tl.to('.about-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')

      // Image slides in from right with scale
      tl.to('.about-image-wrapper', { opacity: 1, x: 0, scale: 1, duration: 1.1 }, '-=0.8')

      /* ── Subtle parallax on image ──────────────────────── */
      gsap.to(imageWrapperRef.current, {
        yPercent: -10,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="relative py-20 md:py-32 bg-nbac-canvas px-6 md:px-24 overflow-hidden border-b border-nbac-border" style={{ perspective: '800px' }}>
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nbac-emerald/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-nbac-emerald/3 blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Left Column: Copy */}
        <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
          <div className="space-y-4">
            <SectionEyebrow className="about-eyebrow">Overview</SectionEyebrow>
            <h1 className="about-title font-display text-4xl md:text-6xl font-bold text-nbac-text tracking-tight leading-tight">
              Defining the Future of <br className="hidden sm:inline" />
              <span className="text-glow text-nbac-emerald">West African Skies</span>
            </h1>
            <p className="about-desc font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed max-w-2xl pt-2">
              The Nigerian Business Aviation Conference is dedicated to elevating industry standards through strategic collaboration, infrastructure reinvestment, and policy leadership.
            </p>
          </div>
        </div>

        {/* Right Column: Premium About Image */}
        <div ref={imageWrapperRef} className="about-image-wrapper lg:col-span-5 relative w-full aspect-video lg:aspect-4/5 rounded-xl overflow-hidden border border-nbac-border shadow-2xl shadow-nbac-emerald/5 group">
          {/* Subtle green ambient lighting underneath */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-nbac-emerald/5 blur-[85px] rounded-full" />
          <Image
            src="/images/about_us_aviation.png"
            alt="NBAC Luxury Aviation Lounge and Private Jet"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-width: 1024px) 100vw, 40vw"
            quality={90}
            priority
          />
        </div>
      </div>
    </section>
  )
}
