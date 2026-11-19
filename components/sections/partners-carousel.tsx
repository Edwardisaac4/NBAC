'use client'

import { Children, useEffect, useRef, useState, type ReactNode } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'

/**
 * Rotates the partner wall's tier panels in place: each slides in from the
 * right, stays for its own number of seconds, then slides out to the left as
 * the next comes in, looping back to the first.
 *
 * Kept cheap for the homepage's performance score: the panels stay
 * server-rendered, movement is transform and opacity only (both run on the
 * compositor), and all panels share one grid cell, so the wall is as tall as
 * its tallest panel and never shifts the page. Rotation starts only once the
 * wall is on screen, so visitors always see the first panel first, and pauses
 * while it's off screen, hovered or focused. Hidden panels are inert, so
 * keyboard users can't tab into them.
 *
 * With reduced motion the panels are listed one under another instead, last
 * child first, and nothing moves.
 */

const SLIDE_MS = 700

const MOTION = {
  in: 'motion-safe:[transform:translateX(0)] motion-safe:opacity-100 motion-safe:transition-[transform,opacity] motion-safe:duration-700 motion-safe:ease-out',
  out: 'motion-safe:[transform:translateX(-100%)] motion-safe:opacity-0 motion-safe:transition-[transform,opacity] motion-safe:duration-700 motion-safe:ease-in',
  waiting: 'motion-safe:[transform:translateX(100%)] motion-safe:opacity-0',
}

export function PartnersCarousel({ seconds, children }: { seconds: number[]; children: ReactNode }) {
  const slides = Children.toArray(children)
  const count = slides.length
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const rotating = count > 1 && !reducedMotion

  const [active, setActive] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const [inView, setInView] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !rotating) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.4 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [rotating])

  useEffect(() => {
    if (!rotating || !inView || hovered || focused) return
    const id = window.setTimeout(() => {
      setLeaving(active)
      setActive((active + 1) % count)
    }, seconds[active] * 1000)
    return () => window.clearTimeout(id)
  }, [rotating, inView, hovered, focused, active, count, seconds])

  // Once a panel has slid out, park it on the right, ready to slide in again.
  useEffect(() => {
    if (leaving === null) return
    const id = window.setTimeout(() => setLeaving(null), SLIDE_MS)
    return () => window.clearTimeout(id)
  }, [leaving])

  return (
    <div
      ref={ref}
      className="flex flex-col-reverse gap-6 md:gap-8 motion-safe:grid motion-safe:overflow-hidden"
      onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false)
      }}
    >
      {slides.map((slide, i) => {
        const state = i === active ? 'in' : i === leaving ? 'out' : 'waiting'
        return (
          <div key={i} inert={rotating && i !== active} className={`flex motion-safe:[grid-area:1/1] ${MOTION[state]}`}>
            {slide}
          </div>
        )
      })}
    </div>
  )
}
