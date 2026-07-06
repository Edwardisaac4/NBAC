'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { SectionEyebrow } from '../shared/section-eyebrow'

gsap.registerPlugin(ScrollTrigger)

interface TimelineEvent {
  year: string
  title: string
  description: string
}

export function AboutHistory() {
  const containerRef = useRef<HTMLDivElement>(null)

  const events: TimelineEvent[] = [
    {
      year: '2026/2027',
      title: 'Connected Ecosystem',
      description: 'Focusing on "One Sky, Many Stakeholders," coordinating regulatory, operational, and infrastructure layers for unified growth.',
    },
    {
      year: '2017',
      title: 'Strategic Partnerships',
      description: 'The themed gala "An Evening of Aviators" fostered critical commercial alliances and modern leasing models for corporate jets.',
    },
    {
      year: '2016',
      title: 'Policy & Advocacy',
      description: 'Steering industry rules on tax incentives, customs, and airspace access to streamline operators\' overheads.',
    },
    {
      year: '2014',
      title: 'Infrastructure Expansion',
      description: 'Initiating planning frameworks for FBO terminals, luxury passenger lounges, and dedicated hangar capacity across local airports.',
    },
    {
      year: '2013',
      title: 'The Inaugural Summit',
      description: 'The first dedicated business aviation summit in Nigeria, establishing the annual platform for leaders, operators, and regulators.',
    },
  ]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReduced) {
        gsap.set('.timeline-line-progress', { scaleY: 1 })
        gsap.set('.timeline-node-ring', { scale: 1, opacity: 1 })
        gsap.set('.timeline-year', { opacity: 1, y: 0 })
        gsap.set('.timeline-card', { opacity: 1, x: 0, rotate: 0, scale: 1 })
        return
      }

      // Animate line growth
      gsap.fromTo(
        '.timeline-line-progress',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.timeline-content-wrapper',
            start: 'top 60%',
            end: 'bottom 60%',
            scrub: true,
          },
        }
      )

      // Individual scroll-triggered elements reveal for a luxury high-end feel
      const items = gsap.utils.toArray('.timeline-item-reveal') as HTMLElement[]
      items.forEach((item, index) => {
        const isEven = index % 2 === 0
        const ring = item.querySelector('.timeline-node-ring')
        const year = item.querySelector('.timeline-year')
        const card = item.querySelector('.timeline-card')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 60%',
            toggleActions: 'play none none none',
          }
        })

        // Just a fade in for the ring on the line
        tl.fromTo(ring,
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: 'power2.out' }
        )

        // Drift the year up
        tl.fromTo(year,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )

        // Slide and tilt the card depending on even/odd placement
        tl.fromTo(card,
          { 
            opacity: 0, 
            x: isEven ? -60 : 60,
            rotate: isEven ? -3 : 3,
            scale: 0.95
          },
          { 
            opacity: 1, 
            x: 0, 
            rotate: 0,
            scale: 1,
            duration: 0.85, 
            ease: 'power3.out' 
          },
          '-=0.4'
        )
      })
    },
    { scope: containerRef }
  )

  return (
    <section ref={containerRef} className="py-20 md:py-32 bg-nbac-alt px-6 md:px-24 border-b border-nbac-border overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header Block */}
        <div className="text-center max-w-2xl space-y-3 mb-20 md:mb-28">
          <SectionEyebrow>Chronicles of Progress</SectionEyebrow>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
            The NBAC Story
          </h2>
          <div className="h-1 w-24 bg-nbac-gold mx-auto rounded-full mt-4" />
        </div>

        {/* Timeline Container */}
        <div className="timeline-content-wrapper w-full max-w-4xl relative py-8">
          {/* Vertical progress line - centered on desktop, left-aligned on mobile */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-nbac-border -translate-x-1/2">
            <div className="timeline-line-progress absolute inset-0 w-full bg-gradient-to-b from-nbac-gold to-nbac-gold-dark origin-top scale-y-0 shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
          </div>

          <div className="space-y-24 md:space-y-36">
            {events.map((event, index) => {
              const isEven = index % 2 === 0
              return (
                <div 
                  key={event.year} 
                  className={`timeline-item-reveal flex flex-col md:flex-row relative items-start md:items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Node Ring - centered on desktop, left-aligned on mobile */}
                  <div className="timeline-node-ring opacity-0 absolute left-[15px] md:left-1/2 top-1.5 md:top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-nbac-panel border-2 border-nbac-border flex items-center justify-center z-10 group cursor-pointer transition-all duration-300 hover:border-nbac-gold/50">
                    <div className="timeline-node-dot w-3 h-3 rounded-full bg-nbac-gold shadow-[0_0_10px_rgba(197,160,89,0.8)] transition-transform duration-300 group-hover:scale-125" />
                  </div>

                  {/* Date Column - positioned next to node on mobile/desktop */}
                  <div className={`w-full md:w-1/2 pl-10 flex justify-start ${
                    isEven 
                      ? 'md:justify-start md:pl-16 md:pr-0' 
                      : 'md:justify-end md:pr-16 md:pl-0'
                  }`}>
                    <div className={`flex flex-col ${isEven ? 'md:items-start md:text-left' : 'md:items-end md:text-right'} items-start text-left`}>
                      <span className="timeline-year opacity-0 font-display text-3xl md:text-4xl font-extrabold text-nbac-gold-light tracking-wider select-none mb-1">
                        {event.year}
                      </span>
                    </div>
                  </div>

                  {/* Content Card Column */}
                  <div className={`w-full md:w-1/2 pl-10 mt-2 md:mt-0 ${
                    isEven 
                      ? 'md:pr-16 md:pl-0' 
                      : 'md:pl-16 md:pr-0'
                  }`}>
                    <motion.div
                      className="timeline-card opacity-0 bg-nbac-panel border border-nbac-border rounded-xl p-6 md:p-8 shadow-lg relative cursor-pointer transition-colors duration-300 hover:border-nbac-gold/30"
                      whileHover={{
                        y: -4,
                        boxShadow: '0 8px 30px rgba(197, 160, 89, 0.05)',
                      }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      <h3 className="font-sans text-lg md:text-xl font-bold text-nbac-text tracking-wide mb-2">
                        {event.title}
                      </h3>
                      <p className="font-sans text-sm md:text-base font-light text-nbac-body leading-relaxed">
                        {event.description}
                      </p>
                    </motion.div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
