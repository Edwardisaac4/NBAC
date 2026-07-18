'use client'

import React from 'react'
import { User, Clock, Calendar, ImageIcon } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { PostTemplate } from '@/types'

interface StudioPreviewProps {
  title:      string
  body:       string
  coverImage: string
  author:     string
  category:   PostTemplate
}

export function StudioPreview({
  title,
  body,
  coverImage,
  author,
  category,
}: StudioPreviewProps) {
  const formatCategoryBadge = (cat: PostTemplate) => {
    switch (cat) {
      case 'announcement':    return 'Announcement'
      case 'press_release':   return 'Press Release'
      case 'visual_showcase': return 'Visual Showcase'
      case 'sponsor_update':  return 'Partner Intelligence'
      case 'event_copy':      return 'Event Update'
      default:                return 'Briefing & Intelligence'
    }
  }

  return (
    <div className="w-[420px] flex-shrink-0 border-l border-nbac-border bg-nbac-panel overflow-y-auto hidden xl:block p-6 select-none">
      <div className="sticky top-0 pb-4 border-b border-nbac-border mb-6 flex items-center justify-between bg-nbac-panel z-10">
        <span className="font-sans text-xs uppercase tracking-widest font-bold text-nbac-emerald">
          Live Public Preview
        </span>
        <span className="font-sans text-[11px] text-nbac-muted bg-nbac-deep px-2.5 py-1 rounded-md border border-nbac-border">
          Desktop View
        </span>
      </div>

      {/* Preview Card simulated like public site /blog/[id] */}
      <div className="bg-nbac-canvas border border-nbac-border rounded-2xl p-6 space-y-6 shadow-xl">
        
        {/* Category badge */}
        <div>
          <span className="bg-nbac-emerald/10 border border-nbac-emerald/20 text-nbac-emerald text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block">
            {formatCategoryBadge(category)}
          </span>
        </div>

        {/* Title */}
        <h2 className="font-display text-2xl md:text-3xl font-bold leading-tight tracking-tight text-nbac-text break-words">
          {title || 'Article Headline Will Appear Right Here...'}
        </h2>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pb-4 border-b border-nbac-border text-nbac-body text-xs font-light">
          <span className="flex items-center gap-1.5">
            <User size={12} className="text-nbac-emerald" />
            {author || 'NBAC Team'}
          </span>
          <span className="text-nbac-muted">•</span>
          <span className="flex items-center gap-1.5">
            <Clock size={12} className="text-nbac-emerald" />
            5 Min Read
          </span>
          <span className="text-nbac-muted">•</span>
          <span className="flex items-center gap-1.5">
            <Calendar size={12} className="text-nbac-emerald" />
            {formatDate(new Date().toISOString())}
          </span>
        </div>

        {/* Cover Image preview */}
        {coverImage ? (
          <div className="relative w-full h-44 rounded-xl overflow-hidden shadow-md border border-nbac-border bg-nbac-deep">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverImage}
              alt="Preview cover"
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-36 rounded-xl border border-dashed border-nbac-border bg-nbac-deep/40 flex flex-col items-center justify-center space-y-1.5 text-nbac-muted">
            <ImageIcon className="h-6 w-6 opacity-40" />
            <span className="font-sans text-[11px] font-medium">No cover image added yet</span>
          </div>
        )}

        {/* Body HTML rendering */}
        <div
          className="prose prose-invert max-w-none text-nbac-body text-xs leading-relaxed break-words
                     [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-nbac-text [&_h2]:mt-4 [&_h2]:mb-2
                     [&_h3]:font-display [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-nbac-text [&_h3]:mt-3 [&_h3]:mb-1
                     [&_p]:mb-3 [&_p]:text-nbac-body
                     [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:mb-3
                     [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:mb-3
                     [&_blockquote]:border-l-2 [&_blockquote]:border-nbac-emerald [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-nbac-muted
                     [&_a]:text-nbac-emerald [&_a]:underline
                     [&_img]:rounded-lg [&_img]:max-h-48 [&_img]:object-cover [&_img]:my-2"
          dangerouslySetInnerHTML={{
            __html: body || '<p className="text-nbac-muted italic">Start typing in the editor on the left to see your content rendered in real-time...</p>',
          }}
        />
      </div>
    </div>
  )
}
