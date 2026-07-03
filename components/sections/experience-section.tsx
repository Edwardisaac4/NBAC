'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function ExperienceSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.reveal-left', '.reveal-right', '.exp-eyebrow', '.exp-heading', '.exp-body', '.exp-list-item'],
          { opacity: 1, x: 0, y: 0 }
        )
        return
      }

      /* ── Left side — image slides in from left ───────── */
      gsap.fromTo(
        '.reveal-left',
        { opacity: 0, x: -60, scale: 0.96 },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 78%',
            toggleActions: 'play none none none',
          },
        }
      )

      /* ── Right side — content stagger ─────────────────── */
      const rightTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      })

      rightTl
        .fromTo('.exp-eyebrow',
          { opacity: 0, y: -12 },
          { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
        )
        .fromTo('.exp-heading',
          { opacity: 0, x: 40 },
          { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo('.exp-body',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
          '-=0.5'
        )
        .fromTo('.exp-list-item',
          { opacity: 0, x: 24 },
          { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
          '-=0.3'
        )

      /* ── Subtle parallax on the image ─────────────────── */
      gsap.to(imageRef.current, {
        yPercent: -8,
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

  const items = [
    'Closed-door Ministerial roundtables',
    'Exclusive static aircraft display access',
    'Sustainability and Bio-fuel symposiums',
  ]

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-canvas overflow-hidden px-6 md:px-24">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
        {/* Left Side: Cabin Image */}
        <div className="reveal-left opacity-0 order-2 lg:order-1 relative w-full aspect-video lg:aspect-[4/3] rounded-xl overflow-hidden border border-nbac-border shadow-2xl shadow-nbac-emerald/5 group">
          {/* Subtle green ambient lighting underneath */}
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-nbac-emerald/5 blur-[85px] rounded-full" />
          <div ref={imageRef} className="w-full h-full absolute inset-0">
            <Image
              src="/images/interior_cabin.jpg"
              alt="Luxury business jet interior"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 1024px) 100vw, 50vw"
              quality={90}
            />
          </div>
        </div>

        {/* Right Side: Copy & List */}
        <div className="reveal-right order-1 lg:order-2 space-y-6 max-w-xl">
          <SectionEyebrow className="exp-eyebrow opacity-0">Exclusive Experience</SectionEyebrow>
          <h2 className="exp-heading opacity-0 font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight leading-tight">
            Where Policy Meets Luxury Engineering
          </h2>
          <p className="exp-body opacity-0 font-sans text-base font-light text-nbac-body leading-relaxed">
            NBAC 2024 is the only platform where the decision-makers of West African aviation congregate to discuss the future of the industry while experiencing the latest in aeronautical engineering.
          </p>
          <ul className="space-y-4 pt-4">
            {items.map((item) => (
              <li key={item} className="exp-list-item opacity-0 flex items-center gap-4 text-nbac-text font-sans text-sm font-light">
                <CheckCircle2 className="text-nbac-emerald h-5 w-5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
