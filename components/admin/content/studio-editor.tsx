'use client'

import React from 'react'
import { RichTextEditor }   from './rich-text-editor'
import { CoverImageUpload } from './cover-image-upload'
import { SeoPanel }         from './seo-panel'
import { VisibilityToggle } from './visibility-toggle'
import type { PostTemplate, PostVisibility } from '@/types'

interface StudioEditorProps {
  title:        string
  onTitleChange:(v: string) => void
  slug:         string
  onSlugChange: (v: string) => void
  slugManual:   boolean
  onSlugManualToggle: () => void
  author:       string
  onAuthorChange: (v: string) => void
  category:     PostTemplate
  onCategoryChange: (v: PostTemplate) => void
  coverImage:   string
  onCoverImageChange: (v: string) => void
  body:         string
  onBodyChange: (v: string) => void
  metaTitle:    string
  onMetaTitleChange: (v: string) => void
  metaDescription: string
  onMetaDescriptionChange: (v: string) => void
  focusKeyword: string
  onFocusKeywordChange: (v: string) => void
  visibility:   PostVisibility
  onVisibilityChange: (v: PostVisibility) => void
  wordCount:    number
}

export function StudioEditor({
  title, onTitleChange, slug, onSlugChange, slugManual, onSlugManualToggle,
  author, onAuthorChange, category, onCategoryChange,
  coverImage, onCoverImageChange, body, onBodyChange,
  metaTitle, onMetaTitleChange, metaDescription, onMetaDescriptionChange,
  focusKeyword, onFocusKeywordChange, visibility, onVisibilityChange,
  wordCount,
}: StudioEditorProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 max-w-4xl">

      {/* POST METADATA FIELDS */}
      <div className="space-y-6 bg-nbac-panel p-6 rounded-2xl border border-nbac-border shadow-sm">

        {/* Title input */}
        <div className="space-y-2">
          <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text block">
            Post Title <span className="text-nbac-danger">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="e.g. Redefining the West African Aviation Corridor..."
            className="w-full bg-nbac-canvas border border-nbac-border rounded-xl px-4 py-3 text-lg font-display font-bold text-nbac-text placeholder:text-nbac-muted focus:outline-none focus:border-nbac-emerald transition-colors"
          />
        </div>

        {/* Slug input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text">
              URL Address (Slug)
            </label>
            <button
              type="button"
              onClick={onSlugManualToggle}
              className="font-sans text-xs text-nbac-emerald hover:underline cursor-pointer"
            >
              {slugManual ? 'Auto-generate from title' : 'Edit URL manually'}
            </button>
          </div>
          <div className="flex items-center gap-1 bg-nbac-canvas border border-nbac-border rounded-xl px-3.5 py-2.5 font-sans text-sm text-nbac-muted">
            <span className="select-none text-nbac-body/60 font-mono text-xs">nbac.com.ng/news/</span>
            <input
              type="text"
              value={slug}
              readOnly={!slugManual}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder="post-url-slug"
              className="flex-1 bg-transparent border-none text-nbac-text font-mono text-xs focus:outline-none focus:ring-0 read-only:opacity-80"
            />
          </div>
        </div>

        {/* Author & Category row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text block">
              Author Display Name
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => onAuthorChange(e.target.value)}
              placeholder="e.g. Capt. Ibrahim Musa or NBAC Team"
              className="w-full bg-nbac-canvas border border-nbac-border rounded-xl px-3.5 py-2.5 text-sm text-nbac-text placeholder:text-nbac-muted focus:outline-none focus:border-nbac-emerald transition-colors font-sans"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text block">
              Content Category
            </label>
            <select
              value={category}
              onChange={(e) => onCategoryChange(e.target.value as PostTemplate)}
              className="w-full bg-nbac-canvas border border-nbac-border rounded-xl px-3.5 py-2.5 text-sm text-nbac-text focus:outline-none focus:border-nbac-emerald transition-colors font-sans cursor-pointer"
            >
              <option value="announcement">Announcement</option>
              <option value="press_release">Press Release</option>
              <option value="visual_showcase">Visual Showcase</option>
              <option value="sponsor_update">Sponsor Update</option>
              <option value="event_copy">Event Update</option>
              <option value="blank">General Briefing</option>
            </select>
          </div>
        </div>

        {/* Cover Image */}
        <CoverImageUpload
          value={coverImage}
          onChange={onCoverImageChange}
        />
      </div>

      {/* RICH TEXT BODY */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text">
            Article Content <span className="text-nbac-danger">*</span>
          </label>
          <span className="font-sans text-xs text-nbac-muted">
            Word count: <strong className="text-nbac-text font-semibold">{wordCount}</strong>
          </span>
        </div>
        <RichTextEditor
          content={body}
          onChange={onBodyChange}
        />
      </div>

      {/* SEO SETTINGS PANEL */}
      <SeoPanel
        metaTitle={metaTitle}
        onMetaTitleChange={onMetaTitleChange}
        metaDescription={metaDescription}
        onMetaDescriptionChange={onMetaDescriptionChange}
        focusKeyword={focusKeyword}
        onFocusKeywordChange={onFocusKeywordChange}
        postTitle={title}
      />

      {/* VISIBILITY TOGGLE */}
      <div className="bg-nbac-panel p-6 rounded-2xl border border-nbac-border shadow-sm">
        <VisibilityToggle
          value={visibility}
          onChange={onVisibilityChange}
        />
      </div>
    </div>
  )
}
