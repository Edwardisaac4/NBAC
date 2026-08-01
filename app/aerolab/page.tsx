'use client'

import { useRef, useState } from 'react'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { motion, AnimatePresence } from 'framer-motion'
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
  Target,
  FileCode2,
  X,
  ChevronRight,
  ChevronLeft,
  Calendar
} from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)

const TRACKS = [
  {
    id: 1,
    title: "The Clearance Problem",
    obj: "OBJ 01: Regulatory",
    desc: "Streamline overflight permits, landing approvals, and multi-agency clearance workflows across Nigerian and West African airspace.",
    icon: Plane,
    color: "from-blue-500/10 to-indigo-500/10 border-blue-500/20 text-blue-400",
    targetImpact: "Sub-15 Min Clearance Workflows",
    deliverable: "Workflow Prototype or Regulatory API",
  },
  {
    id: 2,
    title: "Money in the Air",
    obj: "OBJ 02: Finance",
    desc: "Develop innovative financial structures, risk mitigation mechanisms, or leasing models to unlock capital and ease aircraft acquisition.",
    icon: Coins,
    color: "from-amber-500/10 to-yellow-500/10 border-amber-500/20 text-amber-400",
    targetImpact: "De-Risked African Aviation Leasing",
    deliverable: "Financial Model & Structuring Proposal",
  },
  {
    id: 3,
    title: "The Green FBO",
    obj: "OBJ 03: Ecosystem",
    desc: "Architect a practical, costed decarbonization roadmap for Nigerian FBOs — covering renewable energy, GSE electrification, and SAF off-take.",
    icon: Leaf,
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-400",
    targetImpact: "Net-Zero FBO Operations Roadmap",
    deliverable: "Costed Sustainability Plan & Tech Stack",
  },
  {
    id: 4,
    title: "Fly Her Forward",
    obj: "OBJ 04 / Women in Aviation",
    desc: "Create a platform, mentorship engine, or career development framework that accelerates recruitment, retention, and leadership of women.",
    icon: Sparkles,
    color: "from-pink-500/10 to-purple-500/10 border-pink-500/20 text-pink-400",
    targetImpact: "Measurable Leadership & Technical Equity",
    deliverable: "Platform Concept or Program Framework",
  },
  {
    id: 5,
    title: "The Charter Experience",
    obj: "OBJ 05: Innovation",
    desc: "Reimagine the digital journey for business aviation clients — from instant charter discovery and transparent pricing to flight dispatch.",
    icon: Compass,
    color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20 text-cyan-400",
    targetImpact: "Frictionless Charter Booking & Dispatch",
    deliverable: "Digital Product Prototype & Dispatch Flow",
  }
]

