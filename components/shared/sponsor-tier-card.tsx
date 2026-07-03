'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ShieldCheck, Crown, Plane, Award, ChevronDown, ChevronUp } from 'lucide-react'
import { SponsorTierDetails } from '@/types'
import { cn } from '@/lib/utils'

interface SponsorTierCardProps {
  tier: SponsorTierDetails
  isSelected: boolean
  onSelect: () => void
}

interface TierColorTheme {
  border: string;
  leftBorder: string;
  badgeBg: string;
  glow: string;
  text: string;
  hoverBorder: string;
  glowShadow: string;
  btnSelected: string;
  bulletBg: string;
}

const TIER_THEMES: Record<string, TierColorTheme> = {
  title: {
    border: 'border-[#dfb76c]',
    leftBorder: 'border-l-[#dfb76c]',
    badgeBg: 'bg-[#dfb76c] text-[#0b0f10]',
    glow: 'bg-[#dfb76c]/[0.05]',
    text: 'text-[#dfb76c]',
    hoverBorder: 'hover:border-[#dfb76c]/30',
    glowShadow: 'rgba(223, 183, 108, 0.15)',
    btnSelected: 'bg-gradient-to-r from-[#dfb76c] to-[#c5a059] text-[#0b0f10] border-transparent shadow-[#dfb76c]/15 hover:shadow-[#dfb76c]/35',
    bulletBg: 'bg-[#dfb76c]'
  },
  platinum: {
    border: 'border-[#b4b7d0]',
    leftBorder: 'border-l-[#b4b7d0]',
    badgeBg: 'bg-[#b4b7d0] text-[#0b0f10]',
    glow: 'bg-[#b4b7d0]/[0.05]',
    text: 'text-[#b4b7d0]',
    hoverBorder: 'hover:border-[#b4b7d0]/30',
    glowShadow: 'rgba(180, 183, 208, 0.15)',
    btnSelected: 'bg-[#b4b7d0] text-[#0b0f10] border-transparent shadow-[#b4b7d0]/15 hover:shadow-[#b4b7d0]/35',
    bulletBg: 'bg-[#b4b7d0]'
  },
  gold: {
    border: 'border-[#d9a74a]',
    leftBorder: 'border-l-[#d9a74a]',
    badgeBg: 'bg-[#d9a74a] text-[#0b0f10]',
    glow: 'bg-[#d9a74a]/[0.05]',
    text: 'text-[#d9a74a]',
    hoverBorder: 'hover:border-[#d9a74a]/30',
    glowShadow: 'rgba(217, 167, 74, 0.15)',
    btnSelected: 'bg-[#d9a74a] text-[#0b0f10] border-transparent shadow-[#d9a74a]/15 hover:shadow-[#d9a74a]/35',
    bulletBg: 'bg-[#d9a74a]'
  },
  silver: {
    border: 'border-[#94a3b8]',
    leftBorder: 'border-l-[#94a3b8]',
    badgeBg: 'bg-[#94a3b8] text-[#0b0f10]',
    glow: 'bg-[#94a3b8]/[0.05]',
    text: 'text-[#94a3b8]',
    hoverBorder: 'hover:border-[#94a3b8]/30',
    glowShadow: 'rgba(148, 163, 184, 0.15)',
    btnSelected: 'bg-[#94a3b8] text-[#0b0f10] border-transparent shadow-[#94a3b8]/15 hover:shadow-[#94a3b8]/35',
    bulletBg: 'bg-[#94a3b8]'
  },
  bronze: {
    border: 'border-[#cd7f32]',
    leftBorder: 'border-l-[#cd7f32]',
    badgeBg: 'bg-[#cd7f32] text-[#0b0f10]',
    glow: 'bg-[#cd7f32]/[0.05]',
    text: 'text-[#cd7f32]',
    hoverBorder: 'hover:border-[#cd7f32]/30',
    glowShadow: 'rgba(205, 127, 50, 0.15)',
    btnSelected: 'bg-[#cd7f32] text-[#0b0f10] border-transparent shadow-[#cd7f32]/15 hover:shadow-[#cd7f32]/35',
    bulletBg: 'bg-[#cd7f32]'
  }
}

