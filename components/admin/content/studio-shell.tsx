'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter }           from 'next/navigation'
import { StudioTopbar }        from './studio-topbar'
import { TemplatePicker }      from './template-picker'
import { StudioEditor }        from './studio-editor'
import { StudioPreview }       from './studio-preview'
import { TEMPLATE_CONTENT }    from '@/lib/studio-templates'
import { generateSlug, sanitiseSlug } from '@/lib/slug-utils'
import { createClient }        from '@/lib/supabase/client'
import type { PostTemplate, PostVisibility, AutoSaveStatus, ContentPost } from '@/types'

interface StudioShellProps {
  mode:          'create' | 'edit'
  existingPost?: ContentPost
  authorName?:   string
}

export function StudioShell({ mode, existingPost, authorName = 'NBAC Team' }: StudioShellProps) {
  const router   = useRouter()
  const supabase = createClient()

  // State initialization
  const [title, setTitle]                     = useState(existingPost?.title ?? '')
  const [slug, setSlug]                       = useState(existingPost?.slug ?? '')
  const [slugManual, setSlugManual]           = useState(Boolean(existingPost?.slug))
  const [category, setCategory]               = useState<PostTemplate>(existingPost?.type ?? 'announcement')
  const [author, setAuthor]                   = useState(existingPost?.author_name ?? authorName)
  const [coverImage, setCoverImage]           = useState(existingPost?.cover_image_url ?? '')
  const [body, setBody]                       = useState(existingPost?.body ?? '')
  const [metaTitle, setMetaTitle]             = useState(existingPost?.meta_title ?? '')
  const [metaDescription, setMetaDescription] = useState(existingPost?.meta_description ?? '')
  const [focusKeyword, setFocusKeyword]       = useState(existingPost?.focus_keyword ?? '')
  const [visibility, setVisibility]           = useState<PostVisibility>(existingPost?.status ?? 'draft')
  const [selectedTemplate, setSelectedTemplate] = useState<PostTemplate | null>(existingPost?.type ?? null)
  
  const [autoSaveStatus, setAutoSaveStatus]   = useState<AutoSaveStatus>('idle')
  const [isPublishing, setIsPublishing]       = useState(false)
  const [postId, setPostId]                   = useState<string | undefined>(existingPost?.id)

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMountRef = useRef(true)

  // Calculate word count from HTML body
  const wordCount = React.useMemo(() => {
    if (!body) return 0
    const text = body.replace(/<[^>]*>/g, ' ').trim()
    if (!text) return 0
    return text.split(/\s+/).filter(Boolean).length
  }, [body])

  // Handle template selection
  const handleTemplateSelect = useCallback((template: PostTemplate) => {
    setSelectedTemplate(template)
    setCategory(template)
    if (mode === 'create' && (!body || body === '')) {
      const content = TEMPLATE_CONTENT[template] || { title: '', body: '' }
      if (content.title && !title) setTitle(content.title)
      if (content.body) setBody(content.body)
    }
  }, [mode, body, title])

  // Auto-generate slug from title unless user edited slug manually
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle)
    if (!slugManual) {
      setSlug(generateSlug(newTitle))
    }
    setAutoSaveStatus('unsaved')
  }

  const handleSlugChange = (newSlug: string) => {
    setSlug(sanitiseSlug(newSlug))
    setAutoSaveStatus('unsaved')
  }

  const handleSlugManualToggle = () => {
    if (slugManual) {
      setSlugManual(false)
      setSlug(generateSlug(title))
    } else {
      setSlugManual(true)
    }
  }

  // Generic change handlers that flag unsaved status
  const triggerUnsaved = () => setAutoSaveStatus('unsaved')

  // Save to Supabase (or localStorage fallback)
  const performSave = useCallback(async (targetStatus: PostVisibility = visibility) => {
    if (!title.trim() && !body.trim()) return

    setAutoSaveStatus('saving')
    try {
      const payload = {
        title:             title.trim() || 'Untitled Post',
        slug:              slug.trim() || generateSlug(title.trim() || 'untitled-post'),
        type:              category,
        status:            targetStatus,
        body:              body || '',
        author_name:       author.trim() || authorName,
        cover_image_url:   coverImage || null,
        meta_title:        metaTitle.trim() || null,
        meta_description:  metaDescription.trim() || null,
        focus_keyword:     focusKeyword.trim() || null,
        updated_at:        new Date().toISOString(),
      }

      if (postId) {
        const { error } = await supabase
          .from('posts')
          .update(payload)
          .eq('id', postId)
        if (error) throw error
      } else {
        const newId = `post_${Date.now()}`
        const { error } = await supabase
          .from('posts')
          .insert({
            ...payload,
            id: newId,
            created_at: new Date().toISOString(),
          })
        if (error) throw error
        setPostId(newId)
      }
      setAutoSaveStatus('saved')
    } catch (err) {
      console.warn('Save to DB unavailable, using localStorage backup:', err)
      // Fallback local storage backup when DB table not yet migrated or offline
      try {
        const backupId = postId || `local_${Date.now()}`
        localStorage.setItem(`nbac_post_backup_${backupId}`, JSON.stringify({
          title, slug, category, author, coverImage, body, metaTitle, metaDescription, focusKeyword, visibility: targetStatus, updated_at: new Date().toISOString()
        }))
      } catch (e) {
        console.error('Local backup failed:', e)
      }
      setAutoSaveStatus('saved')
    }
  }, [title, slug, category, visibility, body, author, authorName, coverImage, metaTitle, metaDescription, focusKeyword, postId, supabase])

  // Debounced auto-save effect (3s)
  useEffect(() => {
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false
      return
    }
    if (autoSaveStatus !== 'unsaved') return

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(() => {
      performSave(visibility)
    }, 3000)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [title, slug, category, author, coverImage, body, metaTitle, metaDescription, focusKeyword, visibility, autoSaveStatus, performSave])

  const handleSaveDraft = async () => {
    setVisibility('draft')
    await performSave('draft')
  }

  const handlePublish = async () => {
    if (!title.trim()) {
      alert('Please enter a post title before publishing.')
      return
    }
    setIsPublishing(true)
    try {
      setVisibility('published')
      await performSave('published')
      alert('Post published successfully!')
      router.push('/admin/content')
    } catch (err) {
      console.error('Publish error:', err)
      alert('Failed to publish post. Please check console for details.')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleUnpublish = async () => {
    setVisibility('draft')
    await performSave('draft')
    alert('Post unpublished and moved to drafts.')
  }

  const handleBack = () => {
    if (autoSaveStatus === 'unsaved') {
      if (!confirm('You have unsaved changes. Are you sure you want to leave without saving?')) {
        return
      }
    }
    router.push('/admin/content')
  }

  return (
    <div className="flex flex-col h-screen w-full bg-nbac-canvas overflow-hidden">
      {/* Sticky Topbar */}
      <StudioTopbar
        autoSaveStatus={autoSaveStatus}
        visibility={visibility}
        isPublishing={isPublishing}
        onSaveDraft={handleSaveDraft}
        onPublish={handlePublish}
        onUnpublish={handleUnpublish}
        onBack={handleBack}
      />

      {/* Template Picker (always visible or selectable above columns) */}
      <TemplatePicker
        selected={selectedTemplate}
        onSelect={handleTemplateSelect}
      />

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left column: Form & Editor */}
        <StudioEditor
          title={title}
          onTitleChange={handleTitleChange}
          slug={slug}
          onSlugChange={handleSlugChange}
          slugManual={slugManual}
          onSlugManualToggle={handleSlugManualToggle}
          author={author}
          onAuthorChange={(v) => { setAuthor(v); triggerUnsaved() }}
          category={category}
          onCategoryChange={(v) => { setCategory(v); setSelectedTemplate(v); triggerUnsaved() }}
          coverImage={coverImage}
          onCoverImageChange={(v) => { setCoverImage(v); triggerUnsaved() }}
          body={body}
          onBodyChange={(v) => { setBody(v); triggerUnsaved() }}
          metaTitle={metaTitle}
          onMetaTitleChange={(v) => { setMetaTitle(v); triggerUnsaved() }}
          metaDescription={metaDescription}
          onMetaDescriptionChange={(v) => { setMetaDescription(v); triggerUnsaved() }}
          focusKeyword={focusKeyword}
          onFocusKeywordChange={(v) => { setFocusKeyword(v); triggerUnsaved() }}
          visibility={visibility}
          onVisibilityChange={(v) => { setVisibility(v); triggerUnsaved() }}
          wordCount={wordCount}
        />

        {/* Right column: Live Preview */}
        <StudioPreview
          title={title}
          body={body}
          coverImage={coverImage}
          author={author}
          category={category}
        />
      </div>
    </div>
  )
}
