'use client'

import { motion } from 'framer-motion'
import { MapPin, Plane, Headphones, Navigation, ShieldCheck } from 'lucide-react'

export function ContactInfo() {
  const infoCards = [
    {
      title: 'Conference Venue',
      subtitle: 'Eko Convention Centre',
      icon: MapPin,
      details: 'Victoria Island, Lagos, Nigeria. The prestigious venue for West Africa\'s premier aviation panels, exhibitions, and networking events.',
      highlights: [
        'Helipad Access Coordinator',
        'Secure VIP Valet Parking',
        'Direct Airport Shuttle Access'
      ],
      badge: '6.4252° N, 3.4228° E',
      badgeIcon: Navigation
    },
    {
      title: 'Aviation & FBO Desk',
      subtitle: 'MMIA Lagos (LOS / DNMM)',
      icon: Plane,
      details: 'Logistical coordination for private aircraft arrivals, overflight permits, and ground handling at local Fixed-Base Operators (FBOs).',
      highlights: [
        'Customs & Immigration Fast-Track',
        'Helicopter Transfer Options',
        'Crew Logistics Coordination'
      ],
      badge: 'LOS / DNMM Airport',
      badgeIcon: Plane
    },
    {
      title: 'Executive Secretariat',
      subtitle: 'Sponsorship & VIP Liaison',
      icon: Headphones,
      details: 'Dedicated coordination desk for high-net-worth delegates, corporate sponsors, press credentials, and custom exhibition booths.',
      highlights: [
        'VVIP Delegate Fast-Track',
        'Custom Media Credentials',
        'Bespoke Partnership Layouts'
      ],
      badge: '24/7 Priority Support',
      badgeIcon: ShieldCheck
    }
  ]

  const cardHoverConfig = {
    y: -6,
    boxShadow: '0 12px 40px rgba(16, 185, 129, 0.08)',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 mb-6">
        <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
          Aviation & Venue Logistics
        </span>
        <h2 className="font-display text-2xl md:text-3xl font-bold text-nbac-text tracking-tight">
          Operational Contact Points
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {infoCards.map((card, idx) => {
          const Icon = card.icon
          const BadgeIcon = card.badgeIcon

          return (
            <motion.div
              key={idx}
              className="bg-nbac-panel/75 border border-nbac-border rounded-xl p-6 md:p-8 flex flex-col justify-between relative overflow-hidden group backdrop-blur-xl transition-colors duration-300 hover:border-nbac-emerald/40"
              whileHover={cardHoverConfig}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              {/* Background ambient lighting */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-nbac-emerald/[0.02] group-hover:bg-nbac-emerald/[0.04] blur-3xl rounded-full transition-all duration-500 pointer-events-none" />

              <div className="space-y-5 z-10 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="bg-nbac-emerald/10 p-3 rounded-lg text-nbac-emerald">
                      <Icon size={24} />
                    </div>
                    <div>
                      <span className="text-xs text-nbac-muted font-sans uppercase tracking-widest block">
                        {card.title}
                      </span>
                      <h3 className="font-sans text-lg font-bold text-nbac-text tracking-wide mt-0.5">
                        {card.subtitle}
                      </h3>
                    </div>
                  </div>

                  <span className="hidden sm:flex items-center gap-1.5 bg-nbac-emerald/10 text-nbac-emerald text-[10px] font-medium px-2.5 py-1 rounded-full uppercase tracking-wider">
                    <BadgeIcon size={10} />
                    {card.badge}
                  </span>
                </div>

                <p className="font-sans text-sm font-light text-nbac-body leading-relaxed">
                  {card.details}
                </p>

                <div className="border-t border-nbac-border/30 pt-4 space-y-2">
                  <span className="font-sans text-[10px] uppercase tracking-widest text-nbac-muted block mb-1">
                    Logistical Highlights
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {card.highlights.map((highlight, hIdx) => (
                      <div key={hIdx} className="flex items-center gap-2 text-xs font-light text-nbac-body">
                        <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watermark Logo */}
              <Icon
                size={160}
                className="absolute -bottom-10 -right-10 text-nbac-emerald/[0.01] group-hover:text-nbac-emerald/[0.03] group-hover:scale-105 transition-all duration-500 pointer-events-none"
              />
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