export function SponsorTierCard({ tier, isSelected, onSelect }: SponsorTierCardProps) {
  const [showDetails, setShowDetails] = useState(isSelected)
  const theme = TIER_THEMES[tier.id] || TIER_THEMES.bronze

  // Select tier icon based on ID
  const getIcon = (themeText: string) => {
    switch (tier.id) {
      case 'title':
        return <Crown className={cn(themeText, "h-6 w-6")} />
      case 'platinum':
        return <Award className={cn(themeText, "h-6 w-6")} />
      case 'gold':
        return <ShieldCheck className={cn(themeText, "h-6 w-6")} />
      case 'silver':
        return <Plane className={cn(themeText, "h-6 w-6 rotate-45")} />
      case 'bronze':
        return <Award className={cn(themeText, "h-6 w-6")} />
      default:
        return <Crown className={cn(themeText, "h-6 w-6")} />
    }
  }

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  // Check availability styling
  const getAvailabilityBadge = (themeColor: TierColorTheme) => {
    switch (tier.availability) {
      case 'available':
        return (
          <span className={cn("text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full select-none", themeColor.badgeBg)}>
            Open
          </span>
        )
      case 'limited':
        let label = 'Limited Slots'
        if (tier.id === 'title') label = 'ONE AVAILABLE - EXCLUSIVE'
        else if (tier.id === 'platinum') label = 'TWO AVAILABLE'
        else if (tier.id === 'gold') label = 'THREE AVAILABLE'
        else if (tier.id === 'silver') label = 'FIVE AVAILABLE'
        return (
          <span className={cn("text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full select-none", themeColor.badgeBg)}>
            {label}
          </span>
        )
      case 'sold_out':
        return (
          <span className="bg-nbac-danger/10 text-nbac-danger border border-nbac-danger/20 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full select-none">
            Sold Out
          </span>
        )
      default:
        return null
    }
  }

  const isSoldOut = tier.availability === 'sold_out'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSoldOut) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  // Define column headers depending on tier
  const getSpeakingHeader = () => {
    if (tier.id === 'silver' || tier.id === 'bronze') {
      return 'Content & Collateral'
    }
    return 'Speaking & Content'
  }

  return (
    <motion.div
      role="button"
      tabIndex={isSoldOut ? -1 : 0}
      onKeyDown={handleKeyDown}
      onClick={() => !isSoldOut && onSelect()}
      className={cn(
        "relative rounded-xl p-5 md:p-6 backdrop-blur-xl transition-all duration-300 border cursor-pointer select-none overflow-hidden flex flex-col justify-between h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-nbac-gold",
        isSelected
          ? cn("bg-nbac-panel shadow-[0_12px_40px_rgba(197,160,89,0.08)] border-l-4", theme.border, theme.leftBorder)
          : cn("bg-nbac-panel/40 border-nbac-border hover:bg-nbac-panel/70", theme.hoverBorder),
        isSoldOut && "opacity-50 cursor-not-allowed hover:border-nbac-border hover:shadow-none"
      )}
      whileHover={!isSoldOut ? {
        y: -3,
        boxShadow: isSelected
          ? `0 12px 40px ${theme.glowShadow}`
          : `0 12px 32px ${theme.glowShadow}`,
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Glow highlight for selected */}
      {isSelected && (
        <div className={cn("absolute -right-24 -top-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none", theme.glow)} />
      )}

      <div className="space-y-4">
        {/* Header Row */}
        <div className="flex justify-between items-center">
          <div className="bg-nbac-canvas/80 border border-nbac-border p-2.5 rounded-lg flex items-center justify-center">
            {getIcon(theme.text)}
          </div>
          <div className="flex items-center gap-2">
            {getAvailabilityBadge(theme)}
          </div>
        </div>

        {/* Pricing details */}
        <div>
          <h3 className={cn("font-sans text-lg font-bold uppercase tracking-wide", theme.text)}>
            {tier.name}
          </h3>
          {tier.id !== 'bronze' && (
            <span className="text-[10px] font-sans font-medium uppercase tracking-wider block mt-0.5 text-nbac-muted">
              {tier.id === 'title' ? 'Exclusive Conference Co-owner' : 'Conference Partner'}
            </span>
          )}
          <p className="font-sans text-xs font-light text-nbac-body mt-2 leading-relaxed">
            {tier.description}
          </p>
          <div className="mt-3 flex items-baseline">
            <span className={cn("font-display text-3xl font-extrabold tracking-tight", theme.text)}>
              {formatPrice(tier.price)}
            </span>
            <span className="font-sans text-xs text-nbac-muted ml-2">
              USD / partnership
            </span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(!showDetails)
            }}
            className="flex-1 bg-[#0b0f10]/60 border border-nbac-border hover:border-nbac-border/80 hover:text-nbac-text text-nbac-body font-sans font-medium py-2 rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
          >
            <span className={showDetails ? "text-nbac-text" : "text-nbac-body"}>{showDetails ? 'Hide Benefits' : 'View Benefits'}</span>
            {showDetails ? <ChevronUp size={14} className="text-nbac-muted" /> : <ChevronDown size={14} className="text-nbac-muted" />}
          </button>
          
          <button
            disabled={isSoldOut}
            className={cn(
              "flex-1 font-sans font-bold py-2.5 rounded-lg text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border",
              isSelected
                ? theme.btnSelected
                : "border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-panel/80",
              isSoldOut && "border-nbac-border text-nbac-muted bg-transparent hover:bg-transparent"
            )}
          >
            {isSelected ? 'Selected' : isSoldOut ? 'Sold Out' : 'Select Tier'}
          </button>
        </div>

        {/* Collapsible Benefits Details */}
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-nbac-border/60 pt-4 mt-2"
              onClick={(e) => e.stopPropagation()} // Prevent card selection when interacting with details
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Branding & Presence */}
                <div className="space-y-2.5">
                  <h5 className={cn("font-sans text-[10px] uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-1 flex items-center gap-1.5", theme.text)}>
                    <span className={cn("h-1 w-1 rounded-full", theme.bulletBg)} />
                    Branding & Presence
                  </h5>
                  <ul className="space-y-2">
                    {tier.brandingPrivileges.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={12} className={cn(theme.text, "shrink-0 mt-0.5")} />
                        <span className="font-sans text-[11px] text-nbac-body leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Speaking & Content / Collateral */}
                <div className="space-y-2.5">
                  <h5 className={cn("font-sans text-[10px] uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-1 flex items-center gap-1.5", theme.text)}>
                    <span className={cn("h-1 w-1 rounded-full", theme.bulletBg)} />
                    {getSpeakingHeader()}
                  </h5>
                  <ul className="space-y-2">
                    {tier.speakingPrivileges.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={12} className={cn(theme.text, "shrink-0 mt-0.5")} />
                        <span className="font-sans text-[11px] text-nbac-body leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Digital, Media & Access */}
                <div className="space-y-2.5">
                  <h5 className={cn("font-sans text-[10px] uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-1 flex items-center gap-1.5", theme.text)}>
                    <span className={cn("h-1 w-1 rounded-full", theme.bulletBg)} />
                    Digital, Media & Access
                  </h5>
                  <ul className="space-y-2">
                    {tier.digitalPrivileges.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={12} className={cn(theme.text, "shrink-0 mt-0.5")} />
                        <span className="font-sans text-[11px] text-nbac-body leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
