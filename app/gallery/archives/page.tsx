'use client'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { GalleryView } from '@/components/sections/gallery-view'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'

export default function GalleryArchivesPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-28 md:pt-36 pb-20 px-6 md:px-24">
        <div className="max-w-7xl mx-auto w-full space-y-12">
          {/* Header Block */}
          <div className="space-y-4 max-w-3xl">
            <SectionEyebrow>Historical Archives</SectionEyebrow>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-nbac-text leading-tight">
              A Legacy of Innovation in <br className="hidden sm:inline" />
              <span className="text-glow text-nbac-gold">African Aviation</span>
            </h1>
            <p className="font-sans text-base md:text-lg font-light text-nbac-body leading-relaxed pt-2">
              Browse through the archives of the Nigerian Business Aviation Conference. Revisit the photos, highlights, and panels that have shaped the corporate skies of the continent over the past decade.
            </p>
          </div>

          <div className="h-px w-full bg-nbac-border" />

          {/* Interactive Gallery Segment (Defaulted to 2017) */}
          <GalleryView initialYear="2017" />
        </div>
      </main>
      <Footer />
    </>
  )
}
