'use client'

import { Speaker, EventSession } from "@/types"
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Clock, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useEffect } from 'react'

interface SpeakerDialogProps {
  speaker: Speaker | null
  sessions: EventSession[]
  isOpen: boolean
  onClose: () => void
}

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 16 },
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export function SpeakerDialog({ speaker, sessions, isOpen, onClose }: SpeakerDialogProps) {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!speaker) return null

  // Find sessions where this speaker is presenting
  const speakerSessions = sessions.filter(session => 
    session.speakers.some(s => s.id === speaker.id)
  )

  const formatDayName = (day: string) => {
    return day === 'day_1' ? 'Day 1 (Tuesday, May 4)' : 'Day 2 (Wednesday, May 5)'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop Scrim */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Modal Container */}
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-3xl bg-nbac-panel/95 border border-nbac-gold/30 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.85)] overflow-hidden z-10 backdrop-blur-2xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-nbac-gold/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-nbac-emerald/15 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-30 w-10 h-10 rounded-full bg-black/50 border border-nbac-gold/40 text-nbac-muted hover:text-nbac-gold hover:bg-black/90 hover:scale-105 flex items-center justify-center transition-all duration-300 cursor-pointer shadow-lg"
              aria-label="Close Dialog"
            >
              <X size={18} />
            </button>

            {/* Content Scroll Area */}
            <div className="max-h-[85vh] overflow-y-auto p-6 md:p-10 space-y-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start border-b border-nbac-border/60 pb-8">
                {/* Speaker Portrait */}
                <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden border-2 border-nbac-gold/40 shrink-0 bg-nbac-deep shadow-xl group">
                  {speaker.avatar_url ? (
                    <Image
                      src={speaker.avatar_url}
                      alt={speaker.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 224px, 256px"
                      quality={95}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-nbac-gold/10 text-nbac-gold text-4xl font-display font-semibold">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="text-center md:text-left flex flex-col justify-center space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="h-2 w-2 rounded-full bg-nbac-gold animate-pulse" />
                    <span className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-gold">
                      Featured Speaker
                    </span>
                  </div>
                  <h3 className="font-display text-2xl md:text-4xl font-bold text-nbac-text tracking-tight">
                    {speaker.name}
                  </h3>
                  <p className="font-sans text-sm md:text-base font-medium text-nbac-gold-light">
                    {speaker.title}
                  </p>
                  {(speaker.company || speaker.organisation) && (
                    <span className="inline-flex items-center self-center md:self-start px-3 py-0.5 rounded-full bg-nbac-canvas border border-nbac-border text-xs text-nbac-muted font-medium">
                      {speaker.company || speaker.organisation}
                    </span>
                  )}
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-3">
                <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-gold">
                  Biography
                </h4>
                <div className="font-sans text-sm md:text-base font-light text-nbac-body/90 leading-relaxed space-y-3">
                  {speaker.bio ? (
                    speaker.bio.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx}>{paragraph.trim()}</p>
                    ))
                  ) : (
                    <p className="italic text-nbac-muted">Biography details are currently being finalized.</p>
                  )}
                </div>
              </div>

              {/* Speaker Sessions Schedule */}
              {speakerSessions.length > 0 && (
                <div className="pt-4 border-t border-nbac-border/60">
                  <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-gold mb-4">
                    Sessions & Presentations
                  </h4>
                  <div className="flex flex-col gap-3">
                    {speakerSessions.map(session => (
                      <div 
                        key={session.id} 
                        className="p-5 rounded-2xl bg-nbac-canvas/60 border border-nbac-border border-l-4 border-l-nbac-gold hover:border-l-nbac-gold-light transition-all shadow-md"
                      >
                        <span className="inline-block bg-nbac-gold/15 text-nbac-gold text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full mb-2">
                          {session.category}
                        </span>
                        <h5 className="font-sans text-base font-semibold text-nbac-text leading-tight mb-2">
                          {session.title}
                        </h5>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-nbac-muted">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={13} className="text-nbac-gold" />
                            {formatDayName(session.day)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-nbac-gold" />
                            {session.start_time} - {session.end_time}
                          </span>
                          {session.location && (
                            <span className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-nbac-gold" />
                              {session.location}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
