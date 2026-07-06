---
name: gsap-animations
description: Use this skill whenever working on any animation, scroll effect, counter animation, marquee strip, parallax, page transition, hover interaction, modal, or any visual motion in the NBAC platform. Covers GSAP (with @gsap/react), Framer Motion, ScrollTrigger, and the rules for using them safely in Next.js 15 App Router.
---

# GSAP & Framer Motion — NBAC Animation Skill

This skill defines every animation pattern used in the NBAC platform.
Read this entire file before writing any animation code. Do not deviate from these patterns.

---

## 1. INSTALLATION

The project uses two animation libraries. Both are required. Do not remove either.

```bash
npm install gsap @gsap/react framer-motion
```

`@gsap/react` is the official React wrapper for GSAP. It provides the `useGSAP`
hook which handles cleanup automatically. Never use raw `useEffect` with GSAP.

---

## 2. THE GOLDEN RULES

Before writing any animation code, internalize these:

**Rule 1 — Every GSAP component must have `'use client'` at the top.**
GSAP reads the DOM. The DOM does not exist on the server. Any component using
GSAP or `useGSAP` must be a Client Component.

**Rule 2 — Always use `useGSAP`, never `useEffect` with GSAP.**
`useEffect` does not clean up GSAP animations correctly. `useGSAP` from
`@gsap/react` handles all cleanup, reverts, and context automatically.

```tsx
// ✅ CORRECT
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

useGSAP(() => {
  gsap.to('.target', { opacity: 1, y: 0 })
}, { scope: containerRef })

// ❌ WRONG — causes memory leaks and animation bleed between sessions
useEffect(() => {
  gsap.to('.target', { opacity: 1, y: 0 })
}, [])
```

**Rule 3 — Register plugins once, at the top of the file that uses them.**
Never register inside the component body or inside `useGSAP`.

```tsx
// At the top of the file, outside the component
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
gsap.registerPlugin(ScrollTrigger, TextPlugin)
```

**Rule 4 — The sponsor marquee uses CSS `@keyframes`, not GSAP.**
GSAP JS animation for a continuous loop is heavier and less smooth than
a pure CSS animation. The marquee is the one exception to using GSAP.

**Rule 5 — Framer Motion handles React-level interactions. GSAP handles DOM-level scroll and timeline animations.**
Do not mix them for the same element.

---

## 3. PLUGIN REFERENCE FOR NBAC

These are the only GSAP plugins used in this project:

```tsx
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'  // for the stats counter

gsap.registerPlugin(ScrollTrigger, TextPlugin)
```

Do NOT import premium GSAP plugins (SplitText, MorphSVG, etc.) — the project
uses the free GSAP public tier only.

---

## 4. COMPONENT TEMPLATE — GSAP CLIENT COMPONENT

Use this as the base for any component that uses GSAP:

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function AnimatedComponent() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      // All GSAP code goes here
      // Cleanup is automatic — no return needed
    },
    { scope: containerRef } // scope pins selectors to this container
  )

  return (
    <div ref={containerRef}>
      {/* content */}
    </div>
  )
}
```

The `scope` option on `useGSAP` is important — it prevents GSAP selectors
from accidentally targeting elements outside the component.

---

## 5. SCROLL REVEAL ANIMATIONS (Section Entrances)

Used on every home page section — elements fade up and into view on scroll.
Apply this pattern to the `SectionReveal` wrapper component.

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface SectionRevealProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

export function SectionReveal({
  children,
  delay = 0,
  className,
}: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.fromTo(
        ref.current,
        {
          opacity: 0,
          y: 32,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          delay,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',   // fires when top of element is 85% down viewport
            end: 'top 50%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: ref }
  )

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
```

**Usage:**
```tsx
<SectionReveal delay={0.1}>
  <AudienceCard />
</SectionReveal>
```

**Staggered grid reveal (for audience cards, sponsor logos):**
```tsx
useGSAP(
  () => {
    gsap.fromTo(
      '.reveal-item',  // scoped to containerRef
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,   // 100ms between each card
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      }
    )
  },
  { scope: containerRef }
)
```

---

## 6. STATS COUNTER ANIMATION (Hero Section)

The credibility counter row — "500+ Delegates", "30+ Exhibitors" etc. — counts
up from 0 when scrolled into view. Uses the `TextPlugin` for smooth number rendering.

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface StatCounterProps {
  value: number      // e.g. 500
  suffix?: string    // e.g. "+"
  label: string      // e.g. "Delegates"
  duration?: number  // seconds, default 2
}

