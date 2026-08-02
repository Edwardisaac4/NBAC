'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { Calendar, Award, CheckCircle2, Sparkles } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export interface TimelineEvent {
  year: string
  title: string
  subtitle: string
  description: string
  impactHighlight: string
  keyMilestones: string[]
}

export function AboutHistory() {
  const containerRef = useRef<HTMLDivElement>(null)

  const events: TimelineEvent[] = [
    {
      year: '2027',
      title: 'Connected Ecosystem & One Sky Vision',
      subtitle: 'Unifying Airspace & Elevating Regional Tech Incubation',
      description:
        'Focusing on the landmark theme "One Sky, Many Stakeholders," NBAC 2027 convenes 300+ executive delegates to orchestrate single-window flight clearances across ECOWAS airspace, launch the AeroLab startup pitch platform, and establish Sustainable Aviation Fuel (SAF) readiness for West Africa.',
      impactHighlight: '300+ Executive Delegates • 30+ AeroLab Teams',
      keyMilestones: [
        'Single-window ECOWAS airspace clearance roadmap',
        'Launch of AeroLab aviation startup incubation',
        'Sustainable Aviation Fuel (SAF) transition framework',
      ],
    },
    {
      year: '2024',
      title: 'Post-Pandemic Resilience & Fleet Modernization',
      subtitle: 'Navigating Currency Volatility & Commercial Fleet Expansion',
      description:
        'Addressed post-pandemic supply chain realities and FX liquidity challenges. Convened domestic commercial banks, international lessors, and operators to structure innovative aircraft lease-to-own models, secondary market asset evaluations, and MRO capacity expansion.',
      impactHighlight: 'Cross-Border Financing & MRO Expansion',
      keyMilestones: [
        'Domestic bank aircraft debt syndication roundtables',
        'NCAA & FAAN joint airport access framework',
        'FBO passenger processing capacity optimization',
      ],
    },
    {
      year: '2017',
      title: 'Strategic Partnerships & Gala Networking',
      subtitle: 'Forging High-Level Alliances Across Public & Private Sectors',
      description:
        'Hosted the historic "An Evening of Aviators" gala, cementing strategic commercial alliances between African charter operators, European aircraft brokerages, and international financiers. Established key advocacy committees for cross-border flight clearance rationalization.',
      impactHighlight: 'Strategic OEM & Finance Alliances',
      keyMilestones: [
        'Establishment of the NBAC Executive Steering Committee',
        'Harmonized cross-border flight charter guidelines',
        'High-level ministerial & OEM networking summit',
      ],
    },
    {
      year: '2016',
      title: 'Policy Leadership & Regulatory Advocacy',
      subtitle: 'Steering Customs Tax Relief & Airspace Access',
      description:
        'Pioneered intense advocacy sessions with the Nigerian Civil Aviation Authority (NCAA), Federal Airports Authority of Nigeria (FAAN), and Nigeria Customs Service. Directly influenced policy dialogues regarding spare parts import tariffs, maintenance tax relief, and private apron security.',
      impactHighlight: 'Customs & Tariff Policy Dialogues',
      keyMilestones: [
        'Direct legislative advocacy on aviation parts import duties',
        'IS-BAH / IS-BAO safety protocol promotion',
        'Streamlined VIP terminal clearance procedures',
      ],
    },
    {
      year: '2014',
      title: 'Infrastructure & FBO Expansion',
      subtitle: 'Establishing Hangar Bays & VIP Terminal Benchmarks',
      description:
        'Initiated dedicated development blueprints for luxury FBO terminals, executive passenger lounges, and expanded hangar capacities at Murtala Muhammed International Airport (MMIA), Lagos—laying the groundwork for world-class ground handling.',
      impactHighlight: 'MMIA Lagos FBO Infrastructure Blueprint',
      keyMilestones: [
        'Groundwork for integrated FBO & hangar complexes',
        'Lounge hospitality and VIP safety protocols',
        'Regional operator safety accreditation drive',
      ],
    },
    {
      year: '2013',
      title: 'The Inaugural Summit',
      subtitle: 'Establishing Africa\'s Premier Business Aviation Platform',
      description:
        'Founded by EAN Aviation, NBAC launched as the first dedicated business aviation summit in Nigeria. It established an unprecedented annual platform uniting aircraft owners, charter companies, regulatory authorities, and global aerospace pioneers.',
      impactHighlight: 'Founding Summit in Lagos, Nigeria',
      keyMilestones: [
        'First non-partisan business aviation forum in West Africa',
        'Over 100 pioneer aviation leaders and regulators in attendance',
        'Created the annual roadmap for regional industry advocacy',
      ],
    },
  ]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set('.timeline-line-progress', { scaleY: 1 })
        gsap.set('.timeline-node-ring', { scale: 1, opacity: 1 })
        gsap.set('.timeline-year', { opacity: 1, y: 0 })
        gsap.set('.timeline-card', { opacity: 1, x: 0, rotate: 0, scale: 1 })
        return
      }

      // Animate line growth smoothly as user scrolls
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

      // Individual scroll-triggered elements reveal
      const items = gsap.utils.toArray(
        '.timeline-item-reveal'
      ) as HTMLElement[]
      items.forEach((item, index) => {
        const isEven = index % 2 === 0
        const ring = item.querySelector('.timeline-node-ring')
        const year = item.querySelector('.timeline-year')
        const card = item.querySelector('.timeline-card')

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 70%',
            toggleActions: 'play none none none',
          },
        })

        tl.fromTo(
          ring,
          { opacity: 0, scale: 0.5 },
          { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        )

        tl.fromTo(
          year,
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' },
          '-=0.3'
        )

        tl.fromTo(
          card,
          {
            opacity: 0,
            x: isEven ? -50 : 50,
            rotate: isEven ? -2 : 2,
            scale: 0.96,
          },
          {
            opacity: 1,
            x: 0,
            rotate: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power3.out',
          },
          '-=0.4'
        )
      })
    },
    { scope: containerRef }
  )

  return (
    <section
      id="history"
      ref={containerRef}
      className="py-20 md:py-32 bg-nbac-alt px-6 md:px-12 lg:px-24 border-b border-nbac-border overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex flex-col items-center">
        {/* Header Block */}
        <div className="text-center max-w-3xl space-y-4 mb-20 md:mb-28">
          <SectionEyebrow>Chronicles of Progress</SectionEyebrow>

          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-nbac-text tracking-tight">
            The <span className="text-nbac-emerald">Chronological Legacy</span>
          </h2>

          <div className="h-1 w-24 bg-linear-to-r from-nbac-gold via-nbac-emerald to-nbac-gold mx-auto rounded-full mt-2" />

          <p className="font-sans text-base sm:text-lg font-light text-nbac-body leading-relaxed pt-2">
            Explore the landmark editions, policy breakthroughs, and institutional milestones that have defined NBAC since 2013.
          </p>
        </div>

        {/* Timeline Container */}
        <div className="timeline-content-wrapper w-full max-w-5xl relative py-8">
          {/* Vertical progress line - centered on desktop, left-aligned on mobile */}
          <div className="absolute left-[15px] md:left-1/2 top-0 bottom-0 w-[2px] bg-nbac-border -translate-x-1/2">
            <div className="timeline-line-progress absolute inset-0 w-full bg-linear-to-b from-nbac-emerald via-nbac-gold to-nbac-emerald origin-top scale-y-0 shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="space-y-16 md:space-y-24">
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
                  <div className="timeline-node-ring opacity-0 absolute left-[15px] md:left-1/2 top-1.5 md:top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-nbac-panel border-2 border-nbac-emerald/50 flex items-center justify-center z-10 group cursor-pointer transition-all duration-300 hover:border-nbac-gold">
                    <div className="w-3.5 h-3.5 rounded-full bg-nbac-emerald shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-transform duration-300 group-hover:scale-125 group-hover:bg-nbac-gold" />
                  </div>

                  {/* Date Column - positioned next to node on mobile/desktop */}
                  <div
                    className={`w-full md:w-1/2 pl-12 flex justify-start ${
                      isEven
                        ? 'md:justify-start md:pl-16 md:pr-0'
                        : 'md:justify-end md:pr-16 md:pl-0'
                    }`}
                  >
                    <div
                      className={`flex flex-col ${
                        isEven
                          ? 'md:items-start md:text-left'
                          : 'md:items-end md:text-right'
                      } items-start text-left`}
                    >
                      <span className="timeline-year opacity-0 font-display text-4xl sm:text-5xl font-extrabold text-nbac-gold-light tracking-wider select-none mb-1">
                        {event.year}
                      </span>
                      <span className="font-sans text-xs uppercase tracking-widest text-nbac-emerald font-semibold flex items-center gap-1.5">
                        <Calendar size={13} />
                        <span>NBAC Edition</span>
                      </span>
                    </div>
                  </div>

                  {/* Content Card Column */}
                  <div
                    className={`w-full md:w-1/2 pl-12 mt-3 md:mt-0 ${
                      isEven ? 'md:pr-16 md:pl-0' : 'md:pl-16 md:pr-0'
                    }`}
                  >
                    <motion.div
                      className="timeline-card opacity-0 bg-nbac-panel border border-nbac-border/80 rounded-2xl p-6 sm:p-8 shadow-xl relative transition-all duration-300 hover:border-nbac-emerald/50 hover:bg-nbac-surface/80 group"
                      whileHover={{
                        y: -4,
                        boxShadow: '0 12px 36px rgba(16, 185, 129, 0.08)',
                      }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                    >
                      {/* Top accent bar */}
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-nbac-emerald/60 to-nbac-gold/60 rounded-t-2xl group-hover:from-nbac-emerald group-hover:to-nbac-gold transition-colors duration-300" />

                      <div className="space-y-3">
                        <div>
                          <span className="font-sans text-[11px] uppercase tracking-widest font-bold text-nbac-gold-light block mb-1">
                            {event.subtitle}
                          </span>
                          <h3 className="font-display text-xl sm:text-2xl font-bold text-nbac-text tracking-tight group-hover:text-white transition-colors">
                            {event.title}
                          </h3>
                        </div>

                        <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
                          {event.description}
                        </p>

                        {/* Milestone checklist */}
                        <div className="pt-3 border-t border-nbac-border/50 space-y-2">
                          {event.keyMilestones.map((m) => (
                            <div
                              key={m}
                              className="flex items-start gap-2 text-xs font-sans text-nbac-text/90"
                            >
                              <CheckCircle2
                                size={14}
                                className="text-nbac-emerald shrink-0 mt-0.5"
                              />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>

                        {/* Impact highlight tag */}
                        <div className="pt-2 flex items-center gap-1.5 text-[11px] font-sans font-medium text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-3 py-1.5 rounded-lg w-fit">
                          <Sparkles size={13} className="text-nbac-gold shrink-0" />
                          <span>{event.impactHighlight}</span>
                        </div>
                      </div>
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
