'use client'

import { ArrowLeft, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AutoSaveStatus, PostVisibility } from '@/types'

interface StudioTopbarProps {
  autoSaveStatus: AutoSaveStatus
  visibility:     PostVisibility
  isPublishing:   boolean
  onSaveDraft:    () => void
  onPublish:      () => void
  onUnpublish:    () => void
  onBack:         () => void
}

export function StudioTopbar({
  autoSaveStatus, visibility, isPublishing,
  onSaveDraft, onPublish, onUnpublish, onBack,
}: StudioTopbarProps) {
  return (
    <div className="flex items-center justify-between px-6 h-14 bg-nbac-deep
                    border-b border-nbac-border flex-shrink-0 sticky top-0 z-30">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-nbac-muted hover:text-nbac-body
                     font-sans text-sm transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Posts
        </button>
        <div className="h-4 w-px bg-nbac-border" />
        <span className="font-sans text-sm font-medium text-nbac-text">
          Content Studio
        </span>
      </div>

      {/* CENTER — auto-save indicator */}
      <div className="flex items-center gap-1.5 font-sans text-xs">
        {autoSaveStatus === 'saving' && (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-nbac-muted" />
            <span className="text-nbac-muted">Saving...</span>
          </>
        )}
        {autoSaveStatus === 'saved' && (
          <>
            <Check className="h-3 w-3 text-nbac-emerald" />
            <span className="text-nbac-muted">Saved</span>
          </>
        )}
        {autoSaveStatus === 'unsaved' && (
          <span className="text-nbac-amber">Unsaved changes</span>
        )}
      </div>

      {/* RIGHT — status + actions */}
      <div className="flex items-center gap-3">

        {/* Status badge */}
        <span className={cn(
          'font-sans text-xs font-semibold px-3 py-1 rounded-full border',
          visibility === 'published'
            ? 'bg-nbac-emerald/15 text-nbac-emerald border-nbac-emerald/30'
            : 'bg-nbac-amber/10 text-nbac-amber border-nbac-amber/30'
        )}>
          {visibility === 'published' ? 'PUBLISHED' : 'DRAFT'}
        </span>

        {/* Save Draft */}
        <button
          onClick={onSaveDraft}
          className="font-sans text-sm font-medium px-4 py-2 rounded-lg
                     border border-nbac-border text-nbac-body
                     hover:bg-nbac-panel hover:text-nbac-text transition-colors"
        >
          Save Draft
        </button>

        {/* Publish / Unpublish */}
        {visibility === 'published' ? (
          <button
            onClick={onUnpublish}
            className="font-sans text-sm font-medium px-4 py-2 rounded-full
                       border border-nbac-border text-nbac-body
                       hover:border-nbac-danger hover:text-nbac-danger transition-colors"
          >
            Unpublish
          </button>
        ) : (
          <button
            onClick={onPublish}
            disabled={isPublishing}
            className="font-sans text-sm font-medium px-5 py-2 rounded-full
                       bg-nbac-emerald hover:bg-nbac-emerald-dark text-white
                       shadow-lg shadow-nbac-emerald/20 transition-colors
                       disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish Post'}
          </button>
        )}
      </div>
    </div>
  )
}
