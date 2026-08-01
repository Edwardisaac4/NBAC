'use client'

import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import Link from 'next/link'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'
import { StatCounter } from '../shared/stat-counter'
import { CONFERENCE_META } from '@/data/conference-stats'
import { ChevronLeft, ChevronRight } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ── Particle Configuration ─────────────────────────── */
const PARTICLE_COUNT = 18
const PARTICLE_COLORS = [
  'rgba(223, 183, 108, 0.25)',  // gold
  'rgba(245, 192, 66, 0.20)',   // gold-light
  'rgba(16, 185, 129, 0.18)',   // emerald
  'rgba(223, 183, 108, 0.15)',  // gold faint
  'rgba(52, 211, 153, 0.12)',   // emerald-light
]

/* ── Seeded PRNG (mulberry32) — deterministic across SSR + client ── */
function createSeededRandom(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function generateParticles() {
  const random = createSeededRandom(42)
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    size: 2 + random() * 3,          // 2–5px
    x: random() * 100,               // random horizontal start %
    y: random() * 100,               // random vertical start %
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    driftX: (random() - 0.5) * 120,  // horizontal drift range px
    driftY: -40 - random() * 80,     // float upward 40–120px
    duration: 14 + random() * 14,    // 14–28s per loop (luxurious slow float)
    delay: random() * 5,             // stagger start
  }))
}

const phrases = [
  "The Pinnacle of West African Aviation",
  "West Africa's Premier Business Aviation Event",
  "Connecting Leaders, Operators, and Innovators"
]

const bgImages = [
  "/images/sliders/slider 1.jpg",
  "/images/sliders/slider 2.jpg",
  "/images/sliders/AfRS_NBAC17_Day1_0001.jpg",
  "/images/sliders/AfRS_NBAC17_Day1_0014.jpg",
  "/images/sliders/AfRS_NBAC17_Day1_0056.jpg",
]

/* Each word in the heading — break: true means a <br/> follows that word */
const headingWords = [
  { text: 'Nigerian', break: false },
  { text: 'Business', break: true },
  { text: 'Aviation', break: false },
  { text: 'Conference', break: false },
]

