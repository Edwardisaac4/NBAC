'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import Link from 'next/link'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { ShieldCheck, Building2, Globe, ArrowRight, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const STRATEGIC_PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Policy Advocacy',
    description: 'Harmonizing regulation & permit clearances across West Africa',
  },
  {
    icon: Building2,
    title: 'Infrastructure Growth',
    description: 'Elevating FBO standards, maintenance, & hangar capacity',
  },
  {
    icon: Globe,
    title: 'Regional Integration',
    description: 'Uniting C-suite aviation leaders, operators, & policymakers',
  },
]

export function AboutHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mainImageRef = useRef<HTMLDivElement>(null)
  const floatCardRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      const animTargets = [
        '.about-eyebrow',
        '.about-title',
        '.about-desc',
        '.about-pillar',
        '.about-cta-group',
        '.about-main-image',
        '.about-float-card',
      ]

      if (prefersReduced) {
        gsap.set(animTargets, { opacity: 1, y: 0, x: 0, scale: 1, rotateX: 0 })
        return
      }

      // Initial state setup
      gsap.set('.about-eyebrow', { opacity: 0, y: -20 })
      gsap.set('.about-title', { opacity: 0, y: 35, rotateX: 6 })
      gsap.set('.about-desc', { opacity: 0, y: 24 })
      gsap.set('.about-pillar', { opacity: 0, y: 20 })
      gsap.set('.about-cta-group', { opacity: 0, y: 20 })
      gsap.set('.about-main-image', { opacity: 0, x: 40, scale: 0.95 })
      gsap.set('.about-float-card', { opacity: 0, x: -30, y: 30, scale: 0.9 })

      /* ── Entrance timeline ────────────────────────────────── */
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          once: true,
        },
      })

      tl.to('.about-eyebrow', { opacity: 1, y: 0, duration: 0.7 })
        .to('.about-title', { opacity: 1, y: 0, rotateX: 0, duration: 0.9 }, '-=0.4')
        .to('.about-desc', { opacity: 1, y: 0, duration: 0.8 }, '-=0.6')
        .to(
          '.about-pillar',
          { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 },
          '-=0.5'
        )
        .to('.about-cta-group', { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
        .to(
          '.about-main-image',
          { opacity: 1, x: 0, scale: 1, duration: 1.1 },
          '-=1.2'
        )
        .to(
          '.about-float-card',
          { opacity: 1, x: 0, y: 0, scale: 1, duration: 0.9, ease: 'back.out(1.4)' },
          '-=0.6'
        )

      /* ── Scroll Parallax Effects ──────────────────────────── */
      if (mainImageRef.current) {
        gsap.to(mainImageRef.current, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2,
          },
        })
      }

      if (floatCardRef.current) {
        gsap.to(floatCardRef.current, {
          yPercent: 12,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        })
      }
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative py-20 lg:py-32 bg-nbac-canvas px-6 md:px-12 lg:px-24 overflow-hidden border-b border-nbac-border"
      style={{ perspective: '1000px' }}
    >
      {/* ── Background Ambient Glows ────────────────────────────── */}
      <div className="absolute top-1/4 left-1/6 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-nbac-emerald/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-nbac-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* ── Left Column: Executive Content & Pillars ──────────── */}
        <div className="lg:col-span-7 space-y-8 flex flex-col justify-center">
          <div className="space-y-4">
            <SectionEyebrow className="about-eyebrow">
              Overview & Vision
            </SectionEyebrow>

            <h1 className="about-title font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-nbac-text tracking-tight leading-[1.15]">
              One Sky <br className="hidden sm:inline" />
              <span className="text-glow text-nbac-emerald">
                Many Stakeholders
              </span>
            </h1>

            <p className="about-desc font-sans text-base sm:text-lg font-light text-nbac-body leading-relaxed max-w-2xl pt-2">
              The Nigerian Business Aviation Conference (NBAC) is the premier summit dedicated to shaping the future of business and general aviation across West Africa. We unite industry leaders, regulatory bodies, and innovators to drive policy advocacy, infrastructure advancement, and strategic investment.
            </p>
          </div>

          {/* ── Strategic Focus Pillars Grid ─────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {STRATEGIC_PILLARS.map((pillar) => {
              const Icon = pillar.icon
              return (
                <div
                  key={pillar.title}
                  className="about-pillar group relative p-4 rounded-xl bg-nbac-surface/50 border border-nbac-border hover:border-nbac-emerald/40 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="w-9 h-9 rounded-lg bg-nbac-emerald/10 flex items-center justify-center text-nbac-emerald mb-3 group-hover:scale-110 group-hover:bg-nbac-emerald group-hover:text-black transition-all duration-300">
                    <Icon size={18} />
                  </div>
                  <h3 className="font-sans font-semibold text-sm text-nbac-text mb-1">
                    {pillar.title}
                  </h3>
                  <p className="font-sans text-xs text-nbac-muted leading-snug">
                    {pillar.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* ── Right Column: 3D Creative Multi-Layer Photo Montage ──── */}
        <div className="lg:col-span-5 relative flex items-center justify-center pt-8 lg:pt-0">
          <div className="relative w-full max-w-md lg:max-w-none">
            {/* Top Badge Overlay */}
            <div className="absolute -top-4 -right-2 z-20 hidden sm:flex items-center gap-2 bg-black/80 border border-nbac-emerald/40 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-sans text-white shadow-xl">
              <span className="w-2 h-2 rounded-full bg-nbac-emerald animate-pulse" />
              <span className="font-medium tracking-wide">NBAC Summit</span>
            </div>

            {/* Main Showcase Image */}
            <div
              ref={mainImageRef}
              className="about-main-image relative w-full aspect-[4/3] sm:aspect-square rounded-2xl overflow-hidden border border-nbac-border shadow-2xl shadow-nbac-emerald/10 group"
              style={{ willChange: 'transform' }}
            >
              <Image
                src="/images/sliders/AfRS_NBAC17_Day1_0056.jpg"
                alt="NBAC Luxury Aviation Conference and Executive Networking"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="(max-width: 1024px) 100vw, 45vw"
                quality={90}
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

              {/* Bottom Caption overlay on main image */}
              <div className="absolute bottom-4 left-4 right-4 z-10 p-3 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-3">
                <Sparkles size={18} className="text-nbac-emerald shrink-0" />
                <p className="font-sans text-xs text-white/90 font-medium leading-tight">
                  West Africa&apos;s Flagship Aviation Gathering
                </p>
              </div>
            </div>

            {/* Floating Secondary Glass Card Overlay */}
            <div
              ref={floatCardRef}
              className="about-float-card absolute -bottom-6 -left-4 sm:-left-8 z-20 w-60 sm:w-64 p-3.5 rounded-xl bg-black/85 border border-nbac-border/80 shadow-2xl backdrop-blur-xl flex items-center gap-3 group hover:border-nbac-emerald/50 transition-all duration-300"
              style={{ willChange: 'transform' }}
            >
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-white/10">
                <Image
                  src="/images/sliders/AfRS_NBAC17_Day1_0014.jpg"
                  alt="NBAC VIP Lounge Experience"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="64px"
                />
              </div>

              <div>
                <div className="font-display font-bold text-lg text-nbac-emerald leading-none mb-1">
                  10+ Years
                </div>
                <div className="font-sans text-[11px] text-white/80 font-medium leading-tight">
                  Excellence & Industry Advocacy
                </div>
                <div className="font-sans text-[10px] text-nbac-muted uppercase tracking-wider mt-1">
                  Est. 2013 • West Africa
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
