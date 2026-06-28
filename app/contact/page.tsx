'use client'

import { Navbar } from "@/components/layout/navbar"
import { ContactHero } from "@/components/sections/contact-hero"
import { ContactInfo } from "@/components/sections/contact-info"
import { ContactFormUI } from "@/components/sections/contact-form-ui"
import { Footer } from "@/components/layout/footer"
import { PageTransition } from "@/components/layout/page-transition"
import { SectionBlur } from "@/components/shared/section-blur"

export default function ContactPage() {
  return (
    <PageTransition>
      <Navbar />
      
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-20 md:pt-24">
        {/* Contact Hero Title and Intro */}
        <ContactHero />
        
        {/* Contact Content Split: Left Logistics Info, Right Contact Form */}
        <SectionBlur>
          <section className="max-w-7xl mx-auto px-6 md:px-24 py-12 md:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <ContactInfo />
            <ContactFormUI />
          </section>
        </SectionBlur>
      </main>

      <Footer />
    </PageTransition>
  )
}