const ELIGIBILITY = [
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

const TIMELINE_STEPS = [
  {
    id: 1,
    title: "Applications Open",
    category: "Phase 01 — Submission",
    duration: "Window: 3 Weeks",
    status: "Open for Entries",
    desc: "Online application goes live. Teams submit a concept note covering their problem statement, technical approach, and team composition.",
    detailedOverview: "The official call for participation goes live across all 5 AeroLab Innovation Challenge Tracks. Builders, engineers, students, and aviation professionals submit a 1-page concept note outlining their proposed solution to a key West African business aviation challenge.",
    keyDeliverables: [
      "1-Page Concept Note (Problem statement & proposed solution architecture)",
      "Team Roster (3 to 6 members combining technical builders & domain experts)",
      "Track Selection & Target Impact Statement"
    ],
    supportProvided: [
      "Public AeroLab Briefing Pack & Problem Statement Deck",
      "Open Q&A webinars with Steering Committee technical leads",
      "Team formation channel & community matching"
    ]
  },
  {
    id: 2,
    title: "Teams Selected",
    category: "Phase 02 — Cohort Admission",
    duration: "Duration: 1 Week",
    status: "Shortlisting",
    desc: "Up to 30 teams selected across all five tracks. Each team receives a briefing pack and is assigned an industry mentor.",
    detailedOverview: "The NBAC Technical Steering Committee evaluates all submitted concept notes against relevance, feasibility, and team capability. Up to 30 teams (maximum 6 per track) are officially admitted into the hackathon cohort.",
    keyDeliverables: [
      "Participation Confirmation & NDA Signing",
      "Initial Technical Scope & Development Roadmap",
      "Primary Contact Designation & Slack Onboarding"
    ],
    supportProvided: [
      "Official AeroLab Cohort Onboarding Kit",
      "Dedicated 1-on-1 pairing with an assigned Industry Mentor",
      "Access to sandboxed aviation data APIs & technical documentation"
    ]
  },
  {
    id: 3,
    title: "Mentor Sessions",
    category: "Phase 03 — Mentorship & Build",
    duration: "Duration: 2 Weeks",
    status: "Active Cohort",
    desc: "Virtual advisory sessions per team with an assigned industry mentor drawn from the NBAC steering committee and speaker pool.",
    detailedOverview: "Admitted teams enter intensive virtual advisory office hours with senior executive mentors from NCAA, NAMA, leading FBOs, and aviation finance institutions to refine their technical architecture and business viability.",
    keyDeliverables: [
      "Architecture Review & Regulatory Compliance Alignment",
      "Mid-Way Prototype Progress Check-in",
      "Draft Pitch Outline & Slide Structure"
    ],
    supportProvided: [
      "Two mandatory 1-on-1 virtual mentoring sessions per team",
      "Direct regulatory advice from NCAA & NAMA steering leads",
      "Peer review and technical sanity checks"
    ]
  },
  {
    id: 4,
    title: "Submissions Due",
    category: "Phase 04 — Technical Jury Review",
    duration: "Deadline Week",
    status: "Evaluation",
    desc: "Working prototype or solution deck submitted. Up to 10 finalists selected — a maximum of 2 per track.",
    detailedOverview: "Teams finalize and submit their working prototypes, functional repositories, and presentation decks. The independent panel of 5 expert judges evaluates all 30 solutions to select 10 top finalist teams.",
    keyDeliverables: [
      "Functional Prototype URL or Code Repository (GitHub / GitLab)",
      "3-Minute Recorded Solution Walkthrough & Video Demo",
      "Final 5-Minute Executive Presentation Deck"
    ],
    supportProvided: [
      "Final technical submission portal & support desk",
      "Pitch rehearsal coaching with presentation mentors",
      "Finalist announcement media release & travel coordination"
    ]
  },
  {
    id: 5,
    title: "Finalist Showcase",
    category: "Phase 05 — Conference Day 1",
    duration: "Day 1 Exhibition",
    status: "Live Showcase",
    desc: "Finalists given dedicated exhibition space on Conference Day 1. Delegates visit during breaks for live demos and pitches.",
    detailedOverview: "The 10 finalist teams are provided with dedicated high-visibility exhibition booths in the main NBAC 2027 Exhibition Hall, showcasing live demos to over 1,000 corporate aviation executives, financiers, and VIP delegates.",
    keyDeliverables: [
      "Interactive Live Product Demonstration at Exhibition Booth",
      "Delegate Engagement & Investor Networking",
      "Delegates' Choice Award Live Campaigning"
    ],
    supportProvided: [
      "Dedicated exhibition booth & branded display setup",
      "All-Access VIP Delegate Badges & Gala Dinner passes",
      "Real-time live digital delegate voting system"
    ]
  },
  {
    id: 6,
    title: "Pitches & Awards",
    category: "Phase 06 — Conference Day 2",
    duration: "Grand Finale",
    status: "Main Stage & Gala",
    desc: "10 finalists deliver 5-minute pitches to the full conference assembly on Day 2. Winners announced at the Gala Dinner.",
    detailedOverview: "Finalists deliver 5-minute main stage pitches followed by 3-minute jury Q&A in front of the full conference assembly. Track Winners (₦1.5M each) and the Grand Winner (₦5M) are crowned live at the Gala Dinner.",
    keyDeliverables: [
      "5-Minute Live Main Stage Pitch",
      "3-Minute Jury Cross-Examination",
      "Media & Winner Interview Spotlight"
    ],
    supportProvided: [
      "₦12,500,000 Total Cash Prize Pool Distribution",
      "Post-event White Paper inclusion & regulatory introductions",
      "1-Year Industry Accelerator & Steering Committee mentorship"
    ]
  }
]

const JUDGING_CRITERIA = [
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

const PRIZES = [
  {
    title: "Track Winners (×5)",
    amount: "₦1,500,000",
    subAmount: "each",
    subAmountClass: "text-sm font-sans text-nbac-muted font-medium ml-1",
    desc: "Awarded to the top solutions across each of the five individual competition tracks.",
    icon: Award,
    iconColor: "text-nbac-emerald bg-nbac-emerald/10 border-nbac-emerald/20",
    iconClass: "w-5 h-5",
    checkColor: "text-nbac-emerald",
    features: [
      "Official certificate and track trophy",
      "Inclusion in the NBAC 2027 post-event report",
      "Introductions to relevant industry stakeholders",
      "Matchmaking with potential implementation partners"
    ],
    className: "order-2 lg:order-1 lg:translate-y-4 bg-nbac-panel/40 border border-nbac-border",
    style: { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)' },
    titleColor: "text-nbac-emerald font-semibold",
    amountColor: "text-3xl md:text-4xl",
    featuresHeader: "INCLUDES:",
    featuresHeaderColor: "text-nbac-muted",
    featureTextClass: "font-light text-nbac-body",
    isGrand: false
  },
  {
    title: "Overall Winner — Best in Show",
    amount: "₦5,000,000",
    subAmount: "(or USD equivalent)",
    subAmountClass: "text-xs font-sans text-nbac-muted font-medium block mt-1",
    desc: "The highest honor. Awarded to the ultimate solution demonstrating the highest degree of innovation, technical viability, and market impact.",
    icon: Trophy,
    iconColor: "text-nbac-gold bg-nbac-gold/15 border-nbac-gold/20",
    iconClass: "w-5 h-5 animate-pulse",
    checkColor: "text-nbac-gold",
    features: [
      "Formal presentation to steering committee & regulators",
      "Feature in the official NBAC 2027 White Paper",
      "One-year industry mentorship & guidance",
      "Free exhibition space at NBAC 2029",
      "Full Gala Dinner award media spotlight"
    ],
    className: "order-1 lg:order-2 scale-100 lg:scale-[1.04] bg-nbac-panel/85 border-2 border-nbac-gold relative",
    style: { 
      boxShadow: '0 20px 50px rgba(197, 160, 89, 0.15)',
      borderColor: '#c5a059'
    },
    titleColor: "text-nbac-gold font-bold",
    amountColor: "text-4xl md:text-5xl",
    featuresHeader: "INCLUDES:",
    featuresHeaderColor: "text-nbac-gold",
    featureTextClass: "font-medium text-nbac-text",
    isGrand: true
  },
  {
    title: "People's Choice Award",
    amount: "Sponsor Gift",
    subAmount: "High-value sponsor package",
    subAmountClass: "text-xs font-sans text-nbac-muted block mt-1",
    desc: "Voted live by conference delegates during Day 2. Highlights the solution that resonated most with the conference floor.",
    icon: Flame,
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    iconClass: "w-5 h-5",
    checkColor: "text-amber-400",
    features: [
      "Delegates vote live via conference web app on Day 2",
      "Winner receives a high-value physical or service package provided by the NBAC Title Sponsor",
      "Live announcement on the main ballroom stage"
    ],
    className: "order-3 lg:order-3 lg:translate-y-4 bg-nbac-panel/40 border border-nbac-border",
    style: { boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)' },
    titleColor: "text-amber-400 font-semibold",
    amountColor: "text-3xl md:text-4xl",
    featuresHeader: "DETAILS:",
    featuresHeaderColor: "text-nbac-muted",
    featureTextClass: "font-light text-nbac-body",
    isGrand: false
  }
]

export default function AeroLabPage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedStep, setSelectedStep] = useState<number | null>(null)

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

      // 1. Choreographed Hero Master Timeline with position parameters & labels
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      heroTl
        .addLabel('start', 0)
        .fromTo('.hero-eyebrow',
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.8 },
          'start'
        )
        .fromTo('.hero-title',
          { opacity: 0, y: 40, rotateX: 6 },
          { opacity: 1, y: 0, rotateX: 0, duration: 1 },
          '<0.15'
        )
        .fromTo('.hero-subtitle',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '<0.2'
        )
        .fromTo('.hero-desc',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.8 },
          '<0.15'
        )
        .fromTo('.hero-cta',
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 },
          '<0.2'
        )

      // 2. Scroll trigger for Challenge Tracks
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

      // 3. Scroll trigger for Eligibility
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

      // 4. Scroll trigger for Judging Criteria
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

      // 6. Scroll trigger for Prizes
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


  return (
    <>
      <Navbar />

      <main 
        ref={containerRef}
        className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 overflow-hidden relative"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-87.5 bg-linear-to-b from-nbac-gold/15 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-0 w-100 h-100 bg-nbac-emerald/5 rounded-full blur-3xl pointer-events-none" />

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
              href="/aerolab/apply"
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
        <section id="tracks" className="tracks-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
          <div className="text-center mb-16">
            <SectionEyebrow className="text-center justify-center">THE COMPETITION</SectionEyebrow>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Challenge Tracks</h2>
            <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4">
              Five tailored research and building challenges focusing on key components of the Nigerian and West African aviation growth strategy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {TRACKS.map((track) => {
              const IconComponent = track.icon
              
              // Track 5 spans 2 columns on desktop for a balanced 3+2 grid layout
              const spanClass = track.id === 5 ? "lg:col-span-2 md:col-span-2 col-span-1" : "col-span-1"

              return (
                <motion.div
                  key={track.id}
                  whileHover={{ y: -6, borderColor: 'var(--nbac-gold)' }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`track-card opacity-0 flex flex-col bg-nbac-panel/40 border border-nbac-border/80 rounded-2xl overflow-hidden glass-card p-6 md:p-8 justify-between gap-6 ${spanClass}`}
                  style={{
                    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                  }}
                >
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-6">
                        <div className={`p-3.5 rounded-xl bg-linear-to-br ${track.color} shrink-0 border`}>
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-nbac-gold px-3 py-1 bg-nbac-gold/5 border border-nbac-gold/15 rounded-full">
                          Track 0{track.id}
                        </span>
                      </div>

                      {/* Eyebrow, Title & Core Challenge Statement */}
                      <div>
                        <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-nbac-emerald mb-2 block">
                          {track.obj}
                        </span>
                        <h3 className="font-sans text-xl md:text-2xl font-bold text-nbac-text mb-3 leading-tight">
                          {track.title}
                        </h3>
                        <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
                          {track.desc}
                        </p>
                      </div>
                    </div>

                    {/* Clean Bottom Impact & Deliverable Badges */}
                    <div className="pt-6 border-t border-nbac-border/40 flex flex-wrap gap-2.5 items-center justify-between mt-6">
                      <div className="flex items-center gap-1.5 bg-nbac-gold/10 border border-nbac-gold/20 text-nbac-gold px-3 py-1.5 rounded-lg text-xs font-medium font-sans">
                        <Target className="w-3.5 h-3.5 shrink-0 text-nbac-gold" />
                        <span>{track.targetImpact}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-nbac-emerald/10 border border-nbac-emerald/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-medium font-sans">
                        <FileCode2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                        <span>{track.deliverable}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>

        {/* Who Can Participate & Eligibility */}
        <section className="eligibility-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
          <div className="text-center mb-16">
            <SectionEyebrow className="text-center justify-center">COLLABORATION</SectionEyebrow>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">Who Can Participate</h2>
            <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4">
              AeroLab is designed to bring diverse minds together to shape actionable products. We invite participants from across the technological and operational spectrum.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12">
            {ELIGIBILITY.map((item, idx) => {
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

        {/* Hackathon Timeline Section */}
        <section className="timeline-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
            <div className="text-center mb-16">
              <SectionEyebrow className="text-center justify-center">THE JOURNEY</SectionEyebrow>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
                Hackathon <span className="italic text-nbac-emerald font-semibold">Timeline</span>
              </h2>
              <p className="font-serif text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4 italic">
                From initial application to the main stage award ceremony
              </p>
            </div>

            {/* Desktop Horizontal Timeline */}
            <div className="hidden lg:block relative py-12 mt-10">
              {/* Horizontal line running across the center */}
              <div className="absolute top-1/2 left-[5%] right-[5%] h-0.5 bg-nbac-border -translate-y-1/2" />
              <div className="absolute top-1/2 left-[5%] h-0.5 bg-nbac-emerald -translate-y-1/2 timeline-progress-line" style={{ width: '90%' }} />

              <div className="grid grid-cols-6 gap-6 relative">
                {TIMELINE_STEPS.map((step, idx) => {
                  const isTop = idx % 2 === 0;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => setSelectedStep(step.id)}
                      className="timeline-step flex flex-col items-center relative cursor-pointer group"
                    >
                      {/* Top Card Box */}
                      {isTop ? (
                        <div className="h-44 flex flex-col justify-end w-full mb-6">
                          <div className="bg-nbac-panel/40 border border-nbac-emerald/30 group-hover:border-nbac-gold/60 p-4 md:p-5 rounded-lg glass-card text-left transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_25px_rgba(196,149,42,0.15)]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-nbac-gold bg-nbac-gold/10 px-2 py-0.5 rounded border border-nbac-gold/20">
                                Phase 0{step.id}
                              </span>
                              <span className="text-[10px] font-medium text-nbac-muted group-hover:text-nbac-gold transition-colors flex items-center gap-0.5">
                                Details <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                            <h4 className="font-sans font-bold text-sm text-nbac-text mb-1.5 group-hover:text-nbac-gold-light transition-colors">{step.title}</h4>
                            <p className="font-sans font-light text-xs text-nbac-body leading-relaxed line-clamp-3">{step.desc}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="h-44" />
                      )}

                      {/* Dot & Connectors */}
                      <div className="relative z-10 flex flex-col items-center">
                        {isTop ? (
                          <div className="w-px h-6 bg-nbac-emerald/40 group-hover:bg-nbac-gold/60 transition-colors" />
                        ) : null}

                        {/* Outer Dot */}
                        <div className="timeline-dot w-5 h-5 rounded-full bg-[#101415] border-2 border-nbac-emerald group-hover:border-nbac-gold flex items-center justify-center shadow-[0_0_10px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_15px_rgba(196,149,42,0.5)] transition-all transform group-hover:scale-125">
                          {/* Inner Dot */}
                          <div className="w-2 h-2 rounded-full bg-nbac-emerald group-hover:bg-nbac-gold transition-colors" />
                        </div>

                        {!isTop ? (
                          <div className="w-px h-6 bg-nbac-emerald/40 group-hover:bg-nbac-gold/60 transition-colors" />
                        ) : null}
                      </div>

                      {/* Bottom Card Box */}
                      {!isTop ? (
                        <div className="h-44 flex flex-col justify-start w-full mt-6">
                          <div className="bg-nbac-panel/40 border border-nbac-emerald/30 group-hover:border-nbac-gold/60 p-4 md:p-5 rounded-lg glass-card text-left transition-all duration-300 group-hover:translate-y-1 group-hover:shadow-[0_10px_25px_rgba(196,149,42,0.15)]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-sans text-[9px] font-bold uppercase tracking-wider text-nbac-gold bg-nbac-gold/10 px-2 py-0.5 rounded border border-nbac-gold/20">
                                Phase 0{step.id}
                              </span>
                              <span className="text-[10px] font-medium text-nbac-muted group-hover:text-nbac-gold transition-colors flex items-center gap-0.5">
                                Details <ArrowRight className="w-2.5 h-2.5 group-hover:translate-x-0.5 transition-transform" />
                              </span>
                            </div>
                            <h4 className="font-sans font-bold text-sm text-nbac-text mb-1.5 group-hover:text-nbac-gold-light transition-colors">{step.title}</h4>
                            <p className="font-sans font-light text-xs text-nbac-body leading-relaxed line-clamp-3">{step.desc}</p>
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
              <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-nbac-emerald" />
              
              <div className="space-y-8">
                {TIMELINE_STEPS.map((step, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedStep(step.id)}
                    className="timeline-step relative flex items-start gap-6 cursor-pointer group"
                  >
                    {/* Node Dot */}
                    <div className="timeline-dot absolute -left-5.25 top-1.5 w-5 h-5 rounded-full bg-[#101415] border-2 border-nbac-emerald group-hover:border-nbac-gold flex items-center justify-center z-10 shadow-[0_0_10px_rgba(16,185,129,0.3)] transition-all">
                      <div className="w-2 h-2 rounded-full bg-nbac-emerald group-hover:bg-nbac-gold transition-colors" />
                    </div>

                    <div className="flex-1">
                      <div className="bg-nbac-panel/40 border border-nbac-emerald/30 group-hover:border-nbac-gold/60 p-5 rounded-lg glass-card text-left transition-all">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-nbac-gold bg-nbac-gold/10 px-2 py-0.5 rounded border border-nbac-gold/20">
                            Phase 0{step.id}
                          </span>
                          <span className="text-[10px] font-medium text-nbac-gold flex items-center gap-1">
                            View Details <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                        <h4 className="font-sans font-bold text-sm text-nbac-text mb-2 group-hover:text-nbac-gold-light transition-colors">{step.title}</h4>
                        <p className="font-sans font-light text-xs text-nbac-body leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        {/* Modal Details Dialog for Selected Timeline Step */}
        <AnimatePresence>
          {selectedStep !== null && (() => {
            const step = TIMELINE_STEPS.find(s => s.id === selectedStep)
            if (!step) return null

            const hasPrev = selectedStep > 1
            const hasNext = selectedStep < TIMELINE_STEPS.length

            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSelectedStep(null)}
                  className="absolute inset-0 bg-black/90"
                />

                {/* Modal Window */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="relative z-10 w-full max-w-2xl bg-[#0b0f10] border border-nbac-gold/30 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden font-sans text-left max-h-[85vh] overflow-y-auto"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between border-b border-nbac-border/60 pb-5 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-sans text-[10px] font-bold uppercase tracking-wider text-nbac-gold bg-nbac-gold/10 border border-nbac-gold/20 px-2.5 py-0.5 rounded-full">
                          {step.category}
                        </span>
                        <span className="font-sans text-[10px] font-semibold uppercase tracking-wider text-nbac-emerald bg-nbac-emerald/10 border border-nbac-emerald/20 px-2.5 py-0.5 rounded-full">
                          {step.status}
                        </span>
                      </div>
                      <h3 className="font-sans text-2xl md:text-3xl font-bold text-nbac-text leading-tight">
                        {step.title}
                      </h3>
                      <p className="text-xs text-nbac-muted font-medium mt-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-nbac-gold" />
                        <span>{step.duration}</span>
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedStep(null)}
                      className="p-2 text-nbac-muted hover:text-nbac-text hover:bg-nbac-panel rounded-lg transition-colors shrink-0"
                      aria-label="Close details modal"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-gold mb-2">Phase Overview</h4>
                      <p className="text-sm font-light text-nbac-body leading-relaxed">
                        {step.detailedOverview}
                      </p>
                    </div>

                    {/* Key Deliverables */}
                    <div className="bg-[#12181a] border border-nbac-border/60 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-emerald mb-3 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-nbac-emerald" />
                        <span>Key Deliverables & Requirements</span>
                      </h4>
                      <ul className="space-y-2">
                        {step.keyDeliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-light text-nbac-body leading-relaxed">
                            <span className="text-nbac-emerald font-bold text-[10px] shrink-0 mt-0.5">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Support Provided */}
                    <div className="bg-[#12181a] border border-nbac-border/60 rounded-xl p-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-nbac-gold mb-3 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-nbac-gold" />
                        <span>Support & Resources Provided</span>
                      </h4>
                      <ul className="space-y-2">
                        {step.supportProvided.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs font-light text-nbac-body leading-relaxed">
                            <span className="text-nbac-gold font-bold text-[10px] shrink-0 mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Footer Navigation */}
                  <div className="mt-8 pt-5 border-t border-nbac-border/60 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        disabled={!hasPrev}
                        onClick={() => setSelectedStep(prev => prev ? prev - 1 : null)}
                        className={`p-2 rounded-lg border text-xs font-medium font-sans flex items-center gap-1 transition-colors ${
                          hasPrev 
                            ? 'bg-nbac-panel/50 border-nbac-border text-nbac-text hover:border-nbac-gold/40' 
                            : 'opacity-30 border-transparent text-nbac-muted cursor-not-allowed'
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous Phase</span>
                      </button>

                      <button
                        disabled={!hasNext}
                        onClick={() => setSelectedStep(prev => prev ? prev + 1 : null)}
                        className={`p-2 rounded-lg border text-xs font-medium font-sans flex items-center gap-1 transition-colors ${
                          hasNext 
                            ? 'bg-nbac-panel/50 border-nbac-border text-nbac-text hover:border-nbac-gold/40' 
                            : 'opacity-30 border-transparent text-nbac-muted cursor-not-allowed'
                        }`}
                      >
                        <span className="hidden sm:inline">Next Phase</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                    <Link
                      href="/aerolab/apply"
                      onClick={() => setSelectedStep(null)}
                      className="bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-bold text-xs px-5 py-2.5 rounded-lg transition-colors uppercase tracking-wider inline-block"
                    >
                      Apply Now
                    </Link>
                  </div>
                </motion.div>
              </div>
            )
          })()}
        </AnimatePresence>

        {/* Judging Criteria Section */}
        <section className="criteria-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
          <div className="text-center mb-16">
            <SectionEyebrow className="text-center justify-center">EVALUATION</SectionEyebrow>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Judging <span className="italic text-nbac-emerald font-semibold">Criteria</span>
            </h2>
            <p className="text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4 font-serif italic">
              Five dimensions, independently scored by a panel of five industry judges
            </p>
          </div>

          {/* Grid layout for 5 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto">
            {JUDGING_CRITERIA.map((item, idx) => (
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
            <p className="text-[11px] md:text-xs font-light text-nbac-muted font-serif italic leading-relaxed">
              Judges: NCAA/FAAN representative • Active Nigerian operator • Tech/startup investor • OEM or MRO representative • NBAC steering committee member
            </p>
          </div>
        </section>

        {/* Prizes Section */}
        <section className="prizes-section relative z-10 px-6 md:px-24 max-w-7xl mx-auto py-16 md:py-24 border-t border-nbac-border/30">
          <div className="text-center mb-16">
            <SectionEyebrow className="text-center justify-center">AWARDS & INCENTIVES</SectionEyebrow>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">The Prizes</h2>
            <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-2xl mx-auto mt-4">
              Compete for significant funding, industry mentorship, and unmatched executive-level networking opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {PRIZES.map((prize, idx) => {
              const IconComponent = prize.icon;
              return (
                <div 
                  key={idx}
                  className={`prize-card opacity-0 flex flex-col justify-between rounded-2xl p-8 glass-card ${prize.className}`}
                  style={prize.style}
                >
                  {prize.isGrand && (
                    <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-nbac-gold to-nbac-gold-dark text-[#0b0f10] font-sans font-bold text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-md">
                      GRAND PRIZE
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className={`p-2.5 rounded-lg border ${prize.iconColor}`}>
                        <IconComponent className={prize.iconClass} />
                      </div>
                      <span className={`font-sans text-xs uppercase tracking-wider ${prize.titleColor}`}>{prize.title}</span>
                    </div>
                    
                    <div className="mb-6">
                      <span className={`font-display font-extrabold text-nbac-text ${prize.amountColor}`}>{prize.amount}</span>
                      <span className={prize.subAmountClass}>{prize.subAmount}</span>
                    </div>

                    <p className="font-sans text-sm font-light text-nbac-body leading-relaxed mb-6">
                      {prize.desc}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-nbac-border/60">
                    <span className={`font-sans text-[10px] uppercase tracking-wider font-bold block mb-4 ${prize.featuresHeaderColor}`}>{prize.featuresHeader}</span>
                    <ul className="flex flex-col gap-3">
                      {prize.features.map((feat, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-xs font-light text-nbac-body">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${prize.checkColor}`} />
                          <span className={prize.featureTextClass}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
