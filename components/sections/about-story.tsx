'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { SectionEyebrow } from '../shared/section-eyebrow'
import {
  Compass,
  TrendingUp,
  Sparkles,
  Quote,
  CheckCircle2,
  Award,
  Layers,
  Rocket,
} from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

export interface StoryChapter {
  id: string
  number: string
  period: string
  title: string
  subtitle: string
  leadParagraph: string
  detailedBody: string
  icon: typeof Compass
  image: string
  imageAlt: string
  metrics: { label: string; value: string }[]
  keyHighlights: string[]
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'catalyst',
    number: '01',
    period: '2013 • The Foundation',
    title: 'The Catalyst: Breaking Silos & Pioneering Regional Dialogue',
    subtitle: 'How a Vision Born in Lagos Reshaped West African Aerospace',
    leadParagraph:
      'Prior to 2013, business aviation across West Africa operated in fragmented silos. Aircraft owners and charter operators navigated cumbersome permit delays, high tariffs, and limited local infrastructure, while regulatory authorities lacked a dedicated forum to engage private operators directly.',
    detailedBody:
      'Recognizing this critical gap, EAN Aviation established the Nigerian Business Aviation Conference (NBAC) as a non-partisan, executive-level summit. For the first time in the region’s history, high-net-worth aircraft owners, C-suite executives, global OEMs (Airbus, Bombardier, Dassault, Gulfstream), and government agencies (NCAA, FAAN, NAMA) convened under one roof to align on operational priorities, safety standards, and commercial growth.',
    icon: Compass,
    image: '/images/sliders/slider 1.jpg',
    imageAlt: 'NBAC Inaugural Summit & Aviation Executive Leaders',
    metrics: [
      { label: 'Pioneer Summit', value: '2013' },
      { label: 'Founding Delegates', value: '100+' },
      { label: 'Agencies Engaged', value: '4 Major' },
    ],
    keyHighlights: [
      'First dedicated business aviation summit in West Africa',
      'Direct dialogue between NCAA regulators and private jet operators',
      'Pioneered non-partisan collaborative industry advocacy',
    ],
  },
  {
    id: 'transformation',
    number: '02',
    period: '2014 – 2022 • The Shift',
    title: 'Policy Advocacy, FBO Standards & Capital Formation',
    subtitle: 'Bridging Infrastructure Gaps & Unlocking Domestic Finance',
    leadParagraph:
      'Over the subsequent decade, NBAC evolved from an annual conference into the definitive policy engine for West African business aviation.',
    detailedBody:
      'Working closely with international aviation safety bodies and the Nigerian Civil Aviation Authority, NBAC championed IS-BAH and IS-BAO safety accreditations across West African FBOs. The conference spearheaded ground-breaking dialogues on custom aircraft financing frameworks, domestic bank debt syndication, import tariff rationalization, and maintenance infrastructure expansion—directly catalyzing modern hangar facilities at MMIA Lagos.',
    icon: TrendingUp,
    image: '/images/sliders/AfRS_NBAC17_Day1_0001.jpg',
    imageAlt: 'NBAC Aviation Infrastructure & FBO Excellence',
    metrics: [
      { label: 'FBO Accreditations', value: 'IS-BAH' },
      { label: 'Capital Discussions', value: '$150M+' },
      { label: 'Policy Roundtables', value: '12+ Editions' },
    ],
    keyHighlights: [
      'Advocated for duty/tax rationalization on aircraft parts',
      'Established annual Aircraft Finance & Leasing Syndication forums',
      'Elevated FBO ground handling standards to global benchmarks',
    ],
  },
  {
    id: 'future',
    number: '03',
    period: '2027 & Beyond • The Next Era',
    title: 'One Sky, Many Stakeholders: Sustainability & Innovation',
    subtitle: 'Pioneering ECOWAS Airspace Integration & AeroLab Startups',
    leadParagraph:
      'As NBAC approaches its landmark 2027 edition under the theme "One Sky, Many Stakeholders," the platform is orchestrating the next era of African aerospace.',
    detailedBody:
      'From advocating for single-window digital flight clearance protocols across ECOWAS airspace to driving Sustainable Aviation Fuel (SAF) readiness and incubating high-impact aviation tech startups through AeroLab, NBAC continues to set the benchmark for forward-looking executive aviation leadership.',
    icon: Rocket,
    image: '/images/sliders/AfRS_NBAC17_Day1_0056.jpg',
    imageAlt: 'NBAC 2027 Visionary Aerospace Future',
    metrics: [
      { label: 'Theme Focus', value: 'One Sky' },
      { label: 'AeroLab Teams', value: '30+ Pitching' },
      { label: 'Target Delegates', value: '300+ Executive' },
    ],
    keyHighlights: [
      'Single-window ECOWAS flight clearance advocacy',
      'AeroLab startup pitch & innovation incubation platform',
      'Sustainable Aviation Fuel (SAF) & Green FBO roadmap',
    ],
  },
]

