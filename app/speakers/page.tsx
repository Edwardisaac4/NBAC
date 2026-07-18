import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SpeakersGrid } from '@/components/sections/speakers-grid'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'
import { SPEAKERS } from '@/data/speakers'

export default function SpeakersPage() {
  return (
    <>
      <Navbar />
      <main className="relative min-h-screen bg-nbac-canvas pt-24 pb-32 overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-linear-to-b from-nbac-emerald/10 to-transparent blur-3xl pointer-events-none" />

        {/* PAGE HEADER */}
        <section className="relative z-10 max-w-6xl mx-auto px-6 mb-16">
          <SectionEyebrow>NBAC 2027 SPEAKERS</SectionEyebrow>
          <h1 className="font-display text-5xl md:text-6xl font-bold text-nbac-text
                          tracking-tight leading-none mt-4 mb-6">
            The Voices Shaping<br />Nigerian Aviation
          </h1>
          <p className="font-sans text-base text-nbac-body leading-relaxed max-w-2xl">
            NBAC 2027 brings together the operators, regulators, financiers,
            and innovators who make the decisions that define how business
            aviation in Nigeria and across Africa operates, invests, and grows.
            Speaker announcements are ongoing — check back for updates.
          </p>
        </section>

        {/* SPEAKERS GRID */}
        <div className="relative z-10">
          <SpeakersGrid speakers={SPEAKERS} />
        </div>

      </main>
      <Footer />
    </>
  )
}
