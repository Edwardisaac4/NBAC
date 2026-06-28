'use client'

import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

interface CommitteeMember {
  name: string
  role: string
  image: string
}

export function AboutCommittee() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isLaptop, setIsLaptop] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)')
    setIsLaptop(mediaQuery.matches)

    const handler = (e: MediaQueryListEvent) => setIsLaptop(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  const members: CommitteeMember[] = [
    {
      name: 'Capt. Ibrahim Nuru',
      role: 'BOARD CHAIRMAN',
      image: '/images/capt_ibrahim_nuru.png',
    },
    {
      name: 'Dr. Amina Olaye',
      role: 'STRATEGIC DIRECTOR',
      image: '/images/dr_amina_olaye.png',
    },
    {
      name: 'Yande Bakare',
      role: 'POLICY LIAISON',
      image: '/images/yande_bakare.png',
    },
    {
      name: 'Samuel Akenzua',
      role: 'OPS COMMITTEE',
      image: '/images/samuel_akenzua.png',
    },
  ]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (prefersReduced) {
        gsap.set('.committee-card-reveal', { opacity: 1, y: 0 })
        return
      }

      gsap.fromTo(
        '.committee-card-reveal',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.committee-grid',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-canvas px-6 md:px-24 border-b border-nbac-border overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header Block */}
        <div className="text-center max-w-2xl space-y-3 mb-20 md:mb-28">
          <SectionEyebrow>Steering Committee</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            Leadership Disclosure
          </h2>
          <div className="h-1 w-24 bg-nbac-emerald mx-auto rounded-full mt-4" />
        </div>

        {/* Committee Grid */}
        <div className="committee-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl">
          {members.map((member) => (
            <motion.div
              key={member.name}
              className="committee-card-reveal opacity-0 bg-nbac-panel border border-nbac-border rounded-xl overflow-hidden shadow-md flex flex-col group h-full cursor-pointer"
              whileHover={isLaptop ? {
                y: -6,
                borderColor: 'rgba(16, 185, 129, 0.4)',
                boxShadow: '0 12px 40px rgba(16, 185, 129, 0.08)',
              } : undefined}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {/* Photo Container */}
              <div className="relative aspect-4/5 w-full overflow-hidden bg-nbac-alt">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover grayscale-0 lg:grayscale lg:group-hover:grayscale-0 scale-100 lg:group-hover:scale-105 transition-all duration-500 ease-out"
                />
                {/* Thin overlay to tie into dark luxury aesthetic */}
                <div className="absolute inset-0 bg-linear-to-t from-nbac-panel/90 via-transparent to-transparent opacity-60 pointer-events-none" />
              </div>

              {/* Info Block */}
              <div className="p-6 grow flex flex-col justify-between">
                <div>
                  <h3 className="font-sans text-lg font-bold text-nbac-text tracking-wide lg:group-hover:text-nbac-emerald transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="font-sans text-xs font-semibold text-nbac-emerald-light tracking-widest mt-1.5 uppercase">
                    {member.role}
                  </p>
                </div>
              </div>

              {/* BIO Action Button */}
              <div className="border-t border-nbac-border p-4 bg-nbac-alt/40 flex justify-center lg:group-hover:bg-nbac-emerald/5 transition-colors duration-300">
                <span className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-emerald lg:group-hover:text-nbac-emerald-light transition-colors duration-300 flex items-center gap-1.5 select-none">
                  BIO &gt;
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
