'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { Quote } from 'lucide-react'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function TestimonialsSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.test-eyebrow', '.test-heading', '.test-divider', '.testimonial-card'],
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
        .fromTo('.test-eyebrow',
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo('.test-heading',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.test-divider',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          '-=0.4'
        )

      /* ── Card stagger — slide up + fade ───────────────── */
      gsap.fromTo(
        '.testimonial-card',
        { opacity: 0, y: 44, rotateX: 6 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.85,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.test-grid',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  const testimonials = [
    {
      quote: "NBAC has consistently been the most important business aviation summit in West Africa. The high-level networking here is unmatched, bringing aircraft finance and operator perspectives together seamlessly.",
      author: "Adewale Tinubu",
      role: "Group Chief Executive",
      company: "Oando PLC",
    },
    {
      quote: "As a regulator, the roundtables at NBAC offer an invaluable direct feedback loop from operators. It helps us construct policies that ensure safety while driving sustainable commercial expansion.",
      author: "Capt. Chris Najomo",
      role: "Director General",
      company: "NCAA",
    },
    {
      quote: "The aircraft display access and the private meetings we held during NBAC 2023 directly translated into new fleet acquisition leases. It is a mandatory event for anyone in aircraft operations.",
      author: "Segun Adeyemi",
      role: "Managing Director",
      company: "Falcon Aero",
    },
  ]

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-canvas px-6 md:px-24" style={{ perspective: '800px' }}>
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24 space-y-3 max-w-2xl">
          <SectionEyebrow className="test-eyebrow opacity-0">Endorsements</SectionEyebrow>
          <h2 className="test-heading opacity-0 font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            Voices of the Industry
          </h2>
          <div className="test-divider h-1 w-24 bg-nbac-emerald mx-auto rounded-full mt-4 origin-center opacity-0" />
        </div>

        {/* Testimonials Grid */}
        <div className="test-grid grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          {testimonials.map((t) => (
            <motion.div
              key={t.author}
              className="testimonial-card opacity-0 bg-nbac-panel border border-nbac-border rounded-lg p-8 flex flex-col justify-between h-full relative overflow-hidden"
              whileHover={{
                y: -6,
                borderColor: 'rgba(16, 185, 129, 0.5)',
                boxShadow: '0 8px 32px rgba(16, 185, 129, 0.08)',
              }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Background glowing indicator */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-nbac-emerald/5 blur-[35px] rounded-full pointer-events-none" />

              <div className="space-y-6 relative">
                {/* Quote Icon */}
                <Quote className="text-nbac-emerald h-8 w-8 opacity-40" />
                {/* Quote Text */}
                <p className="font-sans text-sm font-light text-nbac-body leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-8 pt-6 border-t border-nbac-border/20 flex flex-col">
                <span className="font-sans text-sm font-semibold text-nbac-text">
                  {t.author}
                </span>
                <span className="font-sans text-xs text-nbac-muted mt-0.5">
                  {t.role}, {t.company}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
