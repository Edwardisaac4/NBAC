'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { SectionBlur } from '@/components/shared/section-blur'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'

export default function TermsOfUsePage() {
  return (
    <PageTransition>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-32 pb-20">
        
        {/* Hero Area */}
        <section className="relative py-16 md:py-24 border-b border-nbac-border text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-nbac-emerald/[0.03] blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <SectionEyebrow className="justify-center">Legal Terms & Conditions</SectionEyebrow>
            <h1 className="font-display text-4xl md:text-6xl font-bold mt-3 text-nbac-text tracking-tight">
              Terms of Use
            </h1>
            <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-xl mx-auto mt-4 leading-relaxed">
              Last updated: July 1, 2026. Please read these terms carefully before registering for the conference or using our platform services.
            </p>
          </div>
        </section>

        {/* Content Body */}
        <SectionBlur>
          <section className="py-16 md:py-24 max-w-3xl mx-auto px-6 w-full">
            <div className="font-sans text-sm md:text-base font-light text-nbac-body space-y-10 leading-relaxed">
              
              {/* Introduction */}
              <div className="space-y-4">
                <p>
                  Welcome to the official platform of the Nigerian Business Aviation Conference (NBAC). By accessing our website, registering for conference passes, or submitting logistics inquiries, you agree to comply with and be bound by the following Terms of Use.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  1. Pass Registration & Payment
                </h2>
                <p>
                  To secure an executive pass for the conference, you must complete the registration form and process payment through our payment gateway, Paystack.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Booking Reference:</strong> Upon successful payment verification, you will receive a confirmation email containing a unique NBAC booking reference. This reference is required for check-in and access badge printing.</li>
                  <li><strong>Non-Refundable Passes:</strong> All delegate passes are non-refundable. However, they may be transferred to another individual within the same organization up to 10 days before the event by contacting registration support.</li>
                  <li><strong>Accuracy of Information:</strong> You agree to provide accurate and complete name, company, and contact details during registration. Failing to do so may result in badge cancellation.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  2. Conference Access & Security Guidelines
                </h2>
                <p>
                  Access to the conference venue, FBO hangars, and static aircraft display areas is subject to strict aviation safety and event security regulations:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Identification:</strong> A government-issued photo ID matching your registration name is required at badge pick-up.</li>
                  <li><strong>Static Display (Tarmac Access):</strong> Access to the private runway tarmac and aircraft cabin viewings is strictly gated and limited to VIP and Exhibitor pass holders. Escorts are required at all times. Flat-soled footwear is mandatory on the tarmac for safety reasons.</li>
                  <li><strong>Organizers&apos; Discretion:</strong> The organizers reserve the right to refuse entry or remove any individual whose conduct is deemed unsafe, disruptive, or in breach of code-of-conduct guidelines.</li>
                </ul>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  3. Intellectual Property & Media
                </h2>
                <p>
                  All content, graphics, layouts, brand identifiers, and code on this platform are the property of NBAC or its partners and are protected by copyright laws. 
                </p>
                <p>
                  <strong>Photography and Recording:</strong> Photography, filming, and audio recording will occur during the event. By attending, you grant the organizers the right to use your likeness in post-event wraps, media galleries, and future promotional materials.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  4. Limitation of Liability
                </h2>
                <p>
                  The organizers of NBAC make every effort to deliver a world-class conference. However, we are not liable for any logistical delays, flight cancellations, hotel booking changes, or other issues related to third-party FBOs, airlines, or hotel partners.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  5. Governing Law
                </h2>
                <p>
                  These Terms of Use shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.
                </p>
              </div>

            </div>
          </section>
        </SectionBlur>

      </main>
      <Footer />
    </PageTransition>
  )
}
