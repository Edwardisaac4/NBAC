'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { STEERING_COMMITTEE_MEMBERS } from '@/lib/constants'

gsap.registerPlugin(ScrollTrigger)

export function CommitteeSection() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Duplicate the list of members to ensure seamless infinite looping marquee
  const duplicatedMembers = [
    ...STEERING_COMMITTEE_MEMBERS,
    ...STEERING_COMMITTEE_MEMBERS,
  ]

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
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.comm-slider-wrapper',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-alt px-6 md:px-24 overflow-hidden border-b border-nbac-border">
      <div className="max-w-7xl mx-auto flex flex-col items-center relative">
        {/* Header */}
        <div className="text-center mb-20 md:mb-28 space-y-3 max-w-2xl relative w-full">
          <SectionEyebrow className="comm-eyebrow opacity-0">Leadership &amp; Vision</SectionEyebrow>
          <h2 className="comm-heading opacity-0 font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            Steering Committee
          </h2>
          <div className="comm-divider h-1 w-24 bg-nbac-gold mx-auto rounded-full mt-4 origin-center opacity-0" />
        </div>

        {/* Slider Wrapper */}
        <div className="comm-slider-wrapper w-full max-w-6xl relative px-4 md:px-10">

          {/* Viewport */}
          <div className="overflow-hidden w-full">
            <div className="flex flex-nowrap w-max -ml-6 md:-ml-8 animate-marquee">
              {duplicatedMembers.map((member, index) => {
                const roleLower = member.role.toLowerCase()
                const isPremiumRole = roleLower === 'chairman' || roleLower === 'vice chairman'
                return (
                  <div
                    key={`${member.name}-${index}`}
                    className="committee-card opacity-0 w-[280px] shrink-0 pl-6 md:pl-8 py-4 flex flex-col items-center relative group"
                  >
                    <motion.div
                      className="w-full flex flex-col items-center"
                      whileHover={{ y: -8 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {/* Portrait Avatar with Glowing Ring */}
                      <div className={`w-44 h-56 rounded-2xl border-[3px] overflow-hidden relative z-10 shadow-lg transition-all duration-300 group-hover:scale-105 ${isPremiumRole
                          ? 'border-nbac-gold shadow-nbac-gold/15 group-hover:border-nbac-gold-light group-hover:shadow-nbac-gold/35'
                          : 'border-nbac-emerald shadow-nbac-emerald/10 group-hover:border-nbac-emerald-light group-hover:shadow-nbac-emerald/30'
                        }`}>
                        <Image
                          src={member.image}
                          alt={member.name}
                          width={352}
                          height={448}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          style={{ objectPosition: member.objectPosition || 'center' }}
                          quality={90}
                        />
                      </div>

                      {/* Information Pill Overlay */}
                      <div className={`w-full bg-nbac-panel border rounded-xl px-6 pt-16 pb-5 text-center -mt-12 relative z-0 transition-colors duration-300 group-hover:bg-nbac-panel/90 shadow-md ${isPremiumRole
                          ? 'border-nbac-border group-hover:border-nbac-gold/30'
                          : 'border-nbac-border group-hover:border-nbac-emerald/30'
                        }`}>
                        <h3 className={`font-sans text-base font-semibold text-nbac-text leading-snug transition-colors duration-300 ${isPremiumRole ? 'group-hover:text-nbac-gold-light' : 'group-hover:text-nbac-emerald'
                          }`}>
                          {member.name}
                        </h3>
                        <p className={`font-sans text-xs font-medium tracking-wide mt-1 uppercase ${isPremiumRole ? 'text-nbac-gold-light' : 'text-nbac-emerald-light'
                          }`}>
                          {member.role}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

