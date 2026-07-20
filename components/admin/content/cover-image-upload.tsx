'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'
import { cn }              from '@/lib/utils'
import { createClient }    from '@/lib/supabase/client'

interface CoverImageUploadProps {
  value:    string
  onChange: (url: string) => void
}

const PRESET_IMAGES = [
  { name: 'Private Jet Tarmac', url: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?q=80&w=600&auto=format&fit=crop' },
  { name: 'VIP Conference Panel', url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Delegate Networking', url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop' },
  { name: 'Business Aviation Lounge', url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=600&auto=format&fit=crop' },
  { name: 'Executive Meeting Room', url: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=600&auto=format&fit=crop' },
]

export function CoverImageUpload({ value, onChange }: CoverImageUploadProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'gallery'>('upload')
  const [urlInput, setUrlInput]   = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [isDragActive, setIsDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const supabase = createClient()

  const handleFileSelect = async (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return

    setIsUploading(true)
    setUploadError('')

    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`
      const filePath = `cover-images/${fileName}`

      const { error: uploadErr } = await supabase.storage
        .from('nbac-media')
        .upload(filePath, file)

      if (uploadErr) {
        throw uploadErr
      }

      const { data: { publicUrl } } = supabase.storage
        .from('nbac-media')
        .getPublicUrl(filePath)

      onChange(publicUrl)
    } catch (err: unknown) {
      console.error('Upload error:', err)
      setUploadError('Failed to upload to server. Using local preview instead.')
      // Fallback to local data URL if Supabase storage is unconfigured or offline
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) onChange(reader.result as string)
      }
      reader.readAsDataURL(file)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      {/* Label & Active Preview */}
      <div className="flex items-center justify-between">
        <label className="font-sans text-xs uppercase tracking-wider font-semibold text-nbac-text">
          Cover Image
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="font-sans text-xs text-nbac-danger hover:underline flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Remove image
          </button>
        )}
      </div>

      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-nbac-border bg-nbac-deep group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Cover preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => onChange('')}
              className="px-4 py-2 rounded-lg bg-nbac-danger text-white font-sans text-sm font-medium shadow-md transition-transform hover:scale-105"
            >
              Change Image
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Tabs */}
          <div className="flex rounded-lg bg-nbac-panel border border-nbac-border p-1 text-xs font-sans font-medium">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={cn(
                'flex-1 py-1.5 rounded-md transition-all',
                activeTab === 'upload'
                  ? 'bg-nbac-deep text-nbac-emerald shadow-sm'
                  : 'text-nbac-muted hover:text-nbac-text'
              )}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={cn(
                'flex-1 py-1.5 rounded-md transition-all',
                activeTab === 'url'
                  ? 'bg-nbac-deep text-nbac-emerald shadow-sm'
                  : 'text-nbac-muted hover:text-nbac-text'
              )}
            >
              Paste Web URL
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={cn(
                'flex-1 py-1.5 rounded-md transition-all',
                activeTab === 'gallery'
                  ? 'bg-nbac-deep text-nbac-emerald shadow-sm'
                  : 'text-nbac-muted hover:text-nbac-text'
              )}
            >
              Preset Gallery
            </button>
          </div>

          {/* UPLOAD TAB */}
          {activeTab === 'upload' && (
            <div
              onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(true) }}
              onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragActive(false) }}
              onDrop={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsDragActive(false)
                const file = e.dataTransfer.files?.[0]
                handleFileSelect(file)
              }}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer',
                isDragActive
                  ? 'border-nbac-emerald bg-nbac-emerald/5'
                  : 'border-nbac-border hover:border-nbac-body bg-nbac-canvas'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4 space-y-2">
                  <Loader2 className="h-6 w-6 animate-spin text-nbac-emerald" />
                  <p className="font-sans text-xs text-nbac-muted">Uploading image to secure storage...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-6 w-6 text-nbac-muted mx-auto" />
                  <p className="font-sans text-sm text-nbac-text font-medium">
                    {isDragActive
                      ? 'Drop image right here...'
                      : 'Drag and drop an image here, or click to browse'}
                  </p>
                  <p className="font-sans text-xs text-nbac-muted">
                    Supports PNG, JPG, or WEBP (recommended minimum 1200x630px for high clarity)
                  </p>
                  {uploadError && (
                    <p className="font-sans text-xs text-nbac-amber mt-2">{uploadError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* URL TAB */}
          {activeTab === 'url' && (
            <div className="flex gap-2">
              <input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-..."
                className="flex-1 bg-nbac-canvas border border-nbac-border rounded-lg
                           px-4 py-3 text-nbac-text font-sans text-sm
                           focus:outline-none focus:border-nbac-emerald transition-colors
                           placeholder:text-nbac-muted"
              />
              <button
                type="button"
                onClick={() => {
                  if (urlInput.trim()) {
                    onChange(urlInput.trim())
                    setUrlInput('')
                  }
                }}
                className="font-sans text-sm font-medium px-4 py-2 rounded-lg
                           bg-nbac-emerald hover:bg-nbac-emerald-dark text-white
                           transition-colors flex-shrink-0"
              >
                Use URL
              </button>
            </div>
          )}

          {/* GALLERY TAB */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-nbac-canvas p-3 rounded-xl border border-nbac-border max-h-56 overflow-y-auto">
              {PRESET_IMAGES.map((img) => (
                <div
                  key={img.url}
                  onClick={() => onChange(img.url)}
                  className="relative h-20 rounded-lg overflow-hidden border border-nbac-border cursor-pointer hover:border-nbac-emerald transition-all group bg-nbac-deep"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-1 text-center">
                    <span className="text-[10px] text-white font-medium leading-tight">
                      {img.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
