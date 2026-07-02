'use client'

import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { SectionBlur } from '@/components/shared/section-blur'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'

export default function PrivacyPolicyPage() {
  return (
    <PageTransition>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-32 pb-20">
        
        {/* Hero Area */}
        <section className="relative py-16 md:py-24 border-b border-nbac-border text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-nbac-emerald/[0.03] blur-[100px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-6 relative z-10">
            <SectionEyebrow className="justify-center">Legal Documentation</SectionEyebrow>
            <h1 className="font-display text-4xl md:text-6xl font-bold mt-3 text-nbac-text tracking-tight">
              Privacy Policy
            </h1>
            <p className="font-sans text-sm md:text-base font-light text-nbac-muted max-w-xl mx-auto mt-4 leading-relaxed">
              Last updated: July 1, 2026. This policy governs how we collect, store, and process your delegate data for the Nigerian Business Aviation Conference.
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
                  At the Nigerian Business Aviation Conference (NBAC), we are committed to protecting the privacy and personal data of our delegates, sponsors, and partners. This Privacy Policy details how we handle the information you provide when registering for the conference or making charter/hotel inquiries.
                </p>
              </div>

              {/* Section 1 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  1. Information We Collect
                </h2>
                <p>
                  We collect information that you directly provide to us when completing forms on our platform:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Registration Details:</strong> Full name, official email address, company name, phone number, special dietary or access requirements, and delegate count.</li>
                  <li><strong>Inquiry Details:</strong> Information provided when submitting flight charter, logistics, or partner hotel booking inquiries.</li>
                  <li><strong>Transaction Records:</strong> Payment transaction references generated through our third-party payment gateway, Paystack.</li>
                </ul>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  2. How We Use Your Data
                </h2>
                <p>
                  Your information is utilized solely for the facilitation of the conference operations:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Processing and issuing your VIP, Exhibitor, or Jet Display conference passes.</li>
                  <li>Sending secure confirmation and transactional receipt emails via our email provider, Resend.</li>
                  <li>Coordinating ground handling, airport transfers, and room reservations with FBO terminals and partner hotels (upon your explicit inquiry request).</li>
                  <li>Auditing security logs and system operations to prevent fraud.</li>
                </ul>
                <p>
                  <strong>No Marketing Spam:</strong> We will never sell or share your data with third-party advertising networks. All communication is transactional and directly related to the NBAC event operations.
                </p>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  3. Payment Security
                </h2>
                <p>
                  All payments are processed securely through **Paystack**, a PCI-DSS certified payment provider. NBAC does not store, process, or have access to your credit card numbers, bank credentials, or other direct payment details on our servers.
                </p>
              </div>

              {/* Section 4 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  4. Data Retention & RLS
                </h2>
                <p>
                  We maintain strict Row Level Security (RLS) policies on our Supabase databases to ensure that delegate information can only be accessed by authorized system admins (Head Admin and Editor roles). 
                </p>
                <p>
                  Your registration information is stored securely and will be retained for as long as necessary to comply with tax regulations and event auditing protocols.
                </p>
              </div>

              {/* Section 5 */}
              <div className="space-y-4">
                <h2 className="font-display text-xl md:text-2xl font-bold text-nbac-text">
                  5. Contact Us
                </h2>
                <p>
                  If you have any questions or require the deletion or modification of your delegate registration records, please contact our logistics desk at:
                </p>
                <p className="bg-nbac-panel border border-nbac-border rounded-xl p-4 font-mono text-xs text-nbac-emerald inline-block">
                  legal@nbac.ng
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
