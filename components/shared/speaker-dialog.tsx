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
            className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-2xl bg-nbac-panel/95 border border-nbac-border rounded-xl shadow-2xl overflow-hidden z-10 glass-card"
            style={{
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(197, 160, 89, 0.1)'
            }}
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-nbac-gold/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-nbac-gold/5 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-nbac-canvas/40 hover:bg-nbac-canvas/80 text-nbac-text hover:text-nbac-gold flex items-center justify-center transition-all duration-200 cursor-pointer"
              aria-label="Close Dialog"
            >
              <X size={18} />
            </button>

            {/* Content Scroll Area */}
            <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start mb-6 border-b border-nbac-border pb-6">
                {/* Speaker Portrait */}
                <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-xl overflow-hidden border border-nbac-border shrink-0 bg-nbac-deep shadow-md">
                  {speaker.avatar_url ? (
                    <Image
                      src={speaker.avatar_url}
                      alt={speaker.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 224px, 256px"
                      quality={90}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-nbac-gold/10 text-nbac-gold text-3xl font-display font-semibold">
                      {speaker.name.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Name & Title */}
                <div className="text-center md:text-left flex flex-col justify-center">
                  <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-gold mb-1">
                    FEATURED SPEAKER
                  </span>
                  <h3 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight mb-2">
                    {speaker.name}
                  </h3>
                  <p className="font-sans text-sm md:text-base font-semibold text-nbac-body">
                    {speaker.title}
                  </p>
                  <p className="font-sans text-xs uppercase tracking-wider text-nbac-muted font-medium mt-1">
                    {speaker.company || speaker.organisation}
                  </p>
                </div>
              </div>

              {/* Bio Section */}
              <div className="mb-8">
                <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-muted mb-3">
                  BIOGRAPHY
                </h4>
                <p className="font-sans text-sm md:text-base font-light text-nbac-body leading-relaxed">
                  {speaker.bio || "Biography details are being finalized. Check back soon for more information."}
                </p>
              </div>

              {/* Speaker Sessions Schedule */}
              {speakerSessions.length > 0 && (
                <div>
                  <h4 className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-muted mb-4">
                    SESSIONS & PRESENTATIONS
                  </h4>
                  <div className="flex flex-col gap-3">
                    {speakerSessions.map(session => (
                      <div 
                        key={session.id} 
                        className="p-4 rounded-lg bg-nbac-canvas/50 border border-nbac-border border-l-4 border-l-nbac-gold hover:border-l-nbac-gold-light transition-all"
                      >
                        <span className="inline-block bg-nbac-gold/15 text-nbac-gold text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm mb-2">
                          {session.category}
                        </span>
                        <h5 className="font-sans text-sm font-semibold text-nbac-text leading-tight mb-2">
                          {session.title}
                        </h5>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-nbac-muted">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} className="text-nbac-gold-light" />
                            {formatDayName(session.day)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} className="text-nbac-gold-light" />
                            {session.start_time} - {session.end_time}
                          </span>
                          {session.location && (
                            <span className="flex items-center gap-1">
                              <MapPin size={12} className="text-nbac-gold-light" />
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
