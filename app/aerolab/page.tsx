'use client'

import { useRef } from 'react'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionBlur } from "@/components/shared/section-blur"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion } from 'framer-motion'
import { 
  Plane, 
  Coins, 
  Leaf, 
  Sparkles, 
  Compass, 
  Trophy, 
  Award, 
  Users, 
  Check, 
  ArrowRight,
  Flame,
  Cpu,
  GraduationCap,
  Users2,
  CheckCircle2,
  Activity,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

export default function AeroLabPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(['.hero-eyebrow', '.hero-title', '.hero-subtitle', '.hero-desc', '.hero-cta', '.track-card', '.participate-card', '.timeline-step', '.criteria-card', '.prize-card'], {
          opacity: 1,
          y: 0,
          scale: 1
        })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo('.hero-eyebrow',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )

      tl.fromTo('.hero-title',
        { opacity: 0, y: 40, rotateX: 6 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1 },
        '-=0.6'
      )

      tl.fromTo('.hero-subtitle',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.7'
      )

      tl.fromTo('.hero-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.7'
      )

      tl.fromTo('.hero-cta',
        { opacity: 0, y: 15, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8 },
        '-=0.6'
      )

      // Scroll trigger for Tracks
      gsap.fromTo('.track-card',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.tracks-section',
            start: 'top 85%',
          }
        }
      )

      // Scroll trigger for Eligibility
      gsap.fromTo('.participate-card',
        { opacity: 0, scale: 0.95 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.eligibility-section',
            start: 'top 85%',
          }
        }
      )

      // Scroll trigger for Timeline
      gsap.fromTo('.timeline-progress-line',
        { width: '0%' },
        {
          width: '90%',
          ease: 'none',
          scrollTrigger: {
            trigger: '.timeline-section',
            start: 'top 70%',
            end: 'bottom 60%',
            scrub: true
          }
        }
      )

      gsap.fromTo('.timeline-step',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.timeline-section',
            start: 'top 75%',
          }
        }
      )

      // Scroll trigger for Judging Criteria
      gsap.fromTo('.criteria-card',
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.criteria-section',
            start: 'top 80%',
          }
        }
      )

      // Scroll trigger for Prizes
      gsap.fromTo('.prize-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.prizes-section',
            start: 'top 85%',
          }
        }
      )
    },
    { scope: containerRef }
  )

  const tracks = [
    {
      id: 1,
      title: "The Clearance Problem",
      obj: "OBJ 03: Regulatory",
      desc: "Build a solution that reduces flight clearance and overflight permit processing time for Nigerian and West African operators.",
      icon: Plane,
      color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400"
    },
    {
      id: 2,
      title: "Money in the Air",
      obj: "OBJ 02: Finance",
      desc: "Design a financing or leasing product, platform, or model that makes aircraft acquisition more accessible within the current FX and regulatory environment.",
      icon: Coins,
      color: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400"
    },
    {
      id: 3,
      title: "The Green FBO",
      obj: "OBJ 05: Ecosystem",
      desc: "Propose a practical, costed sustainability plan for a Nigerian FBO — covering energy, ground equipment, waste, fuel efficiency, and carbon tracking.",
      icon: Leaf,
      color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400"
    },
    {
      id: 4,
      title: "Fly Her Forward",
      obj: "OBJ 06 / Women in Aviation",
      desc: "Build a platform, programme, or tool that measurably improves the recruitment, training, retention, or visibility of women in Nigerian aviation.",
      icon: Sparkles,
      color: "from-pink-500/10 to-purple-500/10 border-pink-500/20 text-pink-400"
    },
    {
      id: 5,
      title: "The Charter Experience",
      obj: "OBJ 07: Innovation",
      desc: "Design a digital product that improves the end-to-end charter booking, dispatch, or inflight experience for Nigerian business aviation clients.",
      icon: Compass,
      color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400"
    }
  ]

  const eligibility = [
    {
      title: "Aviation Tech Startups",
      desc: "Early-stage companies looking to disrupt business aviation operations, scheduling, passenger experience, or aviation finance in Africa.",
      icon: Cpu
    },
    {
      title: "Students & Graduates",
      desc: "University students or recent graduates in computer science, software engineering, aerospace sciences, data analytics, or business administration.",
      icon: GraduationCap
    },
    {
      title: "Aviation Professionals",
      desc: "Pilots, dispatchers, FBO representatives, charter brokers, or safety officers with industry experience and a practical idea.",
      icon: Plane
    },
    {
      title: "Cross-Functional Teams",
      desc: "Teams of 3 to 6 members combining technical builders (devs, designers) with domain experts to build holistic solutions.",
      icon: Users2
    }
  ]

  const timelineSteps = [
    {
      phase: "8 Weeks Before",
      title: "Applications Open",
      desc: "Online application goes live. Teams submit a one-page concept note covering the problem, approach and team composition."
    },
    {
      phase: "6 Weeks Before",
      title: "Teams Selected",
      desc: "Up to 30 teams selected across all five tracks. Each team receives a briefing pack and is assigned an industry mentor."
    },
    {
      phase: "4 Weeks Before",
      title: "Mentor Sessions",
      desc: "Two virtual sessions per team with an assigned industry mentor drawn from the NBAC steering committee and speaker pool."
    },
    {
      phase: "1 Week Before",
      title: "Submissions Due",
      desc: "Working prototype or solution deck submitted. Up to 10 finalists selected — a maximum of 2 per track."
    },
    {
      phase: "Conference Day 1",
      title: "Finalist Showcase",
      desc: "Finalists given dedicated exhibition space. Delegates visit during luncheon and coffee breaks for live demos and pitches."
    },
    {
      phase: "Conference Day 2",
      title: "Final Pitches & Awards",
      desc: "10 finalists deliver 5-minute pitches to the full conference. Winners announced and celebrated at the Gala Dinner."
    }
  ]

  const judgingCriteria = [
    {
      percentage: "25%",
      title: "Relevance",
      desc: "Does it directly address a real and current problem in Nigerian or African business aviation?"
    },
    {
      percentage: "25%",
      title: "Feasibility",
      desc: "Can it realistically be built, funded and deployed within the Nigerian context?"
    },
    {
      percentage: "20%",
      title: "Innovation",
      desc: "Does it bring a genuinely new approach, or meaningfully improve on what already exists?"
    },
    {
      percentage: "20%",
      title: "Impact",
      desc: "If adopted, what is the scale and depth of change it would create?"
    },
    {
      percentage: "10%",
      title: "Presentation",
      desc: "Is the pitch clear, confident and compelling to a non-technical audience?"
    }
  ]

  return (
    <>
      <Navbar />

      <main 
        ref={containerRef}
        className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 overflow-hidden relative"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-linear-to-b from-nbac-gold/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-[400px] h-[400px] bg-nbac-emerald/5 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <section className="relative z-10 px-6 md:px-24 max-w-7xl mx-auto text-center py-16 md:py-24">
          <div className="hero-eyebrow opacity-0">
            <SectionEyebrow className="text-center justify-center">
              NBAC 2027 INNOVATION CHALLENGE
            </SectionEyebrow>
          </div>
          
          <h1 className="hero-title opacity-0 font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-2">
            AeroLab
          </h1>

          <h2 className="hero-subtitle opacity-0 font-display text-xl md:text-3xl italic font-semibold text-transparent bg-clip-text bg-linear-to-r from-nbac-gold to-nbac-gold-light tracking-wide mb-8">
            Innovate. Build. Fly.
          </h2>
          
          <div className="hero-desc opacity-0 max-w-3xl mx-auto mb-10">
            <p className="font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed mb-6">
              AeroLab is a live aviation technology hackathon running as a parallel track to the main conference. Participants work on real problems facing Nigerian and African business aviation over a compressed timeline — and winners are announced and celebrated during the conference itself.
            </p>
            <p className="font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed">
              NBAC 2027 is not just a conversation about the future of aviation. It is a place where that future is actively being built. AeroLab transforms the conference from a forum into a launchpad.
            </p>
          </div>

          <div className="hero-cta opacity-0 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/reservations"
              className="bg-linear-to-r from-nbac-gold to-nbac-gold-dark hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 shadow-[0_4px_15px_rgba(197,160,89,0.25)] hover:scale-105"
            >
              Apply to Participate
            </Link>
            <a 
              href="#tracks" 
              className="flex items-center gap-2 border border-nbac-border hover:border-nbac-gold/30 bg-nbac-panel/30 hover:bg-nbac-panel/50 text-nbac-text font-sans font-medium px-8 py-3.5 rounded-full text-xs uppercase tracking-widest transition-all duration-300 backdrop-blur-sm"
            >
              <span>Explore Tracks</span>
              <ArrowRight size={14} className="text-nbac-gold" />
            </a>
          </div>
        </section>

        {/* Challenge Tracks Section */}
        <SectionBlur>
          <section id="tracks" className="tracks-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
            <div className="text-center mb-16">
              <SectionEyebrow className="text-center justify-center">THE COMPETITION</SectionEyebrow>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Challenge Tracks</h2>
              <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4">
                Five tailored research and building challenges focusing on key components of the Nigerian and West African aviation growth strategy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {tracks.map((track) => {
                const IconComponent = track.icon
                
                // Determine responsive spans for the bento layout
                let spanClass = "col-span-1"
                if (track.id === 1) {
                  spanClass = "lg:col-span-2 md:col-span-2 col-span-1"
                } else if (track.id === 2) {
                  spanClass = "lg:col-span-1 lg:row-span-2 md:col-span-1 col-span-1"
                } else if (track.id === 5) {
                  spanClass = "lg:col-span-3 md:col-span-2 col-span-1"
                }

                // Determine flex direction for wide cards on desktop
                const isWide = track.id === 1 || track.id === 5

                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ y: -6, borderColor: 'var(--nbac-gold)' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className={`track-card opacity-0 flex flex-col ${
                      isWide ? "lg:flex-row lg:items-stretch" : ""
                    } bg-nbac-panel/40 border border-nbac-border/80 rounded-2xl overflow-hidden glass-card p-6 md:p-8 justify-between gap-6 md:gap-8 ${spanClass}`}
                    style={{
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <div className="flex-1 flex flex-col h-full justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div className={`p-3 rounded-lg bg-linear-to-br ${track.color} shrink-0`}>
                            <IconComponent className="w-6 h-6" />
                          </div>
                          <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-nbac-gold px-2.5 py-1 bg-nbac-gold/5 border border-nbac-gold/10 rounded-full">
                            Track {track.id}
                          </span>
                        </div>

                        <div>
                          <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-nbac-emerald mb-2 block">
                            {track.obj}
                          </span>
                          <h3 className="font-sans text-lg md:text-xl font-bold text-nbac-text mb-4 leading-tight">
                            {track.title}
                          </h3>
                          <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
                            {track.desc}
                          </p>
                        </div>
                      </div>

                      {/* Small widgets inline for smaller layouts */}
                      {track.id === 3 && (
                        <div className="mt-6 flex flex-wrap gap-2 pt-2 border-t border-nbac-border/40">
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-medium font-sans flex items-center gap-1">
                            <span>⚡</span> Solar Array (80kW)
                          </span>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-medium font-sans flex items-center gap-1">
                            <span>♻️</span> SAF Off-take
                          </span>
                          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-medium font-sans flex items-center gap-1">
                            <span>🔋</span> Off-Grid HVAC
                          </span>
                        </div>
                      )}

                      {track.id === 4 && (
                        <div className="mt-6 pt-3 flex items-center justify-between border-t border-nbac-border/40">
                          <div className="flex -space-x-1.5 overflow-hidden">
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0b0f10] bg-nbac-gold text-[#0b0f10] text-[9px] font-bold font-sans flex items-center justify-center">
                              FD
                            </div>
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0b0f10] bg-nbac-gold-light text-[#0b0f10] text-[9px] font-bold font-sans flex items-center justify-center">
                              AO
                            </div>
                            <div className="inline-block h-6 w-6 rounded-full ring-2 ring-[#0b0f10] bg-[#8a5cf5] text-white text-[9px] font-bold font-sans flex items-center justify-center">
                              CN
                            </div>
                          </div>
                          <span className="text-[9px] font-bold text-nbac-gold font-sans bg-nbac-gold/10 px-2 py-0.5 rounded border border-nbac-gold/25">
                            +35% representation
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Right / Bottom custom widgets for larger layouts */}
                    {track.id === 1 && (
                      <div className="w-full lg:w-[280px] bg-[#0b0f10]/60 border border-nbac-border/60 rounded-xl p-4 flex flex-col justify-between font-sans text-xs shrink-0 self-center">
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold text-nbac-text uppercase tracking-wider text-[9px]">Permit Request</span>
                          <span className="text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider">
                            Approved
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-nbac-emerald" />
                            <span className="text-nbac-body text-[11px]">NCAA Flight Permit</span>
                            <span className="ml-auto text-nbac-muted text-[10px]">1m ago</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-nbac-emerald" />
                            <span className="text-nbac-body text-[11px]">NAMA Flight Plan</span>
                            <span className="ml-auto text-nbac-muted text-[10px]">2m ago</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-nbac-emerald" />
                            <span className="text-nbac-body text-[11px]">Customs Pre-Clearance</span>
                            <span className="ml-auto text-nbac-muted text-[10px]">4m ago</span>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-nbac-border/60 flex items-center justify-between text-[10px]">
                          <span className="text-nbac-muted font-medium">Processing Time</span>
                          <span className="text-nbac-emerald-light font-bold flex items-center gap-1">
                            <Activity className="w-3 h-3 animate-pulse" /> 4.8 Minutes
                          </span>
                        </div>
                      </div>
                    )}

                    {track.id === 2 && (
                      <div className="w-full bg-[#0b0f10]/60 border border-nbac-border/60 rounded-xl p-4 font-sans text-xs space-y-3 mt-6">
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-wider text-nbac-muted border-b border-nbac-border/60 pb-1.5 font-bold">
                          <span>Lease Term Sheet</span>
                          <span className="text-nbac-emerald-light">Proposed</span>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-nbac-body">Asset Value</span>
                            <span className="text-nbac-text font-medium">$12,500,000</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-nbac-body">LTV Limit</span>
                            <span className="text-nbac-text font-medium">75% Max</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-nbac-body">FX Hedge Rate</span>
                            <span className="text-nbac-emerald font-semibold">FX Collar Cap</span>
                          </div>
                          <div className="flex justify-between text-[11px]">
                            <span className="text-nbac-body">Amortization</span>
                            <span className="text-nbac-text font-medium">15 Years</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-nbac-border/60 flex items-center justify-between text-[10px] text-nbac-muted">
                          <span>Acquisition Access</span>
                          <span className="text-nbac-emerald font-bold flex items-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5 text-nbac-emerald" /> +45% YoY
                          </span>
                        </div>
                      </div>
                    )}

                    {track.id === 5 && (
                      <div className="w-full lg:w-[350px] bg-[#0b0f10]/60 border border-nbac-border/60 rounded-xl p-4 font-sans text-xs shrink-0 self-center">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-nbac-border/60">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-nbac-gold animate-pulse" />
                            <span className="font-bold text-nbac-text text-[9px] uppercase tracking-wider">Flight Dispatcher</span>
                          </div>
                          <span className="text-nbac-muted text-[9px] uppercase tracking-widest font-semibold">LOS ➔ ABV</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-[#0b0f10]/80 border border-nbac-border/40 rounded p-1.5 text-left">
                            <span className="text-[9px] text-nbac-muted uppercase block">Origin</span>
                            <span className="text-nbac-text font-bold text-[11px] block">Lagos (LOS)</span>
                          </div>
                          <div className="bg-[#0b0f10]/80 border border-nbac-border/40 rounded p-1.5 text-left">
                            <span className="text-[9px] text-nbac-muted uppercase block">Destination</span>
                            <span className="text-nbac-text font-bold text-[11px] block">Abuja (ABV)</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] bg-[#0b0f10]/50 border border-nbac-border/40 rounded p-2 mb-3">
                          <span className="text-nbac-body">Aircraft: <strong className="text-nbac-text font-semibold">Challenger 605</strong></span>
                          <span className="text-nbac-emerald font-bold">$18,500 Est.</span>
                        </div>

                        <div className="w-full py-2 bg-nbac-emerald hover:bg-nbac-emerald-dark text-white rounded text-center font-bold text-[9px] uppercase tracking-widest transition-colors cursor-pointer">
                          Confirm Reservation
                        </div>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </section>
        </SectionBlur>

        {/* Who Can Participate & Eligibility */}
        <SectionBlur>
          <section className="eligibility-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
            <div className="text-center mb-16">
              <SectionEyebrow className="text-center justify-center">COLLABORATION</SectionEyebrow>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Who Can Participate</h2>
              <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4">
                AeroLab is designed to bring diverse minds together to shape actionable products. We invite participants from across the technological and operational spectrum.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
              {eligibility.map((item, idx) => {
                const ItemIcon = item.icon
                return (
                  <div 
                    key={idx}
                    className="participate-card opacity-0 bg-nbac-panel/30 border border-nbac-border/60 hover:border-nbac-border rounded-xl p-6 md:p-8 flex items-start gap-5 transition-colors duration-300"
                  >
                    <div className="p-3 rounded-lg bg-nbac-gold/5 border border-nbac-gold/15 text-nbac-gold shrink-0">
                      <ItemIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-sans text-base md:text-lg font-bold text-nbac-text mb-2">{item.title}</h3>
                      <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Special Callout: Collaboration rule */}
            <div className="participate-card opacity-0 bg-linear-to-r from-nbac-gold/5 via-nbac-gold/10 to-transparent border border-nbac-gold/25 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-5 max-w-4xl mx-auto">
              <div className="p-4 rounded-full bg-nbac-gold/10 border border-nbac-gold/20 text-nbac-gold shrink-0">
                <Users className="w-8 h-8" />
              </div>
              <div className="text-center md:text-left">
                <h4 className="font-sans text-base font-bold text-nbac-gold-light mb-1">Collaboration Is Required</h4>
                <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
                  Solo entries are not accepted. Teams must consist of <strong>3 to 6 members</strong>. Since collaboration is a core judging criterion, cross-functional teams combining developers, designers, and aviation experts are highly recommended.
                </p>
              </div>
            </div>
          </section>
        </SectionBlur>

        {/* Hackathon Timeline Section */}
        <SectionBlur>
          <section className="timeline-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
            <div className="text-center mb-16">
              <SectionEyebrow className="text-center justify-center">THE JOURNEY</SectionEyebrow>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Hackathon <span className="italic text-nbac-emerald font-semibold">Timeline</span>
              </h2>
              <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4 font-serif italic">
                From application to award ceremony — an 8-week journey
              </p>
            </div>

            {/* Desktop Horizontal Timeline */}
            <div className="hidden lg:block relative py-12 mt-10">
              {/* Horizontal line running across the center */}
              <div className="absolute top-1/2 left-[5%] right-[5%] h-0.5 bg-nbac-border -translate-y-1/2" />
              <div className="absolute top-1/2 left-[5%] h-0.5 bg-nbac-emerald -translate-y-1/2 timeline-progress-line" style={{ width: '0%', maxWidth: '90%' }} />

              <div className="grid grid-cols-6 gap-6 relative">
                {timelineSteps.map((step, idx) => {
                  const isTop = idx % 2 === 0;
                  return (
                    <div key={idx} className="timeline-step opacity-0 flex flex-col items-center relative">
                      {/* Top Card Box */}
                      {isTop ? (
                        <div className="h-44 flex flex-col justify-end w-full mb-6">
                          <div className="bg-nbac-panel/40 border border-nbac-emerald/30 hover:border-nbac-emerald/60 p-5 rounded-lg glass-card text-left transition-colors duration-300">
                            <h4 className="font-sans font-bold text-sm text-nbac-text mb-2">{step.title}</h4>
                            <p className="font-sans font-light text-xs text-nbac-body leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44" />
                      )}

                      {/* Dot, Connectors, Phase Labels */}
                      <div className="relative z-10 flex flex-col items-center">
                        {isTop ? (
                          <>
                            {/* Phase Label below the card, above the line */}
                            <span className="font-sans text-[10px] font-bold text-nbac-emerald uppercase tracking-wider mb-2">
                              {step.phase}
                            </span>
                            {/* Vertical Line going down to the dot */}
                            <div className="w-px h-6 bg-nbac-emerald/40" />
                          </>
                        ) : null}

                        {/* Outer Dot */}
                        <div className="w-5 h-5 rounded-full bg-[#101415] border-2 border-nbac-emerald flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                          {/* Inner Dot */}
                          <div className="w-2 h-2 rounded-full bg-nbac-emerald" />
                        </div>

                        {!isTop ? (
                          <>
                            {/* Vertical Line going down to the card */}
                            <div className="w-px h-6 bg-nbac-emerald/40" />
                            {/* Phase Label above the card, below the line */}
                            <span className="font-sans text-[10px] font-bold text-nbac-emerald uppercase tracking-wider mt-2">
                              {step.phase}
                            </span>
                          </>
                        ) : null}
                      </div>

                      {/* Bottom Card Box */}
                      {!isTop ? (
                        <div className="h-44 flex flex-col justify-start w-full mt-6">
                          <div className="bg-nbac-panel/40 border border-nbac-emerald/30 hover:border-nbac-emerald/60 p-5 rounded-lg glass-card text-left transition-colors duration-300">
                            <h4 className="font-sans font-bold text-sm text-nbac-text mb-2">{step.title}</h4>
                            <p className="font-sans font-light text-xs text-nbac-body leading-relaxed">{step.desc}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Vertical Timeline */}
            <div className="lg:hidden relative pl-6 mt-10">
              {/* Vertical line track */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-nbac-border" />
              
              <div className="space-y-8">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="timeline-step opacity-0 relative flex items-start gap-6">
                    {/* Node Dot */}
                    <div className="absolute left-[-21px] top-1.5 w-5 h-5 rounded-full bg-[#101415] border-2 border-nbac-emerald flex items-center justify-center z-10 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                      <div className="w-2 h-2 rounded-full bg-nbac-emerald" />
                    </div>

                    <div className="flex-1">
                      <span className="font-sans text-[10px] font-bold text-nbac-emerald uppercase tracking-wider block mb-1">
                        {step.phase}
                      </span>
                      <div className="bg-nbac-panel/40 border border-nbac-emerald/30 p-5 rounded-lg glass-card text-left">
                        <h4 className="font-sans font-bold text-sm text-nbac-text mb-2">{step.title}</h4>
                        <p className="font-sans font-light text-xs text-nbac-body leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </SectionBlur>

        {/* Judging Criteria Section */}
        <SectionBlur>
          <section className="criteria-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
            <div className="text-center mb-16">
              <SectionEyebrow className="text-center justify-center">EVALUATION</SectionEyebrow>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Judging <span className="italic text-nbac-emerald font-semibold">Criteria</span>
              </h2>
              <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4 font-serif italic">
                Five dimensions, independently scored by a panel of five industry judges
              </p>
            </div>

            {/* Grid layout for 5 cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
              {judgingCriteria.map((item, idx) => (
                <div key={idx} className="criteria-card opacity-0 flex flex-col group">
                  {/* Green Percentage Box */}
                  <div className="bg-nbac-emerald text-white py-4 rounded-t-xl text-center font-display text-2xl font-bold tracking-tight shadow-md z-10 relative">
                    {item.percentage}
                  </div>

                  {/* Criteria details card */}
                  <div className="flex-1 bg-nbac-panel/40 border border-nbac-emerald/30 group-hover:border-nbac-emerald/60 p-6 rounded-b-xl glass-card text-center flex flex-col justify-start transition-all duration-300 pt-8 -mt-2">
                    <h3 className="font-sans text-base font-bold text-nbac-text mb-3 tracking-wide">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs font-light text-nbac-body leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Judges Footer Note */}
            <div className="text-center mt-12">
              <p className="font-sans text-[11px] md:text-xs font-light text-nbac-muted font-serif italic leading-relaxed">
                Judges: NCAA/FAAN representative • Active Nigerian operator • Tech/startup investor • OEM or MRO representative • NBAC steering committee member
              </p>
            </div>
          </section>
        </SectionBlur>

        {/* Prizes Section */}
        <SectionBlur>
          <section className="prizes-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
            <div className="text-center mb-16">
              <SectionEyebrow className="text-center justify-center">AWARDS & INCENTIVES</SectionEyebrow>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">The Prizes</h2>
              <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4">
                Compete for significant funding, industry mentorship, and unmatched executive-level networking opportunities.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
              {/* Track Winners */}
              <div 
                className="prize-card opacity-0 flex flex-col justify-between bg-nbac-panel/40 border border-nbac-border rounded-2xl p-8 glass-card order-2 lg:order-1 lg:translate-y-4"
                style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-lg bg-nbac-emerald/10 text-nbac-emerald border border-nbac-emerald/20">
                      <Award className="w-5 h-5" />
                    </div>
                    <span className="font-sans text-xs uppercase tracking-wider text-nbac-emerald font-semibold">Track Winners (×5)</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="font-display text-3xl md:text-4xl font-extrabold text-nbac-text">$1,000</span>
                    <span className="text-sm font-sans text-nbac-muted font-medium ml-1">each</span>
                  </div>

                  <p className="font-sans text-sm font-light text-nbac-body leading-relaxed mb-6">
                    Awarded to the top solutions across each of the five individual competition tracks.
                  </p>
                </div>

                <div className="pt-6 border-t border-nbac-border/60">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted font-bold block mb-4">INCLUDES:</span>
                  <ul className="flex flex-col gap-3">
                    {[
                      "Official certificate and track trophy",
                      "Inclusion in the NBAC 2027 post-event report",
                      "Introductions to relevant industry stakeholders",
                      "Matchmaking with potential implementation partners"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-light text-nbac-body">
                        <Check className="w-4 h-4 text-nbac-emerald shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Best In Show */}
              <div 
                className="prize-card opacity-0 flex flex-col justify-between bg-nbac-panel/85 border-2 border-nbac-gold rounded-2xl p-8 relative glass-card order-1 lg:order-2 scale-100 lg:scale-[1.04]"
                style={{ 
                  boxShadow: '0 20px 50px rgba(197, 160, 89, 0.15)',
                  borderColor: '#c5a059'
                }}
              >
                {/* Grand Prize Badge */}
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-nbac-gold to-nbac-gold-dark text-[#0b0f10] font-sans font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                  GRAND PRIZE
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-lg bg-nbac-gold/15 text-nbac-gold border border-nbac-gold/20">
                      <Trophy className="w-5 h-5 animate-pulse" />
                    </div>
                    <span className="font-sans text-xs uppercase tracking-wider text-nbac-gold font-bold">Overall Winner — Best in Show</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="font-display text-4xl md:text-5xl font-extrabold text-nbac-text">$3,500</span>
                  </div>

                  <p className="font-sans text-sm font-light text-nbac-body leading-relaxed mb-6">
                    The highest honor. Awarded to the ultimate solution demonstrating the highest degree of innovation, technical viability, and market impact.
                  </p>
                </div>

                <div className="pt-6 border-t border-nbac-border/60">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-gold font-bold block mb-4">INCLUDES:</span>
                  <ul className="flex flex-col gap-3">
                    {[
                      "Formal presentation to steering committee & regulators",
                      "Feature in the official NBAC 2027 White Paper",
                      "One-year industry mentorship & guidance",
                      "Free exhibition space at NBAC 2029",
                      "Full Gala Dinner award media spotlight"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-light text-nbac-body">
                        <Check className="w-4 h-4 text-nbac-gold shrink-0 mt-0.5" />
                        <span className="font-medium text-nbac-text">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* People's Choice */}
              <div 
                className="prize-card opacity-0 flex flex-col justify-between bg-nbac-panel/40 border border-nbac-border rounded-2xl p-8 glass-card order-3 lg:order-3 lg:translate-y-4"
                style={{ boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)' }}
              >
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Flame className="w-5 h-5" />
                    </div>
                    <span className="font-sans text-xs uppercase tracking-wider text-amber-400 font-semibold">People&apos;s Choice Award</span>
                  </div>
                  
                  <div className="mb-6">
                    <span className="font-display text-3xl md:text-4xl font-extrabold text-nbac-text">Sponsor Gift</span>
                    <span className="text-xs font-sans text-nbac-muted block mt-1">High-value sponsor package</span>
                  </div>

                  <p className="font-sans text-sm font-light text-nbac-body leading-relaxed mb-6">
                    Voted live by conference delegates during Day 2. Highlights the solution that resonated most with the conference floor.
                  </p>
                </div>

                <div className="pt-6 border-t border-nbac-border/60">
                  <span className="font-sans text-[10px] uppercase tracking-wider text-nbac-muted font-bold block mb-4">DETAILS:</span>
                  <ul className="flex flex-col gap-3">
                    {[
                      "Delegates vote live via conference web app on Day 2",
                      "Winner receives a high-value physical or service package provided by the NBAC Title Sponsor",
                      "Live announcement on the main ballroom stage"
                    ].map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs font-light text-nbac-body">
                        <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </SectionBlur>
      </main>

      <Footer />
    </>
  )
}
