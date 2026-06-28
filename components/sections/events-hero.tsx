'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { Calendar, MapPin, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export function EventsHero() {
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const bgRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.events-eyebrow', '.events-title', '.events-desc', '.events-stat-card'],
          { opacity: 1, y: 0, scale: 1 }
        )
        return
      }

      /* ── Entrance timeline ─────────────────────────────── */
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      // Eyebrow drops in
      tl.fromTo('.events-eyebrow',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )

      // Title slides up with perspective
      tl.fromTo('.events-title',
        { opacity: 0, y: 40, rotateX: 8 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1 },
        '-=0.5'
      )

      // Description fades in
      tl.fromTo('.events-desc',
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.6'
      )

      // Stats card row staggers in
      tl.fromTo('.events-stat-card',
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.15,
          ease: 'power3.out'
        },
        '-=0.6'
      )

      /* ── Scroll-driven content fade-out ────────────────── */
      gsap.to(contentRef.current, {
        y: -40,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '80% top',
          scrub: true,
        },
      })

      /* ── Parallax on background ────────────────────────── */
      gsap.to(bgRef.current, {
        yPercent: 15,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <section 
      ref={containerRef} 
      className="relative min-h-[75vh] flex items-center justify-center overflow-hidden py-24 bg-nbac-canvas"
    >
      {/* Background Image Layer with Parallax */}
      <div 
        ref={bgRef}
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/private_jet_runway_dusk.png)' }}
      />
      
      {/* Dark Luxury Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-nbac-canvas via-nbac-canvas/80 to-transparent z-0" />
      <div className="absolute inset-0 bg-black/45 z-0" />
      
      {/* Radial Environmental Light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-4xl bg-nbac-emerald/10 rounded-full blur-3xl opacity-60 z-0 pointer-events-none" />

      {/* Hero Content Container */}
      <div ref={contentRef} className="relative z-10 max-w-7xl mx-auto px-6 md:px-24 text-center">
        <div className="events-eyebrow opacity-0">
          <SectionEyebrow className="text-center justify-center">
            October 28 - 29, 2026 • Lagos, Nigeria
          </SectionEyebrow>
        </div>

        <h1 className="events-title opacity-0 font-display text-4xl md:text-6xl lg:text-7xl font-bold text-nbac-text tracking-tight leading-tight md:leading-none max-w-5xl mx-auto mb-6">
          Shaping the Future of <br className="hidden md:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-nbac-text via-nbac-text to-nbac-emerald dark:from-white dark:via-nbac-text dark:to-nbac-emerald text-glow">
            West African Business Aviation
          </span>
        </h1>

        <p className="events-desc opacity-0 font-sans text-base md:text-xl font-light text-nbac-body max-w-3xl mx-auto leading-relaxed mb-12">
          Explore two intensive days of keynote addresses, panels, and masterclass workshops led by international executives, regulators, and flight logistics pioneers.
        </p>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 max-w-4xl mx-auto">
          {/* Stat 1 */}
          <div className="events-stat-card opacity-0 bg-nbac-panel/40 backdrop-blur-md border border-nbac-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:scale-[1.02] duration-300">
            <Calendar className="text-nbac-emerald mb-2 w-6 h-6" />
            <span className="font-display text-xl font-bold text-nbac-text mb-0.5">2 Full Days</span>
            <span className="font-sans text-xs uppercase tracking-wider text-nbac-muted">Keynotes & Panels</span>
          </div>

          {/* Stat 2 */}
          <div className="events-stat-card opacity-0 bg-nbac-panel/40 backdrop-blur-md border border-nbac-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:scale-[1.02] duration-300">
            <Users className="text-nbac-emerald mb-2 w-6 h-6" />
            <span className="font-display text-xl font-bold text-nbac-text mb-0.5">12+ Speakers</span>
            <span className="font-sans text-xs uppercase tracking-wider text-nbac-muted">Industry Leaders</span>
          </div>

          {/* Stat 3 */}
          <div className="events-stat-card opacity-0 bg-nbac-panel/40 backdrop-blur-md border border-nbac-border rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-lg transition-transform hover:scale-[1.02] duration-300">
            <MapPin className="text-nbac-emerald mb-2 w-6 h-6" />
            <span className="font-display text-xl font-bold text-nbac-text mb-0.5">1 Main Stage</span>
            <span className="font-sans text-xs uppercase tracking-wider text-nbac-muted">Grand Ballroom</span>
          </div>
        </div>
      </div>
    </section>
  )
}
