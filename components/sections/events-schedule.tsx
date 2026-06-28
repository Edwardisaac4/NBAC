'use client'

import { useState, useRef, useMemo } from 'react'
import { EventSession, Speaker, SessionCategory, ConferenceDay } from '@/types'
import { SpeakerDialog } from '../shared/speaker-dialog'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Clock, MapPin, Filter, Calendar, Award } from 'lucide-react'
import Image from 'next/image'

gsap.registerPlugin(ScrollTrigger)

const categories: { label: string; value: SessionCategory | 'all' }[] = [
  { label: 'All Sessions', value: 'all' },
  { label: 'Keynotes', value: 'keynote' },
  { label: 'Panels', value: 'panel' },
  { label: 'Workshops', value: 'workshop' },
  { label: 'Networking', value: 'networking' },
  { label: 'Breaks', value: 'break' },
]

interface EventsScheduleProps {
  sessions: EventSession[]
  eventId: string
}

export function EventsSchedule({ sessions, eventId }: EventsScheduleProps) {
  // Determine available days dynamically from passed sessions
  const availableDays = useMemo(() => {
    const days = sessions.reduce<ConferenceDay[]>((acc, s) => {
      if (!acc.includes(s.day)) acc.push(s.day)
      return acc
    }, [])
    // Keep sorted
    return days.sort()
  }, [sessions])

  const [activeDay, setActiveDay] = useState<ConferenceDay>(() => {
    const days = sessions.reduce<ConferenceDay[]>((acc, s) => {
      if (!acc.includes(s.day)) acc.push(s.day)
      return acc
    }, [])
    days.sort()
    return days[0] || 'day_1'
  })
  const [activeCategory, setActiveCategory] = useState<SessionCategory | 'all'>('all')
  const [starredSessions, setStarredSessions] = useState<string[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const storageKey = `nbac-starred-sessions-${eventId}`
      const saved = localStorage.getItem(storageKey)
      return saved ? JSON.parse(saved) : []
    } catch (e) {
      console.error("Failed to load starred sessions", e)
      return []
    }
  })
  const [showStarredOnly, setShowStarredOnly] = useState(false)
  const [selectedSpeaker, setSelectedSpeaker] = useState<Speaker | null>(null)
  const [isSpeakerModalOpen, setIsSpeakerModalOpen] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Toggle star status
  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent card click
    
    let updated = [...starredSessions]
    if (starredSessions.includes(id)) {
      updated = updated.filter(sid => sid !== id)
    } else {
      updated.push(id)
    }
    
    setStarredSessions(updated)
    try {
      const storageKey = `nbac-starred-sessions-${eventId}`
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save starred sessions", e)
    }
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    // If only one day is available, skip day checking to make single-day events work seamlessly
    const dayMatch = availableDays.length <= 1 || session.day === activeDay
    const categoryMatch = activeCategory === 'all' || session.category === activeCategory
    const starMatch = !showStarredOnly || starredSessions.includes(session.id)
    return dayMatch && categoryMatch && starMatch
  })

  // GSAP animations for sessions reveal
  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches

      if (prefersReduced) {
        gsap.set('.reveal-session', { opacity: 1, y: 0 })
        return
      }

      // Re-trigger scroll reveal when filters change
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === listRef.current) {
          trigger.kill()
        }
      })

      // Animate entering cards
      gsap.fromTo(
        '.reveal-session',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.65,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: listRef.current,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        }
      )
    },
    { scope: containerRef, dependencies: [activeDay, activeCategory, showStarredOnly, starredSessions.length, sessions] }
  )

  const handleSpeakerClick = (speaker: Speaker, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedSpeaker(speaker)
    setIsSpeakerModalOpen(true)
  }

  // Helper for category badge styles
  const getCategoryStyles = (cat: SessionCategory) => {
    switch (cat) {
      case 'keynote':
        return 'bg-nbac-emerald/10 text-nbac-emerald border border-nbac-emerald/20'
      case 'panel':
        return 'bg-nbac-amber/10 text-nbac-amber border border-nbac-amber/20'
      case 'workshop':
        return 'bg-nbac-emerald-light/10 text-nbac-emerald-light border border-nbac-emerald-light/20'
      case 'networking':
        return 'bg-nbac-emerald/10 text-nbac-emerald border border-nbac-emerald/20'
      case 'break':
      default:
        return 'bg-nbac-muted/10 text-nbac-muted border border-nbac-border'
    }
  }

  // Helper for border-left styles
  const getCardBorder = (cat: SessionCategory) => {
    switch (cat) {
      case 'keynote':
        return 'border-l-nbac-emerald'
      case 'panel':
        return 'border-l-nbac-amber'
      case 'workshop':
        return 'border-l-nbac-emerald-light'
      case 'networking':
        return 'border-l-nbac-emerald'
      case 'break':
      default:
        return 'border-l-nbac-muted'
    }
  }

  return (
    <section ref={containerRef} className="py-16 md:py-24 px-6 md:px-24 max-w-7xl mx-auto bg-nbac-canvas text-nbac-text relative z-20">
      {/* Interactive Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-nbac-border pb-8">
        
        {/* Day Selector Tabs (Only show if event spans multiple days) */}
        {availableDays.length > 1 ? (
          <div className="flex bg-nbac-panel/30 border border-nbac-border p-1 rounded-full w-max shadow-inner">
            <button
              onClick={() => { setActiveDay('day_1'); setShowStarredOnly(false); }}
              className={`relative px-6 py-2.5 rounded-full font-sans text-xs md:text-sm uppercase tracking-wider font-semibold transition-colors duration-300 cursor-pointer outline-none select-none ${
                activeDay === 'day_1' ? 'text-white' : 'text-nbac-muted hover:text-nbac-text'
              }`}
            >
              {activeDay === 'day_1' && (
                <motion.div
                  layoutId="activeDayBg"
                  className="absolute inset-0 bg-nbac-emerald rounded-full shadow-md shadow-nbac-emerald/25"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">Day 1</span>
            </button>
            
            <button
              onClick={() => { setActiveDay('day_2'); setShowStarredOnly(false); }}
              className={`relative px-6 py-2.5 rounded-full font-sans text-xs md:text-sm uppercase tracking-wider font-semibold transition-colors duration-300 cursor-pointer outline-none select-none ${
                activeDay === 'day_2' ? 'text-white' : 'text-nbac-muted hover:text-nbac-text'
              }`}
            >
              {activeDay === 'day_2' && (
                <motion.div
                  layoutId="activeDayBg"
                  className="absolute inset-0 bg-nbac-emerald rounded-full shadow-md shadow-nbac-emerald/25"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className="relative z-10">Day 2</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Calendar className="text-nbac-emerald w-5 h-5 shrink-0" />
            <span className="font-sans text-xs md:text-sm uppercase tracking-widest font-semibold text-nbac-emerald-light">
              EVENT ITINERARY
            </span>
          </div>
        )}

        {/* Personalized Agenda Star Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowStarredOnly(!showStarredOnly)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-xs uppercase tracking-wider font-semibold transition-all duration-300 cursor-pointer select-none ${
              showStarredOnly 
                ? 'bg-nbac-emerald/15 border-nbac-emerald text-nbac-emerald shadow-lg shadow-nbac-emerald/10' 
                : 'bg-nbac-panel/30 border-nbac-border text-nbac-body hover:text-nbac-emerald hover:border-nbac-emerald/50'
            }`}
          >
            <Star size={14} className={showStarredOnly ? "fill-nbac-emerald text-nbac-emerald animate-pulse" : ""} />
            <span>My Schedule ({starredSessions.length})</span>
          </button>
        </div>
      </div>

      {/* Category Filters Row (Only show if not in Starred view) */}
      {!showStarredOnly && (
        <div className="flex flex-wrap items-center gap-2 mb-10 overflow-x-auto pb-2 scrollbar-none">
          <Filter size={12} className="text-nbac-muted mr-2 hidden sm:inline" />
          {categories.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full border font-sans text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer select-none whitespace-nowrap ${
                activeCategory === cat.value
                  ? 'bg-nbac-text text-nbac-canvas border-nbac-text shadow-md'
                  : 'bg-nbac-panel/20 border-nbac-border text-nbac-body hover:text-nbac-text hover:border-nbac-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      )}

      {/* Schedule Timeline Grid */}
      <div className="relative">
        {/* Vertical Timeline Guide Line */}
        <div className="absolute left-[39px] md:left-[119px] top-4 bottom-4 w-[1px] bg-nbac-border pointer-events-none hidden sm:block" />

        {/* Sessions list */}
        <div ref={listRef} className="flex flex-col gap-6 md:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => {
                const isStarred = starredSessions.includes(session.id)
                return (
                  <motion.div
                    key={session.id}
                    layout
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="reveal-session flex flex-col sm:flex-row gap-4 md:gap-8 relative group"
                  >
                    {/* Time Slot Display */}
                    <div className="sm:w-20 md:w-28 shrink-0 flex sm:flex-col items-start sm:items-end justify-between sm:justify-start pt-1">
                      <div className="flex items-center gap-1.5 text-nbac-text font-display text-base md:text-lg font-bold">
                        <Clock size={14} className="text-nbac-emerald-light sm:hidden" />
                        <span>{session.start_time}</span>
                      </div>
                      <span className="font-sans text-xs text-nbac-muted mt-0.5">{session.end_time}</span>
                    </div>

                    {/* Timeline Circle Bullet (Desktop) */}
                    <div className="absolute left-[35px] md:left-[115px] top-[10px] w-[9px] h-[9px] rounded-full border border-nbac-border bg-nbac-canvas group-hover:border-nbac-emerald group-hover:bg-nbac-emerald transition-all duration-300 hidden sm:block z-10" />

                    {/* Session Card Detail */}
                    <div
                      className={`flex-1 bg-nbac-panel/40 border border-nbac-border ${getCardBorder(session.category)} border-l-4 rounded-xl p-5 md:p-6 backdrop-blur-md transition-all duration-300 hover:border-nbac-emerald/30 shadow-lg`}
                      style={{
                        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)'
                      }}
                    >
                      {/* Card Header: Category & Action */}
                      <div className="flex items-center justify-between gap-4 mb-3">
                        <span className={`text-[10px] md:text-xs font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${getCategoryStyles(session.category)}`}>
                          {session.category}
                        </span>

                        {/* Star agenda action with micro-animations */}
                        <button
                          onClick={(e) => toggleStar(session.id, e)}
                          className="w-8 h-8 rounded-full bg-nbac-canvas/50 hover:bg-nbac-canvas border border-nbac-border hover:border-nbac-emerald/40 text-nbac-muted hover:text-nbac-emerald flex items-center justify-center transition-all duration-300 cursor-pointer select-none"
                          aria-label={isStarred ? "Remove from Schedule" : "Add to Schedule"}
                        >
                          <motion.span
                            animate={isStarred ? { scale: [1, 1.25, 1] } : {}}
                            transition={{ duration: 0.3 }}
                          >
                            <Star 
                              size={14} 
                              className={isStarred ? "fill-nbac-emerald text-nbac-emerald" : "text-nbac-muted"} 
                            />
                          </motion.span>
                        </button>
                      </div>

                      {/* Session Title */}
                      <h3 className="font-sans text-base md:text-lg font-bold text-nbac-text leading-snug mb-2 group-hover:text-glow transition-all">
                        {session.title}
                      </h3>

                      {/* Session Abstract */}
                      {session.abstract && (
                        <p className="font-sans text-xs md:text-sm font-light text-nbac-body leading-relaxed mb-4">
                          {session.abstract}
                        </p>
                      )}

                      {/* Session Meta: Location & Speakers */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-nbac-border/60">
                        {/* Location */}
                        {session.location && (
                          <div className="flex items-center gap-1.5 text-xs text-nbac-muted">
                            <MapPin size={12} className="text-nbac-emerald" />
                            <span>{session.location}</span>
                          </div>
                        )}

                        {/* Speakers Chips */}
                        {session.speakers.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] uppercase tracking-wider text-nbac-muted font-bold mr-1">Speakers:</span>
                            {session.speakers.map(speaker => (
                              <button
                                key={speaker.id}
                                onClick={(e) => handleSpeakerClick(speaker, e)}
                                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-nbac-canvas border border-nbac-border hover:border-nbac-emerald/30 text-nbac-text hover:text-nbac-emerald font-sans text-xs transition-all duration-200 cursor-pointer select-none group/chip"
                              >
                                {speaker.avatar_url && (
                                  <div className="relative w-5 h-5 rounded-full overflow-hidden shrink-0 border border-nbac-border/50">
                                    <Image
                                      src={speaker.avatar_url}
                                      alt={speaker.name}
                                      fill
                                      className="object-cover"
                                      sizes="20px"
                                    />
                                  </div>
                                )}
                                <span className="font-medium text-[11px]">{speaker.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-16 bg-nbac-panel/10 border border-dashed border-nbac-border rounded-2xl"
              >
                <Award size={48} className="mx-auto text-nbac-muted/40 mb-3" />
                <h4 className="font-sans text-base font-semibold text-nbac-text mb-1">
                  {showStarredOnly ? "Your Schedule is Empty" : "No sessions found"}
                </h4>
                <p className="font-sans text-xs text-nbac-muted max-w-xs mx-auto">
                  {showStarredOnly 
                    ? "Click the star icon on any session card to add it to your personal planner."
                    : "Adjust your filters or switch days to browse the agenda."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Speaker Bio Detailed Modal */}
      <SpeakerDialog
        speaker={selectedSpeaker}
        sessions={sessions}
        isOpen={isSpeakerModalOpen}
        onClose={() => setIsSpeakerModalOpen(false)}
      />
    </section>
  )
}
