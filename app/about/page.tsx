'use client'

import { Navbar } from "@/components/layout/navbar"
import { AboutHero } from "@/components/sections/about-hero"
import { AboutObjectives } from "@/components/sections/about-objectives"
import { AboutHistory } from "@/components/sections/about-history"
import { AboutCommittee } from "@/components/sections/about-committee"
import { AboutSponsors } from "@/components/sections/about-sponsors"
import { Footer } from "@/components/layout/footer"
import { SectionBlur } from "@/components/shared/section-blur"

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-20 md:pt-24">
        <AboutHero />
        <AboutObjectives />
        <SectionBlur>
          <AboutHistory />
        </SectionBlur>
        <SectionBlur>
          <AboutCommittee />
        </SectionBlur>
        <SectionBlur intensity={4} minOpacity={0.75}>
          <AboutSponsors />
        </SectionBlur>
      </main>
      <Footer />
    </>
  )
}
