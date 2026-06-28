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
      year: '2023',
      title: 'Policy Leadership',
      description: 'Influencing the implementation of modernized regulatory frameworks for business jet operators in Lagos and Abuja.',
    },
    {
      year: '2021',
      title: 'Resilience & Growth',
      description: 'Surpassing 500+ international delegates and securing key commitments for regional maintenance exchanges.',
    },
    {
      year: '2018',
      title: 'The Inaugural Summit',
      description: 'The first dedicated gathering of aviation elites in West Africa, establishing the groundwork for the annual conference.',
    },
  ]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (prefersReduced) {
        gsap.set('.timeline-line-progress', { scaleY: 1 })
        gsap.set('.timeline-item-reveal', { opacity: 1, x: 0 })
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

      // Staggered timeline card entrance
      gsap.fromTo(
        '.timeline-item-reveal',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.timeline-content-wrapper',
            start: 'top 75%',
            toggleActions: 'play none none none',
          },
        }
      )
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
          <div className="h-1 w-24 bg-nbac-emerald mx-auto rounded-full mt-4" />
        </div>

        {/* Timeline Container */}
        <div className="timeline-content-wrapper w-full max-w-4xl relative py-8">
          {/* Vertical progress line - centered on desktop, left-aligned on mobile */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-nbac-border -translate-x-1/2">
            <div className="timeline-line-progress absolute inset-0 w-full bg-gradient-to-b from-nbac-emerald to-nbac-emerald-dark origin-top scale-y-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="space-y-16 md:space-y-24">
            {events.map((event, index) => {
              const isEven = index % 2 === 0
              return (
                <div 
                  key={event.year} 
                  className={`timeline-item-reveal opacity-0 flex flex-col md:flex-row relative items-start md:items-center ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Node Ring - centered on desktop, left-aligned on mobile */}
                  <div className="absolute left-[15px] md:left-1/2 top-1.5 md:top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full bg-nbac-alt border border-nbac-border flex items-center justify-center z-10 group cursor-pointer transition-all duration-300 hover:border-nbac-emerald/50">
                    <div className="w-2.5 h-2.5 rounded-full bg-nbac-emerald shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                  </div>

                  {/* Date Column - positioned next to node on mobile/desktop */}
                  <div className="w-full md:w-1/2 pl-10 md:pl-0 md:px-12 flex justify-start md:justify-end is-even:md:justify-start">
                    <div className={`flex flex-col ${isEven ? 'md:items-start md:text-left' : 'md:items-end md:text-right'} items-start text-left`}>
                      <span className="font-display text-3xl md:text-4xl font-extrabold text-nbac-emerald-light tracking-wider select-none mb-1">
                        {event.year}
                      </span>
                    </div>
                  </div>

                  {/* Content Card Column */}
                  <div className="w-full md:w-1/2 pl-10 md:pl-0 md:px-12 mt-2 md:mt-0">
                    <motion.div
                      className="bg-nbac-panel border border-nbac-border rounded-xl p-6 md:p-8 shadow-lg relative cursor-pointer"
                      whileHover={{
                        y: -4,
                        borderColor: 'rgba(16, 185, 129, 0.3)',
                        boxShadow: '0 8px 30px rgba(16, 185, 129, 0.05)',
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
