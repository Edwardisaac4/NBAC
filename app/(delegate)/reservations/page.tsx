'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { PassTierCard } from "@/components/shared/pass-tier-card"
import { RegistrationFormUI } from "@/components/sections/registration-form-ui"
import { SponsorBentoGrid } from "@/components/sections/sponsor-bento-grid"
import { PassTierDetails } from "@/types"

const passTiers: PassTierDetails[] = [
  {
    id: 'vip',
    name: 'VIP Delegate Pass',
    badge: 'Executive Delegate',
    price: 250000,
    currency: 'NGN',
    availability: 'available',
    billingModel: 'per_delegate',
    includedDelegates: 1,
    privileges: [
      'Admission to all keynote speeches, panel debates, and workshops',
      'Exclusive access to the aircraft static display ramp',
      'Daily networking gourmet lunch buffet & premium coffee lounges',
      'Official NBAC delegate gift package and conference materials',
      'Access to digital networking app & private matchmaking portal'
    ]
  },
  {
    id: 'exhibitor',
    name: 'Exhibitor Pass',
    badge: 'Corporate Exhibitor',
    price: 750000,
    currency: 'NGN',
    availability: 'limited',
    billingModel: 'package',
    includedDelegates: 2,
    privileges: [
      'Premium 3m x 3m designated exhibition space in main hall',
      'Two (2) full delegate access passes for company representatives',
      'Corporate profile listing in the official conference program',
      'Double-sided profile display on digital exhibition pillars',
      'Priority access to corporate press release desk & media lounge'
    ]
  },
  {
    id: 'jet_display',
    name: 'Jet Display Pass',
    badge: 'Aircraft Operator',
    price: 1800000,
    currency: 'NGN',
    availability: 'available',
    billingModel: 'package',
    includedDelegates: 4,
    privileges: [
      'Reserved ramp parking slot for one (1) display aircraft',
      'Four (4) VIP All-Access delegate passes for company executives',
      'Complimentary corporate chalet / hosting lounge privilege',
      'Full-page feature advertisement in the official event digest',
      'Fast-track VIP diplomatic clearance & customs coordination'
    ]
  }
]

export default function ReservationsPage() {
  const [activeTab, setActiveTab] = useState<'delegate' | 'sponsor'>('delegate')
  const [selectedTier, setSelectedTier] = useState<PassTierDetails | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tab = params.get('type') || params.get('tab')
    if (tab === 'sponsor') {
      const timer = setTimeout(() => {
        setActiveTab('sponsor')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleTabChange = (tab: 'delegate' | 'sponsor') => {
    setActiveTab(tab)
    setSelectedTier(null)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('type', tab)
      window.history.pushState({}, '', url.toString())
    }
  }

  const handleSelectTier = (tier: PassTierDetails) => {
    setSelectedTier(tier)
  }

  return (
    <>
      <Navbar />
      
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-28 pb-12 md:pb-16">
        
        {/* Top Hero Header Section */}
        <section className="max-w-7xl mx-auto px-6 md:px-12 w-full pt-6 pb-6">
          <div className="flex flex-col space-y-3">
            <span className="font-sans text-xs uppercase tracking-widest font-semibold text-nbac-emerald-light">
              ANNUAL CONFERENCE & EXHIBITION
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-nbac-text tracking-tight max-w-4xl">
              {activeTab === 'delegate' ? 'Secure Your Delegate Pass' : 'Corporate Partnership Desk'}
            </h1>
            <p className="font-sans text-sm md:text-base font-light text-nbac-body max-w-3xl leading-relaxed">
              {activeTab === 'delegate'
                ? 'Select your access package to secure your presence among business aviation leaders, operators, regulators, and high-net-worth investors at West Africa\'s premier aviation summit.'
                : 'Partner with the premier business aviation conference in West Africa. Choose a sponsorship level to align your brand with elite operators, regulators, and high-net-worth jet owners.'}
            </p>
          </div>
        </section>

        {/* Tab Selection Bar */}
        <div className="flex justify-center mb-10">
          <div className="bg-nbac-panel/60 border border-nbac-border p-1.5 rounded-full flex items-center relative select-none">
            <button
              onClick={() => handleTabChange('delegate')}
              className="relative px-6 py-2.5 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-colors duration-300 cursor-pointer focus:outline-none"
            >
              {activeTab === 'delegate' && (
                <motion.div
                  layoutId="activeFormTab"
                  className="absolute inset-0 bg-linear-to-r from-nbac-emerald to-[#059669] rounded-full shadow-[0_4px_15px_rgba(16,185,129,0.25)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === 'delegate' ? "text-white" : "text-nbac-muted hover:text-nbac-text"}`}>
                Delegate Registration
              </span>
            </button>
            <button
              onClick={() => handleTabChange('sponsor')}
              className="relative px-6 py-2.5 rounded-full font-sans font-bold text-xs uppercase tracking-wider transition-colors duration-300 cursor-pointer focus:outline-none"
            >
              {activeTab === 'sponsor' && (
                <motion.div
                  layoutId="activeFormTab"
                  className="absolute inset-0 bg-linear-to-r from-nbac-gold to-nbac-gold-light rounded-full shadow-[0_4px_15px_rgba(197,160,89,0.25)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
              )}
              <span className={`relative z-10 ${activeTab === 'sponsor' ? "text-[#0b0f10]" : "text-nbac-muted hover:text-nbac-text"}`}>
                Sponsor Partnership
              </span>
            </button>
          </div>
        </div>

        {/* Form and Selection Split Grid / Full Width Bento */}
        {activeTab === 'delegate' ? (
          <section className="max-w-7xl mx-auto px-6 md:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left side: Package Cards Stack/Grid */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-6 md:grid md:grid-cols-3 lg:flex lg:flex-col lg:gap-6">
              {passTiers.map((tier) => (
                <PassTierCard
                  key={tier.id}
                  tier={tier}
                  isSelected={selectedTier?.id === tier.id}
                  onSelect={() => handleSelectTier(tier)}
                />
              ))}
            </div>

            {/* Right side: Credentials Form Box */}
            <div className="lg:col-span-6 xl:col-span-5 h-full">
              <RegistrationFormUI selectedTier={selectedTier} />
            </div>
          </section>
        ) : (
          <section className="max-w-7xl mx-auto px-6 md:px-12 w-full">
            <SponsorBentoGrid />
          </section>
        )}

      </main>

      <Footer />
    </>
  )
}
