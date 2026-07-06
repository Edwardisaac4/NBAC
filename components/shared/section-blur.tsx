'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SectionBlurProps {
  children: React.ReactNode
  className?: string
  /** Max blur in pixels when entering/exiting viewport. Default 6. */
  intensity?: number
  /** Minimum opacity at peak blur. Default 0.65. */
  minOpacity?: number
  /** Disable the scroll blur on mobile/tablet screens (< 1024px). Default true. */
  disableOnMobile?: boolean
}

/**
 * Wraps a section with a scroll-driven blur transition.
 *
 * As the section enters the viewport from below, it sharpens from blurred → crisp.
 * While the section occupies the center of the viewport, it stays perfectly sharp.
 * As the section exits the viewport above, it blurs back out.
 *
 * Uses GSAP ScrollTrigger with scrub for buttery-smooth scroll-linked motion.
 * Respects prefers-reduced-motion — no blur applied if the user opts out.
 * Disables on mobile/tablet by default to maintain readability and performance.
 */
export function SectionBlur({
  children,
  className,
  intensity = 4,
  minOpacity = 0.75,
  disableOnMobile = true,
}: SectionBlurProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) return

      const mm = gsap.matchMedia()
      const mediaQuery = disableOnMobile ? '(min-width: 1024px)' : '(min-width: 0px)'

      mm.add(mediaQuery, () => {
        // Timeline phases map to scroll position:
        //   0%   – section top reaches viewport bottom (entering)
        //   ~12% – section fully in view (sharp)
        //   ~88% – section about to leave (sharp)
        //   100% – section bottom reaches viewport top (exiting)
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: ref.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.6, // slight smoothing for buttery feel
          },
        })

        // Phase 1 — Blur-in: entering viewport → sharpens quickly
        tl.fromTo(
          ref.current,
          { filter: `blur(${intensity}px)`, opacity: minOpacity },
          { filter: 'blur(0px)', opacity: 1, duration: 0.12, ease: 'none' }
        )

        // Phase 2 — Hold sharp: section is fully visible
        tl.to(ref.current, {
          filter: 'blur(0px)',
          opacity: 1,
          duration: 0.76,
          ease: 'none',
        })

        // Phase 3 — Blur-out: exiting viewport → blurs away late
        tl.to(ref.current, {
          filter: `blur(${intensity}px)`,
          opacity: minOpacity,
          duration: 0.12,
          ease: 'none',
        })
      })

      return () => {
        mm.revert()
      }
    },
    { scope: ref, dependencies: [intensity, minOpacity, disableOnMobile] }
  )

  return (
    <div ref={ref} className={className} style={{ willChange: 'filter, opacity' }}>
      {children}
    </div>
  )
}
