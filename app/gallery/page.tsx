'use client'

import React from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GalleryView } from '@/components/sections/gallery-view'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'

export default function GalleryPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-28 md:pt-36 pb-20 px-6 md:px-24">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          {/* Header Block */}
          <div className="space-y-4 max-w-3xl">
            <SectionEyebrow>Visual Archive</SectionEyebrow>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-nbac-text leading-tight">
              Capturing the Momentum of <br className="hidden sm:inline" />
              <span className="text-glow text-nbac-emerald">West African Aviation</span>
            </h1>
            <p className="font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed pt-2">
              Explore the historical milestones of the Nigerian Business Aviation Conference through our photos. Witness our journey from the inaugural 2013 summit to the latest developments in 2026.
            </p>
          </div>

          <div className="h-[1px] w-full bg-nbac-border" />

          {/* Interactive Gallery Segment */}
          <GalleryView initialYear="All" />
        </div>
      </main>
      <Footer />
    </>
  )
}
