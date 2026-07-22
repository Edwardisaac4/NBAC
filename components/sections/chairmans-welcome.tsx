'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

export function ChairmansWelcome() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(['.welcome-image', '.welcome-content'], { opacity: 1, x: 0 })
        return
      }

      gsap.fromTo(
        '.welcome-image',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      )

      gsap.fromTo(
        '.welcome-content',
        { opacity: 0, x: 30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
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

  return (
    <section
      ref={containerRef}
      className="py-24 md:py-32 bg-nbac-canvas border-b border-nbac-border overflow-hidden px-6 md:px-24"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
        
        {/* Left Side: Chairman Portrait */}
        <div className="welcome-image opacity-0 w-full md:w-[40%] flex justify-center shrink-0">
          <div className="relative w-64 h-80 md:w-full md:h-[450px] rounded-xl overflow-hidden border border-nbac-border bg-nbac-deep shadow-2xl glass-card">
            <Image
              src="/images/sd-nbac.jpg"
              alt="Segun Demuren — Chairman, NBAC Steering Committee"
              fill
              className="object-cover object-top filter contrast-[1.02]"
              sizes="(max-width: 768px) 256px, 450px"
              quality={90}
            />
            {/* Ambient lighting glow */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b0f10]/80 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6">
              <span className="font-sans text-[10px] font-bold text-nbac-gold uppercase tracking-widest block mb-1">
                CONFERENCE CHAIRMAN
              </span>
              <h3 className="font-display text-xl font-bold text-nbac-text leading-tight">
                Segun Demuren
              </h3>
            </div>
          </div>
        </div>

        {/* Right Side: Welcome Letter */}
        <div className="welcome-content opacity-0 w-full md:w-[60%] flex flex-col justify-center">
          <SectionEyebrow>CHAIRMAN&apos;S ADDRESS</SectionEyebrow>
          
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nbac-text tracking-tight leading-tight mt-4 mb-8">
            Welcoming the Leaders of West African Aviation
          </h2>

          <div className="space-y-6 font-sans text-sm md:text-base font-light text-nbac-body leading-relaxed">
            <p className="italic text-nbac-text font-normal border-l-2 border-nbac-gold pl-4 text-base md:text-lg">
              &ldquo;Moving West Africa&apos;s business aviation sector from a luxury niche to a necessary economic catalyst is not a future objective — it is our current mandate.&rdquo;
            </p>
            <p>
              On behalf of the Steering Committee, it is my privilege to welcome you to the Nigerian Business Aviation Conference 2027. Business aviation in Nigeria and across the wider continent stands at a critical transition point. The decisions we make today regarding fleet operations, safety compliance, and capital investment will shape the regional skies for the next generation.
            </p>
            <p>
              Over the course of these two days, we will not shy away from the hard questions. From standardizing regulatory permits to creating bespoke local financing structures, NBAC 2027 is designed to act as a catalyst for actionable solutions.
            </p>
            <p>
              I encourage you to participate actively in our panel dialogues, explore the static aircraft display, and connect deeply with the innovators gathered in this room. Thank you for committing your time, insights, and leadership to moving our industry forward.
            </p>
          </div>

          <div className="mt-10 pt-6 border-t border-nbac-border/30">
            <p className="font-sans text-sm font-semibold text-nbac-text">
              Segun Demuren
            </p>
            <p className="font-sans text-xs text-nbac-muted mt-0.5">
              Chairman, NBAC Steering Committee
            </p>
          </div>
        </div>

      </div>
    </section>
  )
}
