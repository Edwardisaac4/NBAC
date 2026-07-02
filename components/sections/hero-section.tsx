'use client'

import { useRef, useState, useEffect } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { StatCounter } from '../shared/stat-counter'

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

function generateParticles() {
  return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
    id: i,
    size: 2 + Math.random() * 3,          // 2–5px
    x: Math.random() * 100,               // random horizontal start %
    y: Math.random() * 100,               // random vertical start %
    color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
    driftX: (Math.random() - 0.5) * 120,  // horizontal drift range px
    driftY: -40 - Math.random() * 80,     // float upward 40–120px
    duration: 6 + Math.random() * 8,      // 6–14s per loop
    delay: Math.random() * 5,             // stagger start
  }))
}

const phrases = [
  "The Pinnacle of West African Aviation",
  "West Africa's Premier Business Aviation Event",
  "Connecting Leaders, Operators, and Innovators"
]

const bgImages = [
  "/images/hero_jet.jpg",
  "/images/interior_cabin.jpg",
  "/images/private_jet_runway_dusk.png"
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

  const [particles, setParticles] = useState<ReturnType<typeof generateParticles>>([])

  useEffect(() => {
    setParticles(generateParticles())
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
      const isFirstLoad = !sessionStorage.getItem('nbac-preloader-shown')
      const delayOffset = isFirstLoad ? 1.8 : 0

      const tl = gsap.timeline({ 
        defaults: { ease: 'power3.out' },
        delay: delayOffset
      })

      // Background zooms in from 1.3 → 1.1 with a cinematic reveal
      tl.fromTo(
        bgRef.current,
        { scale: 1.3, opacity: 0 },
        { scale: 1.1, opacity: 1, duration: 1.8, ease: 'power2.out' }
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
          scrub: true,
        },
      })

      /* ── 3. Multi-Layer Parallax ───────────────────────── */
      // Background layer — moves slower than scroll (creates depth)
      gsap.to(bgRef.current, {
        yPercent: 25,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
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
          scrub: true,
        },
      })

      /* ── 4. Stats Row Independent Parallax ────────────── */
      // Creates a 3-layer depth sandwich: bg (slow) → stats (medium) → content (fast)
      gsap.to(statsRowRef.current, {
        yPercent: -8,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: '80% top',
          scrub: true,
        },
      })

      /* ── 5. Ambient Floating Particles ──────────────── */
      const particleEls = gsap.utils.toArray('.hero-particle') as HTMLElement[]

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
      )

      // Each particle floats independently in an infinite loop
      particleEls.forEach((el, i) => {
        const p = particles[i]
        if (!p) return

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
            })
          },
        })
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
              duration: 0.6,
              delay: 4,
              onComplete: () => {
                if (eyebrowRef.current) {
                  eyebrowRef.current.textContent = phrase
                }
              },
            })
            .to(eyebrowRef.current, {
              opacity: 1,
              y: 0,
              duration: 0.6,
            })
        })
      }

      /* ── 5. Background Image Carousel ──────────────────── */
      const slides = gsap.utils.toArray('.hero-bg-slide') as HTMLElement[]
      let currentSlide = 0

      const playCarousel = () => {
        const nextSlide = (currentSlide + 1) % slides.length
        const crossfade = gsap.timeline()

        crossfade.to(slides[currentSlide], {
          opacity: 0,
          scale: 1.05,
          duration: 1.5,
          ease: 'power2.inOut',
        })

        crossfade.to(
          slides[nextSlide],
          {
            opacity: 1,
            scale: 1,
            duration: 1.5,
            ease: 'power2.inOut',
          },
          0
        )

        currentSlide = nextSlide
        gsap.delayedCall(6, playCarousel)
      }

      /* ── Start loops after entrance completes ──────────── */
      tl.call(startEyebrowLoop)
      tl.call(() => {
        if (slides.length > 1) {
          gsap.delayedCall(5, playCarousel)
        }
      })
    },
    { scope: containerRef }
  )

  return (
    <section
      ref={containerRef}
      className="relative min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden pt-24 md:pt-28 pb-8 md:pb-10"
    >
      {/* ── Background Image Layer ─────────────────────── */}
      <div className="absolute inset-0 z-0">
        <div ref={bgRef} className="absolute inset-0 w-full h-full opacity-0 scale-110">
          {bgImages.map((src, index) => (
            <div
              key={src}
              className="hero-bg-slide absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url("${src}")`,
                opacity: index === 0 ? 1 : 0,
              }}
            />
          ))}
        </div>

        {/* Dark overlay to ensure background images are always rich and text is legible */}
        <div className="absolute inset-0 bg-black/45 z-10" />

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
        <div className="hero-gradient-scroll absolute inset-0 bg-nbac-canvas z-10 opacity-0" />
        
        {/* Subtle multiply layer for deep shadows */}
        <div className="absolute inset-0 bg-black/20 mix-blend-multiply z-10" />
      </div>

      {/* ── Hero Content (fades out on scroll) ─────────── */}
      <div
        ref={contentRef}
        className="relative z-20 max-w-4xl space-y-3 md:space-y-4 flex flex-col items-center"
      >
        {/* Eyebrow */}
        <span
          ref={eyebrowRef}
          className="font-sans text-xs md:text-sm uppercase tracking-[0.3em] font-semibold text-nbac-gold-light block opacity-0 select-none"
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
              <span className="hero-word inline-block opacity-0">{word.text}</span>
              {word.break ? <br className="hidden sm:inline" /> : ' '}
            </span>
          ))}
        </h1>

        {/* Venue / Date Metadata */}
        <p className="hero-meta font-sans text-xs sm:text-sm md:text-lg text-white/90 tracking-wider font-medium max-w-2xl opacity-0">
          October 24-26, 2024 • Eko Convention Centre, Lagos, Nigeria
        </p>

        {/* Stats Row */}
        <div ref={statsRowRef} className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-16 py-2 md:py-3 w-full my-2 md:my-3 relative">
          {/* Top divider — grows from center */}
          <div className="hero-divider-line absolute top-0 left-0 right-0 h-px bg-white/15 origin-center opacity-0" />

          <div className="hero-stat-item opacity-0">
            <StatCounter value={500} suffix="+" label="Delegates" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>
          <div className="hero-stat-item opacity-0">
            <StatCounter value={30} suffix="+" label="Exhibitors" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>
          <div className="hero-stat-item opacity-0">
            <StatCounter value={50} suffix="+" label="Speakers" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>
          <div className="hero-stat-item opacity-0">
            <StatCounter value={15} suffix="+" label="Aircraft on Display" duration={1.5} numberClassName="text-white" labelClassName="text-white/70" />
          </div>

          {/* Bottom divider — grows from center */}
          <div className="hero-divider-line absolute bottom-0 left-0 right-0 h-px bg-white/15 origin-center opacity-0" />
        </div>

        {/* CTAs */}
        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto opacity-0">
          <button className="hero-shimmer w-full sm:w-auto bg-gradient-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-all duration-300 shadow-lg shadow-nbac-gold/15 hover:shadow-nbac-gold/30 hover:scale-[1.02] active:scale-[0.98] text-sm uppercase tracking-widest">
            Secure Executive Pass
          </button>
          <button className="w-full sm:w-auto border border-white/20 text-white hover:bg-white/10 hover:border-white/40 font-sans font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors backdrop-blur-sm text-sm uppercase tracking-widest">
            Download Brochure
          </button>
        </div>
      </div>
    </section>
  )
}
