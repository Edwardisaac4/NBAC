'use client'

import { motion } from 'framer-motion'
import { MapPin, Plane, Mail, Phone, Globe, Clock, Navigation } from 'lucide-react'

export function ContactInfo() {
  const cardHoverConfig = {
    y: -6,
    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.08)',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 mb-6">
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
          Conference Host & Secretariat
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
          EAN Aviation
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Card 1: Hangar Jet Center & Address */}
        <motion.div
          className="bg-nbac-panel/75 border border-nbac-border rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group backdrop-blur-xl transition-colors duration-300 hover:border-nbac-emerald/40"
          whileHover={cardHoverConfig}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-nbac-emerald/[0.02] group-hover:bg-nbac-emerald/[0.04] blur-3xl rounded-full transition-all duration-500 pointer-events-none" />

          <div className="space-y-5 z-10 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-nbac-emerald/10 p-3 rounded-lg text-nbac-emerald">
                  <MapPin size={24} />
                </div>
                <div>
                  <span className="text-xs text-nbac-muted font-sans uppercase tracking-widest block">
                    Headquarters & FBO Terminal
                  </span>
                  <h3 className="font-sans text-lg font-bold text-nbac-text tracking-wide mt-0.5">
                    EAN Hangar Jet Center
                  </h3>
                </div>
              </div>

              <span className="hidden sm:flex items-center gap-1.5 bg-nbac-emerald/10 text-nbac-emerald text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Navigation size={10} />
                LOS / DNMM Airport
              </span>
            </div>

            <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
              Murtala Muhammed International Airport,<br />
              FAAN Transit Camp Road, Ikeja,<br />
              Lagos, Nigeria.
            </p>

            <div className="border-t border-nbac-border/30 pt-4 space-y-2">
              <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted block mb-1">
                FBO & Terminal Capabilities
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Private VIP FBO Hangar</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Secure VIP Apron Access</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Helipad Access Coordinating Desk</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Crew & Passenger VIP Lounges</span>
                </div>
              </div>
            </div>
          </div>

          <MapPin
            size={160}
            className="absolute -bottom-10 -right-10 text-nbac-emerald/[0.01] group-hover:text-nbac-emerald/[0.03] group-hover:scale-105 transition-all duration-500 pointer-events-none"
          />
        </motion.div>

        {/* Card 2: Contact Details & Communications */}
        <motion.div
          className="bg-nbac-panel/75 border border-nbac-border rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group backdrop-blur-xl transition-colors duration-300 hover:border-nbac-emerald/40"
          whileHover={cardHoverConfig}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-nbac-emerald/[0.02] group-hover:bg-nbac-emerald/[0.04] blur-3xl rounded-full transition-all duration-500 pointer-events-none" />

          <div className="space-y-5 z-10 relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-nbac-emerald/10 p-3 rounded-lg text-nbac-emerald">
                  <Phone size={24} />
                </div>
                <div>
                  <span className="text-xs text-nbac-muted font-sans uppercase tracking-widest block">
                    Contact Channels
                  </span>
                  <h3 className="font-sans text-lg font-bold text-nbac-text tracking-wide mt-0.5">
                    Operations & Info
                  </h3>
                </div>
              </div>

              <span className="hidden sm:flex items-center gap-1.5 bg-nbac-emerald/10 text-nbac-emerald text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                <Clock size={10} />
                24/7 Priority Support
              </span>
            </div>

            <div className="space-y-3 font-sans text-sm font-light text-nbac-body">
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-nbac-emerald shrink-0" />
                <a href="mailto:info@ean.aero" className="hover:text-nbac-emerald transition-colors">
                  info@ean.aero
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-nbac-emerald shrink-0" />
                <div className="flex flex-col sm:flex-row sm:gap-2">
                  <a href="tel:+23412950960" className="hover:text-nbac-emerald transition-colors">
                    +234 (0) 1 295 0960
                  </a>
                  <span className="hidden sm:inline text-nbac-muted">/</span>
                  <a href="tel:+2348100193068" className="hover:text-nbac-emerald transition-colors">
                    +234 (0) 810 019 3068
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Globe size={16} className="text-nbac-emerald shrink-0" />
                <a href="https://www.ean.aero" target="_blank" rel="noopener noreferrer" className="hover:text-nbac-emerald transition-colors">
                  www.ean.aero
                </a>
              </div>
            </div>

            <div className="border-t border-nbac-border/30 pt-4 space-y-2">
              <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted block mb-1">
                Delegate & Sponsor Support
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Sponsorship & Booth Inquiry</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>VVIP Delegate Liaison</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Media & Press Credentials</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-light text-nbac-body">
                  <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                  <span>Flight Planning & Landing Permits</span>
                </div>
              </div>
            </div>
          </div>

          <Plane
            size={160}
            className="absolute -bottom-10 -right-10 text-nbac-emerald/[0.01] group-hover:text-nbac-emerald/[0.03] group-hover:scale-105 transition-all duration-500 pointer-events-none"
          />
        </motion.div>
      </div>
    </div>
  )
}

