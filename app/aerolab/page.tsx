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
  Users2
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
        gsap.set(['.hero-eyebrow', '.hero-title', '.hero-subtitle', '.hero-desc', '.hero-cta', '.track-card', '.participate-card', '.prize-card'], {
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tracks.map((track) => {
                const IconComponent = track.icon
                return (
                  <motion.div
                    key={track.id}
                    whileHover={{ y: -6, borderColor: 'var(--nbac-gold)' }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                    className="track-card opacity-0 flex flex-col bg-nbac-panel/40 border border-nbac-border/80 rounded-xl overflow-hidden glass-card p-6 md:p-8"
                    style={{
                      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-lg bg-linear-to-br ${track.color} shrink-0`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-nbac-gold px-2.5 py-1 bg-nbac-gold/5 border border-nbac-gold/10 rounded-full">
                        Track {track.id}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
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
                    <span className="font-display text-3xl md:text-4xl font-extrabold text-nbac-text">₦1,500,000</span>
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
                {/* Popular Badge */}
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
                    <span className="font-display text-4xl md:text-5xl font-extrabold text-nbac-text">₦5,000,000</span>
                    <span className="text-xs font-sans text-nbac-muted font-medium block mt-1">(or USD equivalent)</span>
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