export function AboutStory() {
  const containerRef = useRef<HTMLElement>(null)
  const [activeChapterId, setActiveChapterId] = useState<string>('catalyst')

  const activeChapter =
    STORY_CHAPTERS.find((ch) => ch.id === activeChapterId) || STORY_CHAPTERS[0]

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          [
            '.story-eyebrow',
            '.story-title',
            '.story-quote-box',
            '.story-tab',
            '.story-content-panel',
          ],
          { opacity: 1, y: 0 }
        )
        return
      }

      gsap.set('.story-eyebrow', { opacity: 0, y: -16 })
      gsap.set('.story-title', { opacity: 0, y: 30 })
      gsap.set('.story-quote-box', { opacity: 0, y: 30, scale: 0.98 })
      gsap.set('.story-tab', { opacity: 0, y: 20 })
      gsap.set('.story-content-panel', { opacity: 0, y: 35 })

      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          once: true,
        },
      })

      tl.to('.story-eyebrow', { opacity: 1, y: 0, duration: 0.6 })
        .to('.story-title', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
        .to(
          '.story-quote-box',
          { opacity: 1, y: 0, scale: 1, duration: 0.9 },
          '-=0.4'
        )
        .to(
          '.story-tab',
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 },
          '-=0.5'
        )
        .to('.story-content-panel', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative py-20 md:py-32 bg-nbac-canvas overflow-hidden border-b border-nbac-border"
    >
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-nbac-emerald/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/3 left-1/5 w-[420px] h-[420px] bg-nbac-gold/5 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <SectionEyebrow className="story-eyebrow">
            Genesis & Leadership
          </SectionEyebrow>

          <h2 className="story-title font-display text-3xl sm:text-4xl lg:text-5xl font-bold text-nbac-text tracking-tight leading-tight">
            The <span className="text-nbac-emerald">NBAC Story</span>
          </h2>

          <p className="font-sans text-base sm:text-lg font-light text-nbac-body leading-relaxed pt-1">
            Over a decade of bringing visionary clarity, policy alignment, and infrastructure transformation to West African executive aviation.
          </p>
        </div>

        {/* ── Executive Founder Quote Box ──────────────────────────── */}
        <div className="story-quote-box relative mb-16 p-8 md:p-10 rounded-2xl bg-linear-to-br from-nbac-surface/90 via-nbac-surface/60 to-nbac-emerald/[0.03] border border-nbac-border/80 shadow-2xl backdrop-blur-md overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-nbac-gold via-nbac-emerald to-nbac-gold" />
          <Quote
            size={120}
            className="absolute -bottom-6 -right-6 text-nbac-emerald/[0.04] group-hover:text-nbac-emerald/[0.08] transition-colors duration-500 pointer-events-none"
          />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-nbac-emerald/10 border border-nbac-emerald/30 flex items-center justify-center text-nbac-emerald shrink-0 shadow-lg shadow-nbac-emerald/10">
              <Award size={28} />
            </div>

            <div className="space-y-3">
              <p className="font-display text-lg sm:text-xl md:text-2xl font-medium text-white italic leading-relaxed">
                &ldquo;Before NBAC, business aviation in West Africa was treated as a luxury privilege rather than what it truly is: an indispensable catalyst for corporate productivity, trade, and economic mobility.&rdquo;
              </p>
              <div className="flex items-center gap-3 pt-1">
                <span className="font-sans font-bold text-sm text-nbac-gold-light tracking-wide">
                  EAN Aviation Limited
                </span>
                <span className="text-nbac-muted">•</span>
                <span className="font-sans text-xs text-nbac-muted uppercase tracking-widest">
                  Founders & Organizers of NBAC
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Interactive Chapter Navigation Tabs ──────────────────── */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          {STORY_CHAPTERS.map((chapter) => {
            const isActive = chapter.id === activeChapterId
            const Icon = chapter.icon
            return (
              <button
                key={chapter.id}
                onClick={() => setActiveChapterId(chapter.id)}
                className={`story-tab relative inline-flex items-center gap-2.5 px-5 py-3 rounded-full font-sans text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer select-none border ${
                  isActive
                    ? 'bg-nbac-emerald text-black border-nbac-emerald shadow-lg shadow-nbac-emerald/25 scale-[1.02]'
                    : 'bg-nbac-surface/80 text-nbac-muted hover:text-white border-nbac-border hover:border-nbac-emerald/40'
                }`}
              >
                <Icon size={16} />
                <span>{chapter.period}</span>
                {isActive && (
                  <motion.span
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-nbac-gold rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* ── Active Chapter Display Panel ────────────────────────── */}
        <div className="story-content-panel min-h-[480px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeChapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center bg-nbac-surface/40 border border-nbac-border/80 rounded-2xl p-6 sm:p-8 lg:p-12 shadow-2xl backdrop-blur-md"
            >
              {/* Left Side: Chapter Text Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nbac-emerald/10 border border-nbac-emerald/30 text-nbac-emerald text-xs font-mono font-bold tracking-wider">
                    <Layers size={13} />
                    <span>CHAPTER {activeChapter.number}</span>
                  </div>

                  <h3 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold text-nbac-text tracking-tight leading-snug">
                    {activeChapter.title}
                  </h3>

                  <p className="font-sans text-xs sm:text-sm uppercase tracking-widest font-semibold text-nbac-gold-light">
                    {activeChapter.subtitle}
                  </p>
                </div>

                <div className="space-y-4 font-sans text-sm sm:text-base font-light text-nbac-body leading-relaxed">
                  <p className="font-normal text-nbac-text/90">
                    {activeChapter.leadParagraph}
                  </p>
                  <p className="text-nbac-muted">
                    {activeChapter.detailedBody}
                  </p>
                </div>

                {/* Key Accomplishments Checklist */}
                <div className="pt-2 space-y-2.5">
                  <span className="font-sans text-[11px] uppercase tracking-widest font-bold text-nbac-muted block">
                    Milestone Accomplishments
                  </span>
                  <div className="space-y-2">
                    {activeChapter.keyHighlights.map((highlight) => (
                      <div
                        key={highlight}
                        className="flex items-start gap-2.5 text-xs sm:text-sm font-sans text-nbac-text"
                      >
                        <CheckCircle2
                          size={16}
                          className="text-nbac-emerald shrink-0 mt-0.5"
                        />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chapter Metrics Pills */}
                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-nbac-border/60">
                  {activeChapter.metrics.map((m) => (
                    <div
                      key={m.label}
                      className="p-3 rounded-xl bg-nbac-canvas/80 border border-nbac-border text-center"
                    >
                      <div className="font-display text-lg sm:text-xl font-bold text-nbac-emerald">
                        {m.value}
                      </div>
                      <div className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted mt-0.5">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Chapter Showcase Image */}
              <div className="lg:col-span-5 relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-nbac-border shadow-2xl group">
                  <Image
                    src={activeChapter.image}
                    alt={activeChapter.imageAlt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    quality={90}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />

                  <div className="absolute bottom-4 left-4 right-4 p-3 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                    <span className="font-sans text-xs text-white/90 font-medium">
                      {activeChapter.period}
                    </span>
                    <Sparkles size={16} className="text-nbac-gold" />
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
