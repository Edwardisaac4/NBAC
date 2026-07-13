'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import type { Speaker } from '@/types'
import { cn } from '@/lib/utils'

function Linkedin(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

interface SpeakerCardProps {
  speaker: Speaker
}

export function SpeakerCard({ speaker }: SpeakerCardProps) {
  const isConfirmed = speaker.status === 'confirmed'

  return (
    <motion.div
      whileHover={isConfirmed ? { y: -4 } : {}}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={cn(
        'bg-nbac-panel border rounded-xl overflow-hidden flex flex-col',
        isConfirmed
          ? 'border-nbac-border hover:border-nbac-emerald/40'
          : 'border-nbac-border opacity-60'
      )}
    >

      {/* AVATAR */}
      <div className="relative w-full aspect-[4/3] bg-nbac-alt overflow-hidden">
        {isConfirmed && speaker.avatar_url ? (
          <Image
            src={speaker.avatar_url}
            alt={speaker.name}
            fill
            className="object-cover object-top"
          />
        ) : (
          /* PLACEHOLDER — initials or silhouette */
          <div className="w-full h-full flex items-center justify-center">
            {isConfirmed ? (
              /* Confirmed but no photo yet — initials */
              <div className="w-20 h-20 rounded-full bg-nbac-canvas border border-nbac-border
                              flex items-center justify-center">
                <span className="font-display text-2xl font-bold text-nbac-emerald-light">
                  {speaker.name.charAt(0)}
                </span>
              </div>
            ) : (
              /* TBC — question mark */
              <div className="w-20 h-20 rounded-full bg-nbac-canvas border border-dashed
                              border-nbac-border flex items-center justify-center">
                <span className="font-sans text-2xl text-nbac-muted">?</span>
              </div>
            )}
          </div>
        )}

        {/* DAY BADGE — top right corner */}
        <div className="absolute top-3 right-3">
          <span className={cn(
            'font-sans text-xs font-medium px-2 py-1 rounded-full',
            speaker.session_day === 'day_1'
              ? 'bg-nbac-emerald/15 text-nbac-emerald'
              : 'bg-indigo-500/15 text-indigo-400'
          )}>
            {speaker.session_day === 'day_1' ? 'Day 1' : 'Day 2'}
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-5 flex flex-col flex-1">

        {/* NAME */}
        <h3 className={cn(
          'font-sans font-semibold leading-tight mb-0.5',
          isConfirmed ? 'text-nbac-text text-base' : 'text-nbac-muted text-base'
        )}>
          {speaker.name}
        </h3>

        {/* TITLE + ORG */}
        {isConfirmed && (
          <p className="font-sans text-xs text-nbac-muted mb-4 leading-snug">
            {speaker.title}
            {speaker.organisation && speaker.organisation !== 'TBC' && (
              <> · <span className="text-nbac-emerald-light">{speaker.organisation}</span></>
            )}
          </p>
        )}

        {/* SESSION INFO */}
        <div className="mt-auto pt-4 border-t border-nbac-border">
          <p className="font-sans text-xs text-nbac-muted uppercase tracking-wide mb-1">
            {speaker.session_time}
          </p>
          <p className="font-sans text-xs text-nbac-body font-medium leading-snug">
            {speaker.session_title}
          </p>
          {speaker.topic && (
            <p className="font-sans text-xs text-nbac-muted mt-0.5">
              {speaker.topic}
            </p>
          )}
        </div>

        {/* LINKEDIN ICON — only for confirmed speakers with a link */}
        {isConfirmed && speaker.linkedin_url && (
          <a
            href={speaker.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-nbac-muted
                       hover:text-nbac-emerald transition-colors text-xs font-sans"
          >
            <Linkedin className="h-3.5 w-3.5" />
            LinkedIn
          </a>
        )}
      </div>

    </motion.div>
  )
}
