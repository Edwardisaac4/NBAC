'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { ImageIcon, Calendar, ChevronLeft, ChevronRight, X, Maximize2, Loader2, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { HISTORICAL_GALLERY_ITEMS, GALLERY_YEARS, GalleryItem } from '@/lib/gallery-data'
import { cn } from '@/lib/utils'

interface DbMediaAsset {
  id: string
  file_name: string
  file_url: string
  tags: string[] | null
  created_at?: string
  category?: string
  year: '2026' | '2017' | '2016' | '2014' | '2013'
}

interface GalleryViewProps {
  initialYear?: typeof GALLERY_YEARS[number]
}

export function GalleryView({ initialYear = 'All' }: GalleryViewProps) {
  const [selectedYear, setSelectedYear] = useState<typeof GALLERY_YEARS[number]>(initialYear)
  const [dbItems, setDbItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // Fetch dynamic uploaded assets from Supabase
  const fetchDbAssets = useCallback(async () => {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('media_assets')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching gallery database assets:', error.message)
        return
      }

      if (data) {
        const formatted: GalleryItem[] = data.map((item: DbMediaAsset) => {
          const cleanTitle = item.file_name
            .replace(/\.[^/.]+$/, "") // remove extension
            .replace(/[^a-zA-Z0-9]/g, ' ') // replace symbols with spaces
            .replace(/\b\w/g, (c: string) => c.toUpperCase()) // capitalize

          const category: GalleryItem['category'] =
            item.category === 'Exhibition' ||
            item.category === 'Gala Dinner' ||
            item.category === 'Networking' ||
            item.category === 'Conference'
              ? item.category
              : 'Conference'

          return {
            id: item.id,
            src: item.file_url,
            alt: item.file_name,
            title: cleanTitle,
            description: item.tags && item.tags.length > 0 ? `Tags: ${item.tags.join(', ')}` : '',
            year: item.year || '2026',
            category,
          }
        })
        setDbItems(formatted)
      }
    } catch (err) {
      console.error('Failed to load database gallery assets:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchDbAssets()
    })
  }, [fetchDbAssets])

  // Merge database assets (2026/Recent) with static historical assets
  const allGalleryItems = useMemo(() => {
    return [...dbItems, ...HISTORICAL_GALLERY_ITEMS]
  }, [dbItems])

  // Filter items based on selected year
  const filteredItems = useMemo(() => {
    return allGalleryItems.filter((item) => {
      return selectedYear === 'All' || item.year === selectedYear
    })
  }, [allGalleryItems, selectedYear])

  // Lightbox handlers
  const openLightbox = (index: number) => {
    setLightboxIndex(index)
  }

  const closeLightbox = () => {
    setLightboxIndex(null)
  }

  const navigateLightbox = useCallback((direction: 'next' | 'prev') => {
    if (lightboxIndex === null || filteredItems.length === 0) return
    let newIndex = direction === 'next' ? lightboxIndex + 1 : lightboxIndex - 1

    // Loop around
    if (newIndex >= filteredItems.length) newIndex = 0
    if (newIndex < 0) newIndex = filteredItems.length - 1

    setLightboxIndex(newIndex)
  }, [lightboxIndex, filteredItems])

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowRight') navigateLightbox('next')
      if (e.key === 'ArrowLeft') navigateLightbox('prev')
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [lightboxIndex, navigateLightbox])

  return (
    <div className="w-full">
      {/* Year Filter Segment */}
      <div className="flex flex-col gap-4 mb-12 relative z-20">
        <div className="space-y-2">
          <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-gold font-bold flex items-center gap-1.5">
            <Calendar size={12} /> Filter By Year
          </span>
          <div className="flex flex-wrap gap-2">
            {GALLERY_YEARS.map((year) => (
              <button
                key={year}
                onClick={() => {
                  setSelectedYear(year)
                  setLightboxIndex(null)
                }}
                className={cn(
                  "px-5 py-2 rounded-lg font-sans text-xs uppercase tracking-wider font-semibold border transition-all duration-300 cursor-pointer",
                  selectedYear === year
                    ? "bg-nbac-emerald text-white border-nbac-emerald shadow-lg shadow-nbac-emerald/20"
                    : "bg-nbac-panel border-nbac-border text-nbac-muted hover:text-nbac-text hover:border-nbac-gold/30"
                )}
              >
                {year === 'All' ? 'All Years' : year}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid View */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-nbac-emerald" size={32} />
          <span className="font-sans text-xs text-nbac-muted uppercase tracking-widest">Loading Gallery Assets...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 border border-dashed border-nbac-border rounded-2xl bg-nbac-panel/50"
        >
          <ImageIcon className="mx-auto text-nbac-muted mb-4" size={40} />
          <h3 className="font-display text-lg font-bold text-nbac-text">No Photos Found</h3>
          <p className="font-sans text-xs text-nbac-muted max-w-sm mx-auto mt-1.5">
            We couldn&apos;t find any images for year &quot;{selectedYear}&quot;.
          </p>
          <button
            onClick={() => {
              setSelectedYear('All')
            }}
            className="mt-6 font-sans text-[11px] uppercase font-bold tracking-wider text-nbac-emerald hover:text-nbac-emerald-light flex items-center gap-1 mx-auto cursor-pointer"
          >
            Clear Filters <ArrowRight size={14} />
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, index) => {
              return (
                <motion.div
                  layout
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  onClick={() => openLightbox(index)}
                  className="group relative cursor-pointer aspect-4/3 rounded-xl overflow-hidden bg-nbac-panel border border-nbac-border shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-nbac-gold/30 hover:shadow-nbac-gold/5"
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105 contrast-[1.05] saturate-[1.04] [image-rendering:-webkit-optimize-contrast]"
                    quality={85}
                  />

                  {/* Dark aesthetic luxury overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-nbac-canvas/95 via-nbac-canvas/30 to-transparent opacity-60 group-hover:opacity-85 transition-opacity duration-300" />

                  {/* Hover Details Panel */}
                  <div className="absolute inset-0 p-5 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                    <div className="flex gap-2 items-center">
                      <span className="bg-nbac-emerald/10 text-nbac-emerald-light border border-nbac-emerald/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
                        {item.year}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-nbac-canvas/80 border border-nbac-border p-1.5 rounded-lg text-nbac-gold opacity-0 group-hover:opacity-100 transition-opacity duration-400 delay-100">
                      <Maximize2 size={12} />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Lightbox Overlay */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredItems[lightboxIndex] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 bg-nbac-canvas/98 backdrop-blur-md z-9999 flex flex-col items-center justify-center p-4 md:p-8"
          >
            {/* Ambient Blurred Background Image */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 select-none">
              <Image
                src={filteredItems[lightboxIndex].src}
                alt=""
                fill
                className="object-cover blur-3xl scale-125"
                quality={60}
              />
            </div>

            {/* Top Bar controls */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-50">
              <div className="flex items-center gap-3">
                <span className="font-sans text-[10px] uppercase font-bold tracking-widest text-nbac-gold border border-nbac-gold/25 px-2.5 py-1 rounded bg-nbac-panel/80">
                  {filteredItems[lightboxIndex].year}
                </span>
              </div>

              <button
                onClick={closeLightbox}
                className="bg-nbac-panel border border-nbac-border hover:border-nbac-danger hover:text-nbac-danger p-2 rounded-full text-nbac-body transition-colors cursor-pointer"
                aria-label="Close lightbox"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Stage (Image & Controls) */}
            <div className="relative w-full max-w-5xl aspect-16/10 flex items-center justify-center px-4 md:px-12 z-20">
              {/* Prev Button */}
              <button
                onClick={() => navigateLightbox('prev')}
                className="absolute left-0 md:left-2 bg-nbac-panel/90 border border-nbac-border hover:border-nbac-gold text-nbac-text hover:text-nbac-gold p-3 rounded-full shadow-lg transition-colors z-50 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>

              {/* High-res Image Wrapper */}
              <div className="relative w-full h-[60vh] max-h-150 rounded-xl overflow-hidden border border-nbac-border/80 shadow-2xl bg-nbac-panel/90 flex items-center justify-center">
                <Image
                  src={filteredItems[lightboxIndex].src}
                  alt={filteredItems[lightboxIndex].alt}
                  fill
                  className="object-contain contrast-[1.06] saturate-[1.05] brightness-[1.02] [image-rendering:-webkit-optimize-contrast]"
                  quality={85}
                  priority
                />
              </div>

              {/* Next Button */}
              <button
                onClick={() => navigateLightbox('next')}
                className="absolute right-0 md:right-2 bg-nbac-panel/90 border border-nbac-border hover:border-nbac-gold text-nbac-text hover:text-nbac-gold p-3 rounded-full shadow-lg transition-colors z-50 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Bottom Counter Info */}
            <div className="w-full max-w-2xl text-center mt-4 px-4 z-20">
              <div className="text-[10px] uppercase font-mono tracking-widest text-nbac-gold/60">
                Image {lightboxIndex + 1} of {filteredItems.length}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
