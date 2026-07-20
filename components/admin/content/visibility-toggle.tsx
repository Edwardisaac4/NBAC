'use client'

import React from 'react'
import { FileEdit, Globe, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PostVisibility } from '@/types'

interface VisibilityToggleProps {
  value: PostVisibility
  onChange: (v: PostVisibility) => void
}

export function VisibilityToggle({ value, onChange }: VisibilityToggleProps) {
  return (
    <div className="space-y-2">
      <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text block">
        Publication Status
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Draft Card */}
        <button
          type="button"
          onClick={() => onChange('draft')}
          className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative',
            value === 'draft'
              ? 'bg-nbac-amber/10 border-nbac-amber shadow-sm shadow-nbac-amber/10'
              : 'bg-nbac-canvas border-nbac-border hover:border-nbac-body'
          )}
        >
          <div className={cn(
            'p-2 rounded-lg mt-0.5 shrink-0',
            value === 'draft' ? 'bg-nbac-amber/20 text-nbac-amber' : 'bg-nbac-deep text-nbac-muted'
          )}>
            <FileEdit className="h-4 w-4" />
          </div>
          <div className="pr-4">
            <span className={cn(
              'font-sans text-sm font-semibold block leading-tight',
              value === 'draft' ? 'text-nbac-amber' : 'text-nbac-text'
            )}>
              Save as Draft
            </span>
            <span className="font-sans text-xs text-nbac-muted mt-1 block leading-normal">
              Visible only inside the admin studio. Hidden from the public website.
            </span>
          </div>
          {value === 'draft' && (
            <CheckCircle2 className="h-4 w-4 text-nbac-amber absolute top-3.5 right-3.5 shrink-0" />
          )}
        </button>

        {/* Published Card */}
        <button
          type="button"
          onClick={() => onChange('published')}
          className={cn(
            'flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all cursor-pointer relative',
            value === 'published'
              ? 'bg-nbac-emerald/10 border-nbac-emerald shadow-sm shadow-nbac-emerald/10'
              : 'bg-nbac-canvas border-nbac-border hover:border-nbac-body'
          )}
        >
          <div className={cn(
            'p-2 rounded-lg mt-0.5 shrink-0',
            value === 'published' ? 'bg-nbac-emerald/20 text-nbac-emerald' : 'bg-nbac-deep text-nbac-muted'
          )}>
            <Globe className="h-4 w-4" />
          </div>
          <div className="pr-4">
            <span className={cn(
              'font-sans text-sm font-semibold block leading-tight',
              value === 'published' ? 'text-nbac-emerald' : 'text-nbac-text'
            )}>
              Publish Immediately
            </span>
            <span className="font-sans text-xs text-nbac-muted mt-1 block leading-normal">
              Live on the public website for delegates and media to read right now.
            </span>
          </div>
          {value === 'published' && (
            <CheckCircle2 className="h-4 w-4 text-nbac-emerald absolute top-3.5 right-3.5 shrink-0" />
          )}
        </button>
      </div>
    </div>
  )
}
