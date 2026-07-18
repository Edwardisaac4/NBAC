import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { SectionEyebrow } from "@/components/shared/section-eyebrow"
import { MapPin, Plane, Hotel, Phone, Globe, ShieldCheck } from "lucide-react"

export default function HotelsPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-nbac-canvas text-nbac-text pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Hero */}
          <div className="max-w-3xl mb-16">
            <SectionEyebrow>LOGISTICS & ACCREDITED PARTNERS</SectionEyebrow>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              Hotels & Flight Operations
            </h1>
            <p className="font-sans text-nbac-body text-base leading-relaxed">
              Partner hotel listings, exclusive delegate rates, and executive FBO terminal information for delegates and inbound operators attending NBAC 2027 in Lagos, Nigeria.
            </p>
          </div>

          {/* FBO Flight Operations Section */}
          <div className="mb-20">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-nbac-emerald/10 text-nbac-emerald">
                <Plane className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-bold">Accredited FBO Terminals & Ground Handling</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border border-nbac-border rounded-xl p-8 bg-nbac-card/50 hover:border-nbac-emerald/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-xl font-bold text-nbac-text">EAN Aviation Terminal</h3>
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-nbac-emerald/10 text-nbac-emerald rounded-full">Primary Partner</span>
                </div>
                <p className="font-sans text-sm text-nbac-muted mb-6">
                  Full-service VIP ground handling, private customs and immigration clearance, jet fuel coordination, and dedicated executive lounge facilities at Murtala Muhammed International Airport (DNMM).
                </p>
                <div className="space-y-2 text-xs font-sans text-nbac-body border-t border-nbac-border pt-4">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-nbac-emerald" /> Murtala Muhammed Airport, Ikeja, Lagos</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-nbac-emerald" /> +234 (0) 1 295 1438</div>
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-nbac-emerald" /> ops@ean.aero</div>
                </div>
              </div>

              <div className="border border-nbac-border rounded-xl p-8 bg-nbac-card/50 hover:border-nbac-emerald/50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-display text-xl font-bold text-nbac-text">ExecuJet Aviation Nigeria</h3>
                  <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-nbac-emerald/10 text-nbac-emerald rounded-full">Accredited FBO</span>
                </div>
                <p className="font-sans text-sm text-nbac-muted mb-6">
                  Comprehensive flight support, hangarage, aircraft security supervision, and concierge ground transportation directly connecting to conference partner hotels.
                </p>
                <div className="space-y-2 text-xs font-sans text-nbac-body border-t border-nbac-border pt-4">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-nbac-emerald" /> General Aviation Terminal, Murtala Muhammed Airport</div>
                  <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-nbac-emerald" /> +234 (0) 1 295 8500</div>
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-nbac-emerald" /> fbo.dnmm@execujet.com</div>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Hotels Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-nbac-emerald/10 text-nbac-emerald">
                <Hotel className="w-6 h-6" />
              </div>
              <h2 className="font-display text-2xl font-bold">Partner Hotels & Delegate Accommodation</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border border-nbac-border rounded-xl p-6 bg-nbac-card/50 hover:border-nbac-emerald/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display text-lg font-bold">Lagos Marriott Hotel Ikeja</h3>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-nbac-emerald/20 text-nbac-emerald rounded">Official HQ</span>
                  </div>
                  <p className="font-sans text-xs text-nbac-muted mb-4">
                    Located just 5 minutes from the FBO terminals. Host hotel for NBAC 2027 panels and VIP networking functions.
                  </p>
                </div>
                <div className="border-t border-nbac-border pt-4 mt-4 flex items-center justify-between text-xs font-sans">
                  <span className="text-nbac-body">Special Delegate Rate</span>
                  <span className="font-bold text-nbac-emerald">From $280 / night</span>
                </div>
              </div>

              <div className="border border-nbac-border rounded-xl p-6 bg-nbac-card/50 hover:border-nbac-emerald/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display text-lg font-bold">Radisson Blu Hotel, Ikeja GRA</h3>
                  </div>
                  <p className="font-sans text-xs text-nbac-muted mb-4">
                    Luxury accommodation featuring secure shuttle service to both the airport FBO terminals and the main conference venue.
                  </p>
                </div>
                <div className="border-t border-nbac-border pt-4 mt-4 flex items-center justify-between text-xs font-sans">
                  <span className="text-nbac-body">Partner Rate</span>
                  <span className="font-bold text-nbac-emerald">From $240 / night</span>
                </div>
              </div>

              <div className="border border-nbac-border rounded-xl p-6 bg-nbac-card/50 hover:border-nbac-emerald/50 transition-colors flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-display text-lg font-bold">The Wheatbaker Lagos, Ikoyi</h3>
                  </div>
                  <p className="font-sans text-xs text-nbac-muted mb-4">
                    Boutique luxury hotel option in Ikoyi for delegates, speakers, and corporate executives seeking secluded privacy.
                  </p>
                </div>
                <div className="border-t border-nbac-border pt-4 mt-4 flex items-center justify-between text-xs font-sans">
                  <span className="text-nbac-body">Executive Rate</span>
                  <span className="font-bold text-nbac-emerald">From $350 / night</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </>
  )
}
