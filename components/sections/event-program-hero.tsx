'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SectionEyebrow } from '../shared/section-eyebrow'
import { Calendar, MapPin, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

gsap.registerPlugin(ScrollTrigger)

interface EventProgramHeroProps {
  title: string
  subtitle: string
  date: string
  location: string
}

export function EventProgramHero({ title, subtitle, date, location }: EventProgramHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(['.hero-back-btn', '.hero-eyebrow', '.hero-title', '.hero-subtitle', '.hero-meta'], {
          opacity: 1,
          y: 0
        })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo('.hero-back-btn',
        { opacity: 0, x: -15 },
        { opacity: 1, x: 0, duration: 0.6 }
      )

      tl.fromTo('.hero-eyebrow',
        { opacity: 0, y: -15 },
        { opacity: 1, y: 0, duration: 0.6 },
        '-=0.4'
      )

      tl.fromTo('.hero-title',
        { opacity: 0, y: 30, rotateX: 6 },
        { opacity: 1, y: 0, rotateX: 0, duration: 0.8 },
        '-=0.4'
      )

      tl.fromTo('.hero-subtitle',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )

      tl.fromTo('.hero-meta',
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.7 },
        '-=0.5'
      )
    },
    { scope: containerRef }
  )

  return (
    <section 
      ref={containerRef} 
      className="relative pt-12 md:pt-16 pb-6 px-6 md:px-24 max-w-7xl mx-auto z-10 text-center md:text-left"
    >
      {/* Back Button */}
      <div className="hero-back-btn opacity-0 mb-6 flex justify-center md:justify-start">
        <Link 
          href="/events"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-semibold text-nbac-muted hover:text-nbac-emerald transition-colors cursor-pointer group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      {/* Eyebrow */}
      <div className="hero-eyebrow opacity-0">
        <SectionEyebrow className="mb-2">
          Event Program & Agenda
        </SectionEyebrow>
      </div>

      {/* Main Title */}
      <h1 className="hero-title opacity-0 font-display text-3xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight text-nbac-text mb-3">
        {title}
      </h1>

      {/* Subtitle */}
      <p className="hero-subtitle opacity-0 font-sans text-sm md:text-lg font-light text-nbac-emerald mb-6">
        {subtitle}
      </p>

      {/* Venue & Date Metadata Bar */}
      <div className="hero-meta opacity-0 flex flex-col md:flex-row items-center md:items-start justify-center md:justify-start gap-4 md:gap-8 text-xs md:text-sm text-nbac-muted pt-4 border-t border-nbac-border/60">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-nbac-emerald" />
          <span className="font-semibold text-nbac-body">{date}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-nbac-emerald" />
          <span className="font-semibold text-nbac-body">{location}</span>
        </div>
      </div>
    </section>
  )
}
