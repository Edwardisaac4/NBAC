'use client'

import { useRef } from 'react'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { SectionBlur } from "@/components/shared/section-blur"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { MOCK_EVENTS } from "@/lib/mock-events"
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, MapPin, ChevronRight, Compass } from 'lucide-react'

export default function EventsCatalogPage() {
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set(['.catalog-eyebrow', '.catalog-title', '.catalog-desc', '.event-card'], {
          opacity: 1,
          y: 0,
          scale: 1
        })
        return
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo('.catalog-eyebrow',
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8 }
      )

      tl.fromTo('.catalog-title',
        { opacity: 0, y: 40, rotateX: 6 },
        { opacity: 1, y: 0, rotateX: 0, duration: 1 },
        '-=0.6'
      )

      tl.fromTo('.catalog-desc',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.8 },
        '-=0.7'
      )

      tl.fromTo('.event-card',
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: 'power3.out'
        },
        '-=0.5'
      )
    },
    { scope: containerRef }
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'featured':
        return (
          <span className="bg-nbac-emerald/15 text-nbac-emerald border border-nbac-emerald/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Featured Event
          </span>
        )
      case 'upcoming':
        return (
          <span className="bg-nbac-amber/15 text-nbac-amber border border-nbac-amber/20 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Upcoming
          </span>
        )
      case 'completed':
      default:
        return (
          <span className="bg-nbac-muted/15 text-nbac-muted border border-nbac-border text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Completed
          </span>
        )
    }
  }

  return (
    <PageTransition>
      <Navbar />

      <main 
        ref={containerRef}
        className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-linear-to-b from-nbac-emerald/10 to-transparent blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <section className="relative z-10 px-6 md:px-24 max-w-7xl mx-auto text-center py-12 md:py-16">
          <div className="catalog-eyebrow opacity-0">
            <SectionEyebrow className="text-center justify-center">
              NBAC CONFERENCES & SUMMITS
            </SectionEyebrow>
          </div>
          
          <h1 className="catalog-title opacity-0 font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Explore Our <span className="text-transparent bg-clip-text bg-linear-to-r from-nbac-text via-nbac-text to-nbac-emerald dark:from-white dark:via-nbac-text dark:to-nbac-emerald text-glow">Events Calendar</span>
          </h1>
          
          <p className="catalog-desc opacity-0 font-sans text-base md:text-lg font-light text-nbac-body max-w-2xl mx-auto leading-relaxed">
            Discover West Africa&apos;s most exclusive business aviation meetings, masterclass workshops, and executive gala events. Click any event to view its full schedule program.
          </p>
        </section>

        {/* Events Catalog Grid */}
        <SectionBlur>
          <section className="relative z-10 px-6 md:px-24 max-w-7xl mx-auto pb-24">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {MOCK_EVENTS.map(event => (
                <motion.div
                  key={event.id}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="event-card opacity-0 flex flex-col bg-nbac-panel/40 border border-nbac-border rounded-xl overflow-hidden glass-card"
                  style={{
                    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  {/* Event Thumbnail */}
                  <div className="relative h-48 md:h-52 w-full bg-nbac-deep overflow-hidden group">
                    {event.image_url ? (
                      <Image
                        src={event.image_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-nbac-panel text-nbac-muted">
                        <Compass className="w-12 h-12" />
                      </div>
                    )}
                    {/* Status Overlay */}
                    <div className="absolute top-4 left-4 z-10">
                      {getStatusBadge(event.status)}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <span className="font-sans text-[10px] uppercase tracking-widest font-semibold text-nbac-emerald mb-1 block">
                        {event.subtitle}
                      </span>
                      <h3 className="font-sans text-lg md:text-xl font-bold text-nbac-text mb-4 leading-tight">
                        {event.title}
                      </h3>
                      <p className="font-sans text-xs md:text-sm font-light text-nbac-body leading-relaxed mb-6">
                        {event.description}
                      </p>
                    </div>

                    {/* Metadata and Link */}
                    <div className="pt-4 border-t border-nbac-border/60">
                      <div className="flex flex-col gap-2 mb-6">
                        <div className="flex items-center gap-2 text-xs text-nbac-muted">
                          <Calendar size={14} className="text-nbac-emerald-light shrink-0" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-nbac-muted">
                          <MapPin size={14} className="text-nbac-emerald-light shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>

                      <Link 
                        href={`/events/${event.id}`}
                        className="w-full text-center flex items-center justify-center gap-2 bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-semibold py-3 px-5 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-md shadow-nbac-emerald/10 cursor-pointer"
                      >
                        <span>View Program Schedule</span>
                        <ChevronRight size={14} />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </SectionBlur>
      </main>

      <Footer />
    </PageTransition>
  )
}