export function StatCounter({
  value,
  suffix = '',
  label,
  duration = 2,
}: StatCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const counter = { val: 0 }

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 80%',
        onEnter: () => {
          gsap.to(counter, {
            val: value,
            duration,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (numberRef.current) {
                numberRef.current.textContent =
                  Math.round(counter.val).toLocaleString() + suffix
              }
            },
          })
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="text-center">
      <div className="font-display text-4xl font-bold text-nbac-text">
        <span ref={numberRef}>0{suffix}</span>
      </div>
      <div className="font-sans text-sm text-nbac-muted mt-1">{label}</div>
    </div>
  )
}
```

---

## 7. HERO PARALLAX (Hero Section Background)

The hero background image moves at a slower scroll rate than the page content,
creating a parallax depth effect.

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function HeroParallax() {
  const bgRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      gsap.to(bgRef.current, {
        yPercent: 30,   // moves 30% of its height downward as page scrolls
        ease: 'none',   // linear — parallax must be linear
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,  // ties animation directly to scroll position
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="relative h-screen overflow-hidden">
      {/* Background image layer — overflows container to allow parallax movement */}
      <div
        ref={bgRef}
        className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/images/hero-jet.jpg)' }}
      />
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-nbac-canvas/40 to-nbac-canvas" />
      {/* Hero content sits above the parallax layer */}
      <div className="relative z-10 flex h-full items-end justify-center pb-24">
        {/* hero text content here */}
      </div>
    </div>
  )
}
```

---

## 8. SPONSOR STRIP MARQUEE (CSS — Not GSAP)

The infinite auto-scrolling sponsor logo strip uses pure CSS `@keyframes`.
Do NOT use GSAP for this. CSS GPU compositing makes it smoother and cheaper.

Add this to `globals.css`:

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

.animate-marquee:hover {
  animation-play-state: paused;
}
```

Component:

```tsx
// NO 'use client' needed — pure CSS animation, no JS
interface SponsorStripProps {
  logos: { name: string; src: string }[]
}

