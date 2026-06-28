'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Globe, Shield, Gem, Plane, Landmark } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export function AboutSponsors() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(['.sponsor-label', '.sponsor-item'], { opacity: 1, y: 0 })
        return
      }

      /* ── Label fades in ───────────────────────────────── */
      gsap.fromTo(
        '.sponsor-label',
        { opacity: 0, y: -12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )

      /* ── Partner logos stagger in ─────────────────────── */
      gsap.fromTo(
        '.sponsor-item',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  const partners = [
    { name: 'AERO-GLOBAL', icon: Globe },
    { name: 'NCAA FEDERAL', icon: Shield },
    { name: 'JET LUXURY', icon: Gem },
    { name: 'W.A. AVIATION', icon: Plane },
    { name: 'MINISTRY TRANS', icon: Landmark },
  ]

  return (
    <section ref={containerRef} className="py-16 md:py-20 bg-nbac-alt px-6 md:px-24 border-b border-nbac-border/40 select-none overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-10 md:space-y-12">
        {/* Sub-heading label */}
        <h4 className="sponsor-label opacity-0 font-sans text-xs uppercase tracking-[0.25em] text-nbac-muted font-bold text-center">
          Coalition of Excellence
        </h4>

        {/* Logo list */}
        <div className="flex flex-wrap justify-center items-center gap-x-12 md:gap-x-16 gap-y-8 max-w-5xl w-full">
          {partners.map((partner) => {
            const Icon = partner.icon
            return (
              <div
                key={partner.name}
                className="sponsor-item opacity-0 flex items-center gap-3 text-nbac-muted/60 hover:text-nbac-emerald-light transition-all duration-300 cursor-pointer group"
              >
                <Icon 
                  size={20} 
                  className="flex-shrink-0 text-nbac-muted/40 group-hover:text-nbac-emerald transition-colors duration-300" 
                />
                <span className="font-display text-sm md:text-base font-bold tracking-widest uppercase group-hover:text-nbac-emerald transition-colors duration-300">
                  {partner.name}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
