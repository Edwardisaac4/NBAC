'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PressAccreditationForm } from '@/components/sections/press-accreditation-form'

export default function PressAccreditationPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-nbac-canvas text-nbac-text pt-28 md:pt-32 pb-24 px-4 sm:px-6 md:px-12 relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-87.5 bg-linear-to-b from-nbac-emerald/10 via-nbac-gold/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          <PressAccreditationForm />
        </div>
      </main>

      <Footer />
    </>
  )
}
