'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Plane, Eye } from 'lucide-react'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const imageWrapperRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.about-eyebrow', '.about-title', '.about-desc', '.about-image-wrapper', '.about-card'],
          { opacity: 1, y: 0, x: 0, scale: 1 }
        )
        return
      }

      /* ── Entrance timeline ─────────────────────────────── */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Eyebrow drops in
      tl.fromTo('.about-eyebrow',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )

      // Title slides up with perspective
      tl.fromTo('.about-title',
        { opacity: 0, y: 40, rotateX: 8 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1 },
        '-=0.5'
      )

      // Description fades in
      tl.fromTo('.about-desc',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )

      // Image slides in from right with scale
      tl.fromTo('.about-image-wrapper',
        { opacity: 0, x: 60, scale: 0.94 },
        { opacity: 1, x: 0, scale: 1, duration: 1.1 },
        '-=0.8'
      )

      // Cards stagger in with scale pop
      tl.fromTo('.about-card',
        { opacity: 0, y: 36, scale: 0.92 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out',
        },
        '-=0.7'
      )

      /* ── Scroll-driven content fade-out ────────────────── */
      gsap.to(contentRef.current, {
        y: -50,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '70% top',
          scrub: true,
        },
      })

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

  const cardHoverConfig = {
    y: -6,
    borderColor: 'rgba(16, 185, 129, 0.4)',
    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.08)',
  }

  return (
    <section ref={containerRef} className="relative py-20 md:py-32 bg-nbac-canvas px-6 md:px-24 overflow-hidden border-b border-nbac-border" style={{ perspective: '800px' }}>
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-nbac-emerald/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-nbac-emerald/3 blur-[100px] rounded-full pointer-events-none" />

      <div ref={contentRef} className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
        {/* Left Column: Copy & Cards */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
          {/* Header Block */}
          <div className="space-y-4">
            <SectionEyebrow className="about-eyebrow opacity-0">Overview</SectionEyebrow>
            <h1 className="about-title opacity-0 font-display text-4xl md:text-6xl font-bold text-nbac-text tracking-tight leading-tight">
              Defining the Future of <br className="hidden sm:inline" />
              <span className="text-glow text-nbac-emerald">West African Skies</span>
            </h1>
            <p className="about-desc opacity-0 font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed max-w-2xl pt-2">
              The Nigerian Business Aviation Conference is dedicated to elevating industry standards through strategic collaboration, infrastructure reinvestment, and policy leadership.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="about-cards-container grid grid-cols-1 md:grid-cols-2 gap-6 w-full pt-4">
            {/* Mission Card */}
            <motion.div
              className="about-card opacity-0 bg-nbac-panel border border-nbac-border rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[260px]"
              whileHover={cardHoverConfig}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="space-y-4 z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="bg-nbac-emerald/10 p-2.5 rounded-lg text-nbac-emerald">
                    <Plane size={20} />
                  </div>
                  <h3 className="font-sans text-lg font-bold text-nbac-text tracking-wide">
                    Our Mission
                  </h3>
                </div>
                <p className="font-sans text-xs md:text-sm font-light text-nbac-body leading-relaxed pt-2">
                  To catalyze operational excellence across the West African aviation landscape by fostering partnerships between global stakeholders and local operators. We provide the forum for infrastructure development and regulatory frameworks that ensure safety, reliability, and efficiency.
                </p>
              </div>
              
              {/* Absolute background watermark icon */}
              <Plane 
                size={140} 
                className="absolute -bottom-6 -right-6 text-nbac-emerald/2 group-hover:text-nbac-emerald/4 group-hover:scale-105 transition-all duration-500 pointer-events-none rotate-45" 
              />
            </motion.div>

            {/* Vision Card */}
            <motion.div
              className="about-card opacity-0 bg-nbac-panel border border-nbac-border rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group min-h-[260px]"
              whileHover={cardHoverConfig}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="space-y-4 z-10 relative">
                <div className="flex items-center gap-3">
                  <div className="bg-nbac-emerald/10 p-2.5 rounded-lg text-nbac-emerald">
                    <Eye size={20} />
                  </div>
                  <h3 className="font-sans text-lg font-bold text-nbac-text tracking-wide">
                    Our Vision
                  </h3>
                </div>
                <p className="font-sans text-xs md:text-sm font-light text-nbac-body leading-relaxed pt-2">
                  To position Nigeria as the primary gateway and strategic hub for business aviation investment in Africa. Our vision is an integrated airspace where business aviation serves as a key driver for economic mobility and technological advancement across the continent.
                </p>
              </div>
              
              {/* Absolute background watermark icon */}
              <Eye 
                size={140} 
                className="absolute -bottom-6 -right-6 text-nbac-emerald/2 group-hover:text-nbac-emerald/4 group-hover:scale-105 transition-all duration-500 pointer-events-none" 
              />
            </motion.div>
          </div>
        </div>

        {/* Right Column: Premium About Image */}
        <div ref={imageWrapperRef} className="about-image-wrapper lg:col-span-5 relative w-full aspect-video lg:aspect-4/5 rounded-xl overflow-hidden border border-nbac-border shadow-2xl shadow-nbac-emerald/5 group opacity-0">
          {/* Subtle green ambient lighting underneath */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-nbac-emerald/5 blur-[85px] rounded-full" />
          <Image
            src="/images/about_us_aviation.png"
            alt="NBAC Luxury Aviation Lounge and Private Jet"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
            sizes="(max-w-720px) 100vw, 40vw"
            priority
          />
        </div>
      </div>
    </section>
  )
}
