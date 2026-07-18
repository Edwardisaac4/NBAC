'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Search, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SeoPanelProps {
  metaTitle: string
  onMetaTitleChange: (v: string) => void
  metaDescription: string
  onMetaDescriptionChange: (v: string) => void
  focusKeyword: string
  onFocusKeywordChange: (v: string) => void
  postTitle: string
}

export function SeoPanel({
  metaTitle,
  onMetaTitleChange,
  metaDescription,
  onMetaDescriptionChange,
  focusKeyword,
  onFocusKeywordChange,
  postTitle,
}: SeoPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const displayTitle = metaTitle.trim() || postTitle.trim() || 'Post Title - NBAC 2027'
  const displayDesc = metaDescription.trim() || 'No description provided. Search engines will generate a snippet from the opening paragraphs of your post automatically.'

  return (
    <div className="border border-nbac-border rounded-xl bg-nbac-canvas overflow-hidden">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-nbac-panel/50 transition-colors text-left cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Search className="h-4 w-4 text-nbac-emerald" />
          <div>
            <span className="font-sans text-sm font-semibold text-nbac-text block">
              Search Engine Optimization (SEO)
            </span>
            <span className="font-sans text-xs text-nbac-muted">
              Customize how this article appears in Google results and social media shares
            </span>
          </div>
        </div>
        <div className="text-nbac-muted">
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="p-5 border-t border-nbac-border space-y-5 bg-nbac-deep/30">
          
          {/* Live Search Preview Card */}
          <div className="bg-[#171717] border border-[#303030] rounded-lg p-4 space-y-1 font-sans">
            <div className="flex items-center gap-1.5 text-xs text-[#9aa0a6]">
              <span className="font-medium text-white">nbac.com.ng</span>
              <span>› news › articles</span>
            </div>
            <h4 className="text-[#8ab4f8] hover:underline text-base font-medium truncate cursor-pointer leading-tight">
              {displayTitle}
            </h4>
            <p className="text-[#bdc1c6] text-xs leading-relaxed line-clamp-2">
              {displayDesc}
            </p>
          </div>

          {/* Meta Title Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-sans text-xs font-semibold text-nbac-text">
                SEO Headline (Meta Title)
              </label>
              <span className={cn(
                'font-sans text-[11px]',
                metaTitle.length > 60 ? 'text-nbac-amber font-semibold' : 'text-nbac-muted'
              )}>
                {metaTitle.length} / 60 characters recommended
              </span>
            </div>
            <input
              type="text"
              value={metaTitle}
              onChange={(e) => onMetaTitleChange(e.target.value)}
              placeholder={postTitle || 'SEO title for Google...'}
              className="w-full bg-nbac-canvas border border-nbac-border rounded-lg px-3.5 py-2.5 text-sm text-nbac-text placeholder:text-nbac-muted focus:outline-none focus:border-nbac-emerald transition-colors font-sans"
            />
            <p className="font-sans text-[11px] text-nbac-muted">
              Leave blank to automatically use the main article title above.
            </p>
          </div>

          {/* Meta Description Textarea */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-sans text-xs font-semibold text-nbac-text">
                Summary Snippet (Meta Description)
              </label>
              <span className={cn(
                'font-sans text-[11px]',
                metaDescription.length > 160 ? 'text-nbac-amber font-semibold' : 'text-nbac-muted'
              )}>
                {metaDescription.length} / 160 characters recommended
              </span>
            </div>
            <textarea
              rows={3}
              value={metaDescription}
              onChange={(e) => onMetaDescriptionChange(e.target.value)}
              placeholder="Brief, engaging 2-sentence summary of this article to encourage visitors to click from search engines..."
              className="w-full bg-nbac-canvas border border-nbac-border rounded-lg px-3.5 py-2.5 text-sm text-nbac-text placeholder:text-nbac-muted focus:outline-none focus:border-nbac-emerald transition-colors font-sans resize-none"
            />
          </div>

          {/* Focus Keyword */}
          <div className="space-y-1.5">
            <label className="font-sans text-xs font-semibold text-nbac-text flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-nbac-gold" />
              Primary Search Keyword
            </label>
            <input
              type="text"
              value={focusKeyword}
              onChange={(e) => onFocusKeywordChange(e.target.value)}
              placeholder="e.g. business aviation, NBAC 2027, private jet charters"
              className="w-full bg-nbac-canvas border border-nbac-border rounded-lg px-3.5 py-2.5 text-sm text-nbac-text placeholder:text-nbac-muted focus:outline-none focus:border-nbac-emerald transition-colors font-sans"
            />
            <p className="font-sans text-[11px] text-nbac-muted">
              The primary topic phrase or search term delegates would type when looking for this article.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