export function SponsorStrip({ logos }: SponsorStripProps) {
  // Duplicate the array so the loop is seamless
  const doubled = [...logos, ...logos]

  return (
    <div className="overflow-hidden border-y border-nbac-border py-6">
      <div className="flex animate-marquee gap-16 w-max">
        {doubled.map((logo, i) => (
          <div
            key={`${logo.name}-${i}`}
            className="flex-shrink-0 opacity-40 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
          >
            <img
              src={logo.src}
              alt={logo.name}
              className="h-8 w-auto object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
```

The array is doubled so when the first set scrolls out of view, the second
set is already in position — creating a seamless infinite loop.

---

## 9. NAVBAR SCROLL BEHAVIOR (Glassmorphism Intensify)

The navbar is already semi-transparent. On scroll, it increases its background
opacity to improve readability over page content.

```tsx
'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export function Navbar() {
  const navRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      ScrollTrigger.create({
        start: 'top -80',  // fires 80px after page top
        onEnter: () => {
          gsap.to(navRef.current, {
            backgroundColor: 'rgba(17, 24, 39, 0.98)',
            duration: 0.3,
            ease: 'power1.out',
          })
        },
        onLeaveBack: () => {
          gsap.to(navRef.current, {
            backgroundColor: 'rgba(17, 24, 39, 0.85)',
            duration: 0.3,
            ease: 'power1.out',
          })
        },
      })
    },
    { scope: navRef }
  )

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-nbac-border"
      style={{ backgroundColor: 'rgba(17, 24, 39, 0.85)' }}
    >
      {/* navbar content */}
    </nav>
  )
}
```

---

## 10. FRAMER MOTION PATTERNS

Use Framer Motion for React-level interactions, not scroll-based animations.

### Card Hover (Audience Cards, Pass Tier Cards)

```tsx
import { motion } from 'framer-motion'

<motion.div
  className="bg-nbac-panel border border-nbac-border rounded-lg p-6 cursor-pointer"
  whileHover={{
    y: -4,
    borderColor: 'rgba(16, 185, 129, 0.5)',  // nbac-emerald at 50% opacity
    boxShadow: '0 8px 32px rgba(16, 185, 129, 0.08)',
  }}
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {/* card content */}
</motion.div>
```

### Admin Edit Drawer Slide-In

```tsx
import { motion, AnimatePresence } from 'framer-motion'

<AnimatePresence>
  {isOpen && (
    <>
      {/* Scrim / overlay */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {/* Drawer panel */}
      <motion.div
        className="fixed right-0 top-0 h-full w-[480px] z-50 bg-nbac-panel border-l border-nbac-border shadow-2xl"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* drawer content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Page Transition Wrapper (App Router)

Create `src/components/layout/page-transition.tsx`:

```tsx
'use client'

import { motion } from 'framer-motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      {children}
    </motion.div>
  )
}
```

Wrap each `page.tsx` return value with `<PageTransition>`.

### Modal Dialog Entrance (shadcn Dialog override)

```tsx
// Framer Motion variants for the dialog content
const dialogVariants = {
  hidden:  { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1,    y: 0 },
  exit:    { opacity: 0, scale: 0.96, y: 8 },
}

<motion.div
  variants={dialogVariants}
  initial="hidden"
  animate="visible"
  exit="exit"
  transition={{ duration: 0.2, ease: 'easeOut' }}
>
  {/* dialog content */}
</motion.div>
```

### Stagger Children (Grid Items entering)

```tsx
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-3 gap-6"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={itemVariants}>
      {/* card */}
    </motion.div>
  ))}
</motion.div>
```

---

## 11. ACCESSIBILITY — REDUCED MOTION

Always respect user's system preference for reduced motion.
Wrap animation-heavy components with this check:

```tsx
'use client'

import { useReducedMotion } from 'framer-motion'

export function AnimatedSection() {
  const prefersReduced = useReducedMotion()

  // For Framer Motion — pass reduced variants
  const variants = prefersReduced
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }   // no movement
    : { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }

  return <motion.div variants={variants}>{/* ... */}</motion.div>
}
```

For GSAP, check the media query manually:

```tsx
useGSAP(() => {
  const prefersReduced = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  if (prefersReduced) {
    // Just show elements without animation
    gsap.set('.reveal-item', { opacity: 1, y: 0 })
    return
  }

  // Full animation
  gsap.fromTo('.reveal-item', { opacity: 0, y: 24 }, { opacity: 1, y: 0, stagger: 0.1 })
}, { scope: containerRef })
```

---

## 12. WHICH LIBRARY FOR WHICH COMPONENT

| Component | Library | Reason |
|---|---|---|
| Hero parallax background | GSAP + ScrollTrigger | DOM-level scrub, not React state |
| Stats counter (0 → 500+) | GSAP | Precise number interpolation |
| Section scroll reveals | GSAP + ScrollTrigger | Scroll-based trigger |
| Sponsor strip marquee | CSS @keyframes | No JS needed, smoother |
| Navbar scroll opacity | GSAP + ScrollTrigger | DOM style mutation on scroll |
| Card hover lift | Framer Motion | React whileHover prop |
| Admin edit drawer | Framer Motion | AnimatePresence exit animation |
| Page transitions | Framer Motion | React tree level |
| Modals / dialogs | Framer Motion | AnimatePresence |
| Grid item stagger | Framer Motion | React component lifecycle |
| Mobile menu drawer | Framer Motion | AnimatePresence exit |

---

## 13. WHAT NOT TO DO

```tsx
// ❌ Never use useEffect with GSAP
useEffect(() => {
  gsap.to('.box', { opacity: 1 }) // no cleanup = memory leak
}, [])

// ❌ Never register plugins inside a component or useGSAP
useGSAP(() => {
  gsap.registerPlugin(ScrollTrigger) // wrong — register at file top
})

// ❌ Never run GSAP in a Server Component
// Any file using gsap must start with 'use client'

// ❌ Never animate the same element with both GSAP and Framer Motion
// Pick one per element

// ❌ Never hardcode colors in GSAP — use CSS variables
gsap.to('.box', { backgroundColor: '#10B981' }) // wrong
gsap.to('.box', { backgroundColor: 'var(--color-nbac-emerald)' }) // correct
// OR use Tailwind class toggles instead of GSAP color animations

// ❌ Never use GSAP for card hover effects — that's Framer Motion territory
// ❌ Never use Framer Motion for scroll-scrub parallax — that's GSAP territory
```