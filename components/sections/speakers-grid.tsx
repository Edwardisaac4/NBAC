'use client'

import { useState } from 'react'
import { SpeakerCard } from '@/components/shared/speaker-card'
import type { Speaker, SessionDay } from '@/types'
import { cn } from '@/lib/utils'

interface SpeakersGridProps {
  speakers: Speaker[]
}

type FilterOption = 'all' | SessionDay

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all',   label: 'All Speakers' },
  { value: 'day_1', label: 'Day 1 — 4 May' },
  { value: 'day_2', label: 'Day 2 — 5 May' },
]

export function SpeakersGrid({ speakers }: SpeakersGridProps) {
  const [activeFilter, setActiveFilter] = useState<FilterOption>('all')

  const filtered = activeFilter === 'all'
    ? speakers
    : speakers.filter((s) => s.session_day && s.session_day === activeFilter)

  const confirmed = filtered.filter((s) => s.status && s.status === 'confirmed')
  const tbc       = filtered.filter((s) => s.status && s.status === 'tbc')

  return (
    <section className="max-w-6xl mx-auto px-6">

      {/* FILTER TAB BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-12">
        <div className="flex items-center gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={cn(
                'font-sans text-sm font-medium px-5 py-2 rounded-full transition-colors cursor-pointer',
                activeFilter === opt.value
                  ? 'bg-nbac-emerald text-white'
                  : 'bg-nbac-panel border border-nbac-border text-nbac-muted hover:text-nbac-body'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Live count */}
        <span className="sm:ml-auto font-sans text-xs text-nbac-muted">
          {confirmed.length} confirmed · {tbc.length} to be announced
        </span>
      </div>

      {/* CONFIRMED SPEAKERS */}
      {confirmed.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {confirmed.map((speaker) => (
            <SpeakerCard key={speaker.id} speaker={speaker} />
          ))}
        </div>
      )}

      {/* TBC SEPARATOR */}
      {tbc.length > 0 && (
        <>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-nbac-border" />
            <span className="font-sans text-xs text-nbac-muted uppercase tracking-widest shrink-0">
              To Be Announced
            </span>
            <div className="flex-1 h-px bg-nbac-border" />
          </div>

          {/* TBC PLACEHOLDER CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tbc.map((speaker) => (
              <SpeakerCard key={speaker.id} speaker={speaker} />
            ))}
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {confirmed.length === 0 && tbc.length === 0 && (
        <div className="text-center py-24">
          <p className="font-sans text-nbac-muted">
            No speakers found for this filter.
          </p>
        </div>
      )}

      {/* MORE COMING BANNER */}
      <div className="mt-20 text-center bg-nbac-panel border border-nbac-border
                      rounded-xl px-8 py-10">
        <p className="font-sans text-nbac-muted text-sm uppercase tracking-widest mb-2">
          SPEAKER ANNOUNCEMENTS ONGOING
        </p>
        <h3 className="font-display text-2xl font-bold text-nbac-text mb-3">
          More speakers to be confirmed
        </h3>
        <p className="font-sans text-nbac-body text-sm max-w-md mx-auto">
          NBAC 2027 will feature 25+ global industry speakers. Sign up to be
          notified as new speakers are announced.
        </p>
      </div>

    </section>
  )
}
