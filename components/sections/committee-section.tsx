'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function CommitteeSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          ['.comm-eyebrow', '.comm-heading', '.comm-divider', '.committee-card'],
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
        .fromTo('.comm-eyebrow',
          { opacity: 0, y: -16 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
        )
        .fromTo('.comm-heading',
          { opacity: 0, y: 28 },
          { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.4'
        )
        .fromTo('.comm-divider',
          { scaleX: 0, opacity: 0 },
          { scaleX: 1, opacity: 1, duration: 0.7, ease: 'power2.inOut' },
          '-=0.4'
        )

      /* ── Card stagger with scale pop ──────────────────── */
      gsap.fromTo(
        '.committee-card',
        { opacity: 0, y: 50, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.comm-grid',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  const members = [
    {
      name: 'Dr. Adebayo Ojo',
      role: 'Chairman',
      image: '/images/dr_adebayo_ojo.png',
    },
    {
      name: 'Captain Fatima Ali',
      role: 'CEO',
      image: '/images/captain_fatima_ali.png',
    },
    {
      name: 'Mr. Kenji Tanaka',
      role: 'Chief Operations Officer',
      image: '/images/mr_kenji_tanaka.png',
    },
    {
      name: 'Ms. Chidinma Okafor',
      role: 'Director of Strategy',
      image: '/images/ms_chidinma_okafor.png',
    },
  ]

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-alt px-6 md:px-24 overflow-hidden border-b border-nbac-border">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header */}
        <div className="text-center mb-20 md:mb-28 space-y-3 max-w-2xl">
          <SectionEyebrow className="comm-eyebrow opacity-0">Leadership &amp; Vision</SectionEyebrow>
          <h2 className="comm-heading opacity-0 font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            Executive Committee Grid
          </h2>
          <div className="comm-divider h-1 w-24 bg-nbac-emerald mx-auto rounded-full mt-4 origin-center opacity-0" />
        </div>

        {/* Committee Grid */}
        <div className="comm-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-16 w-full max-w-6xl">
          {members.map((member) => (
            <motion.div
              key={member.name}
              className="committee-card opacity-0 flex flex-col items-center relative group"
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Circular Avatar with Glowing Ring */}
              <div className="w-44 h-44 rounded-full border-[3px] border-nbac-emerald overflow-hidden relative z-10 shadow-lg shadow-nbac-emerald/10 transition-all duration-300 group-hover:border-nbac-emerald-light group-hover:shadow-nbac-emerald/30 group-hover:scale-105">
                <Image
                  src={member.image}
                  alt={member.name}
                  width={176}
                  height={176}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Information Pill Overlay */}
              <div className="w-full bg-nbac-panel border border-nbac-border rounded-xl px-6 pt-14 pb-5 text-center -mt-10 relative z-0 transition-colors duration-300 group-hover:border-nbac-emerald/30 group-hover:bg-nbac-panel/90 shadow-md">
                <h3 className="font-sans text-base font-semibold text-nbac-text leading-snug group-hover:text-nbac-emerald transition-colors duration-300">
                  {member.name}
                </h3>
                <p className="font-sans text-xs font-medium text-nbac-emerald-light tracking-wide mt-1 uppercase">
                  {member.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
