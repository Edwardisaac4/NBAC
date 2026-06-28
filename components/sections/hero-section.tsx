'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { StatCounter } from '../shared/stat-counter'

gsap.registerPlugin(ScrollTrigger)

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
          ],
          { opacity: 1, y: 0 }
        )
        gsap.set(bgRef.current, { scale: 1.1 })
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

      /* ── 4. Eyebrow Phrase Rotation ────────────────────── */
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
        
        {/* Static atmospheric gradient that fades to the theme canvas at the bottom */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-nbac-canvas/5 to-nbac-canvas z-10" />
        
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
          className="font-sans text-xs md:text-sm uppercase tracking-[0.3em] font-semibold text-nbac-emerald-light block opacity-0 select-none"
        >
          {phrases[0]}
        </span>

        {/* Display Heading — word-by-word reveal with 3D perspective */}
        <h1
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
        <p className="hero-meta font-sans text-xs sm:text-sm md:text-lg text-nbac-text tracking-wider font-medium max-w-2xl opacity-0">
          October 24-26, 2024 • Eko Convention Centre, Lagos, Nigeria
        </p>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-16 py-2 md:py-3 w-full my-2 md:my-3 relative">
          {/* Top divider — grows from center */}
          <div className="hero-divider-line absolute top-0 left-0 right-0 h-px bg-nbac-border origin-center opacity-0" />

          <div className="hero-stat-item opacity-0">
            <StatCounter value={500} suffix="+" label="Delegates" duration={1.5} numberClassName="text-nbac-text" labelClassName="text-nbac-body" />
          </div>
          <div className="hero-stat-item opacity-0">
            <StatCounter value={30} suffix="+" label="Exhibitors" duration={1.5} numberClassName="text-nbac-text" labelClassName="text-nbac-body" />
          </div>
          <div className="hero-stat-item opacity-0">
            <StatCounter value={50} suffix="+" label="Speakers" duration={1.5} numberClassName="text-nbac-text" labelClassName="text-nbac-body" />
          </div>
          <div className="hero-stat-item opacity-0">
            <StatCounter value={15} suffix="+" label="Aircraft on Display" duration={1.5} numberClassName="text-nbac-text" labelClassName="text-nbac-body" />
          </div>

          {/* Bottom divider — grows from center */}
          <div className="hero-divider-line absolute bottom-0 left-0 right-0 h-px bg-nbac-border origin-center opacity-0" />
        </div>

        {/* CTAs */}
        <div className="hero-buttons flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto opacity-0">
          <button className="w-full sm:w-auto bg-nbac-emerald hover:bg-nbac-emerald-dark text-nbac-canvas font-sans font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors shadow-lg shadow-nbac-emerald/20 text-sm uppercase tracking-widest">
            Secure Executive Pass
          </button>
          <button className="w-full sm:w-auto border border-nbac-border text-nbac-text hover:bg-nbac-panel font-sans font-medium px-6 md:px-8 py-2.5 md:py-3 rounded-full transition-colors backdrop-blur-sm text-sm uppercase tracking-widest">
            Download Brochure
          </button>
        </div>
      </div>
    </section>
  )
}