export function HeroSection() {
  const bgRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const eyebrowRef = useRef<HTMLSpanElement>(null)
  const statsRowRef = useRef<HTMLDivElement>(null)
  const lightSweepRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [particles] = useState<ReturnType<typeof generateParticles>>(() => generateParticles())
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY })
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return
    const touch = e.changedTouches[0]
    const diffX = touchStart.x - touch.clientX
    const diffY = touchStart.y - touch.clientY
    if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX > 0) {
        // Swiped left -> Next slide
        setCurrentSlideIndex((prev) => (prev + 1) % bgImages.length)
      } else {
        // Swiped right -> Previous slide
        setCurrentSlideIndex((prev) => (prev - 1 + bgImages.length) % bgImages.length)
      }
    }
    setTouchStart(null)
  }

  useEffect(() => {
    if (bgImages.length <= 1) return
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % bgImages.length)
    }, 10000) // 10 seconds per slide for a relaxed, majestic presentation
    return () => clearInterval(timer)
  }, [])

  useGSAP(
    () => {
      /* ── Reduced Motion Guard ──────────────────────────── */
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(
          [
            bgRef.current,
            eyebrowRef.current,
            '.hero-word',
            '.hero-meta',
            '.hero-stat-item',
            '.hero-divider-line',
            '.hero-buttons',
            '.hero-particle',
          ],
          { opacity: 1, y: 0 }
        )
        gsap.set(bgRef.current, { scale: 1.1 })
        gsap.set('.hero-particle', { opacity: 0 })  // hide particles entirely
        return
      }

      /* ── 1. Entrance Timeline ──────────────────────────── */
      const tl = gsap.timeline({
        defaults: { ease: 'power3.out' },
        delay: 0
      })

      // Background zooms in from 1.2 → 1.1 with a smooth reveal
      tl.fromTo(
        bgRef.current,
        { scale: 1.2, opacity: 0.8 },
        { scale: 1.1, opacity: 1, duration: 1.2, ease: 'power2.out' }
      )

      // Eyebrow drops in — letter-spacing narrows for a "focus" feel
      tl.fromTo(
        eyebrowRef.current,
        { y: -24, opacity: 0, letterSpacing: '0.5em' },
        { y: 0, opacity: 1, letterSpacing: '0.3em', duration: 1, ease: 'power2.out' },
        '-=1.2'
      )

      // Heading words stagger in one-by-one with subtle 3D tilt
      tl.fromTo(
        '.hero-word',
        { y: 60, opacity: 0, rotateX: 12 },
        {
          y: 0,
          opacity: 1,
          rotateX: 0,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        },
        '-=0.8'
      )

      // Meta line slides up
      tl.fromTo(
        '.hero-meta',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.5'
      )

      // Divider lines grow from the center outward
      tl.fromTo(
        '.hero-divider-line',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.8, ease: 'power2.inOut' },
        '-=0.5'
      )

      // Stats stagger in individually
      tl.fromTo(
        '.hero-stat-item',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.1, ease: 'power2.out' },
        '-=0.4'
      )

      // CTAs slide up
      tl.fromTo(
        '.hero-buttons',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        '-=0.4'
      )

      /* ── NEW: Cinematic Light Sweep (fires once) ─────── */
      tl.to(
        lightSweepRef.current,
        {
          x: '300%',
          duration: 1.6,
          ease: 'power2.inOut',
        },
        '-=0.6'  // overlaps slightly with CTA entrance
      )

      /* ── NEW: Heading Glow Pulse ────────────────────── */
      tl.fromTo(
        headingRef.current,
        { textShadow: '0 0 0px rgba(223, 183, 108, 0)' },
        {
          textShadow: '0 0 40px rgba(223, 183, 108, 0.25), 0 0 80px rgba(223, 183, 108, 0.1)',
          duration: 1.2,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1,
        },
        '-=1.0'
      )

      /* ── 2. Scroll-Driven Content Fade-Out ─────────────── */
      // Hero content fades, moves up, and slightly scales down as user scrolls
      gsap.to(contentRef.current, {
        y: -80,
        opacity: 0,
        scale: 0.95,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '95% top',
          scrub: 1.2,
        },
      })

      /* ── 3. Multi-Layer Parallax ───────────────────────── */
      // Background layer — moves slower than scroll (creates depth)
      gsap.to(bgRef.current, {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      })

      // Gradient overlay — darkens/lightens as you scroll away from the hero
      gsap.to('.hero-gradient-scroll', {
        opacity: 0.9,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: '20% top',
          end: '100% top',
          scrub: 1.2,
        },
      })

      /* ── 4. Stats Row Independent Parallax ────────────── */
      // Creates a 3-layer depth sandwich: bg (slow) → stats (medium) → content (fast)
      gsap.to(statsRowRef.current, {
        yPercent: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '80% top',
          scrub: 1.2,
        },
      })



      /* ── 6. Eyebrow Phrase Rotation ────────────────────── */
      const startEyebrowLoop = () => {
        const loopTl = gsap.timeline({ repeat: -1 })
        const loopPhrases = [...phrases.slice(1), phrases[0]]

        loopPhrases.forEach((phrase) => {
          loopTl
            .to(eyebrowRef.current, {
              opacity: 0,
              y: -10,
              duration: 0.8,
              delay: 7.5,
              onComplete: () => {
                if (eyebrowRef.current) {
                  eyebrowRef.current.textContent = phrase
                }
              },
            })
            .to(eyebrowRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.8,
            })
        })
      }

      /* ── Start eyebrow loop after entrance completes ──── */
      tl.call(startEyebrowLoop)
    },
    { scope: containerRef }
  )

  useGSAP(
    () => {
      if (particles.length === 0) return;

      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches;

      if (prefersReduced) return;

      const isFirstLoad = !sessionStorage.getItem('nbac-preloader-shown');
      const delayOffset = isFirstLoad ? 1.8 : 0;

      const particleEls = gsap.utils.toArray('.hero-particle') as HTMLElement[];

      // Fade particles in after entrance completes
      gsap.fromTo(
        particleEls,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 2,
          stagger: 0.15,
          delay: delayOffset + 2.5,  // after entrance timeline
          ease: 'power1.in',
        }
      );

      // Each particle floats independently in an infinite loop
      particleEls.forEach((el, i) => {
        const p = particles[i];
        if (!p) return;

        gsap.to(el, {
          x: `+=${p.driftX}`,
          y: `+=${p.driftY}`,
          opacity: 0,
          duration: p.duration,
          delay: p.delay + delayOffset + 3,
          ease: 'none',
          repeat: -1,
          repeatDelay: 1,
          yoyo: false,
          onRepeat: () => {
            // Reset position for next loop cycle
            gsap.set(el, {
              x: 0,
              y: 0,
              opacity: parseFloat(el.dataset.baseOpacity || '0.25'),
            });
          },
        });
      });
    },
    { dependencies: [particles], scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-24 md:pt-28 pb-14 md:pb-16 select-none"
    >
      {/* ── Background Image Layer ─────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div ref={bgRef} className="absolute inset-0 w-full h-full opacity-100 scale-100 sm:scale-105 md:scale-110" style={{ willChange: 'transform' }}>
          {bgImages.map((src, index) => (
            <div
              key={src}
              className="hero-bg-slide absolute inset-0 w-full h-full transition-opacity duration-[2000ms] ease-in-out pointer-events-none"
              style={{
                opacity: index === currentSlideIndex ? 1 : 0,
              }}
            >
              <Image
                src={src}
                alt="Nigerian Business Aviation Conference Hero Background"
                fill
                priority={index === 0}
                sizes="100vw"
                quality={85}
                className="object-cover object-[50%_30%] sm:object-center transition-all duration-1000"
              />
            </div>
          ))}
        </div>

        {/* Dark overlay optimized for mobile clarity and high text contrast */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-black/35 to-black/70 sm:bg-black/45 z-10" />

        {/* ── Ambient Floating Particles ──────────────── */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="hero-particle"
            data-base-opacity={p.color.match(/[\d.]+(?=\))/)?.[0] || '0.25'}
            style={{
              width: p.size,
              height: p.size,
              left: `${p.x}%`,
              top: `${p.y}%`,
              backgroundColor: p.color,
              opacity: 0,
              boxShadow: `0 0 ${p.size * 2}px ${p.color}`,
            }}
          />
        ))}

        {/* ── Cinematic Light Sweep ───────────────────── */}
        <div className="hero-light-sweep">
          <div ref={lightSweepRef} className="hero-light-sweep-beam" />
        </div>

        {/* Scroll-reactive theme-colored overlay — starts transparent */}
        <div className="hero-gradient-scroll absolute inset-0 bg-nbac-canvas z-10 opacity-0" style={{ willChange: 'opacity' }} />

        {/* Subtle multiply layer for deep shadows */}
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply z-10" />
      </div>

      {/* ── Hero Content (fades out on scroll) ─────────── */}
      <div
        ref={contentRef}
        className="relative z-20 max-w-4xl space-y-3 md:space-y-4 flex flex-col items-center"
        style={{ willChange: 'transform, opacity' }}
      >
        {/* Eyebrow */}
        <span
          ref={eyebrowRef}
          className="font-sans text-xs md:text-sm uppercase tracking-[0.3em] font-semibold text-nbac-gold-light block select-none"
        >
          {phrases[0]}
        </span>

        {/* Display Heading — word-by-word reveal with 3D perspective */}
        <h1
          ref={headingRef}
          className="font-display text-3xl sm:text-4xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.1] tracking-tight"
          style={{ perspective: '600px' }}
        >
          {headingWords.map((word, i) => (
            <span key={i}>
              <span className="hero-word inline-block">{word.text}</span>
              {word.break ? <br className="hidden sm:inline" /> : ' '}
            </span>
          ))}
        </h1>

        {/* Venue / Date Metadata */}
        <div className="hero-meta relative w-full h-14 sm:h-10 md:h-8 flex items-center justify-center select-none overflow-hidden">
          <p className="font-sans text-xs sm:text-sm md:text-lg text-white/90 tracking-wider font-medium max-w-2xl mx-auto text-center">
            {CONFERENCE_META.date} • {CONFERENCE_META.venue}, {CONFERENCE_META.location}
          </p>
        </div>

        {/* Stats Row */}
        <div ref={statsRowRef} className="grid grid-cols-2 sm:grid-cols-4 gap-y-6 gap-x-4 sm:gap-x-8 md:gap-x-12 lg:gap-x-16 py-4 md:py-6 w-full max-w-4xl mx-auto my-2 md:my-3 relative" style={{ willChange: 'transform' }}>
          {/* Top divider — grows from center */}
          <div className="hero-divider-line absolute top-0 left-0 right-0 h-px bg-white/15 origin-center" />

          <div className="hero-stat-item">
            <StatCounter value={300} suffix="+" label="Delegates" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>
          <div className="hero-stat-item">
            <StatCounter value={30} suffix="+" label="AeroLab Applicant Teams" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>
          <div className="hero-stat-item">
            <StatCounter value={8} suffix="" label="Sessions" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>
          <div className="hero-stat-item">
            <StatCounter value={6} suffix="" label="Panel Sessions" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>

          {/* Bottom divider — grows from center */}
          <div className="hero-divider-line absolute bottom-0 left-0 right-0 h-px bg-white/15 origin-center" />
        </div>

        {/* CTAs */}
        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <Link href="/reservations" className="w-full sm:w-auto">
            <button className="hero-shimmer w-full bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 shadow-lg shadow-nbac-gold/15 hover:shadow-nbac-gold/30 hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-widest cursor-pointer">
              Secure Executive Pass
            </button>
          </Link>
          <a
            href="/documents/nbac-2027-brochure.pdf"
            download="NBAC_2027_Conference_Brochure.pdf"
            className="w-full sm:w-auto inline-flex justify-center border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-sans font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors backdrop-blur-sm text-sm uppercase tracking-widest cursor-pointer"
          >
            Download Brochure
          </a>
        </div>
      </div>

      {/* ── Mobile & Desktop Background Slide Indicators & Swipe Controls ── */}
      <div className="absolute bottom-3 md:bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 select-none">
        <button
          onClick={() => setCurrentSlideIndex((prev) => (prev - 1 + bgImages.length) % bgImages.length)}
          className="text-white/60 hover:text-nbac-gold transition-colors p-1 cursor-pointer"
          aria-label="Previous Slide"
        >
          <ChevronLeft size={14} />
        </button>

        <div className="flex items-center gap-1.5">
          {bgImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`transition-all duration-300 rounded-full cursor-pointer ${idx === currentSlideIndex
                  ? 'w-6 h-1.5 bg-nbac-gold shadow-[0_0_8px_rgba(196,149,42,0.8)]'
                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() => setCurrentSlideIndex((prev) => (prev + 1) % bgImages.length)}
          className="text-white/60 hover:text-nbac-gold transition-colors p-1 cursor-pointer"
          aria-label="Next Slide"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </section>
  )
}
