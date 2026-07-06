'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Crown, Plane, Award } from 'lucide-react'
import { SponsorTierDetails } from '@/types'
import { cn } from '@/lib/utils'

interface SponsorBentoCardProps {
  tier: SponsorTierDetails
  onViewBenefits: () => void
}

interface TierTheme {
  border: string
  leftBorder: string
  badgeBg: string
  glow: string
  text: string
  hoverBorder: string
  glowShadow: string
  btnSelected: string
  bulletBg: string
  cardBg: string
  gradientText: string
}

const TIER_THEMES: Record<string, TierTheme> = {
  title: {
    border: 'border-[#dfb76c]',
    leftBorder: 'border-l-[#dfb76c]',
    badgeBg: 'bg-gradient-to-r from-[#dfb76c] to-[#c5a059] text-[#0b0f10]',
    glow: 'bg-[#dfb76c]/[0.08]',
    text: 'text-[#dfb76c]',
    hoverBorder: 'hover:border-[#dfb76c]/40',
    glowShadow: 'rgba(223, 183, 108, 0.25)',
    btnSelected: 'bg-gradient-to-r from-[#dfb76c] to-[#c5a059] text-[#0b0f10] border-transparent shadow-[#dfb76c]/20 hover:shadow-[#dfb76c]/40',
    bulletBg: 'bg-[#dfb76c]',
    cardBg: 'bg-[#1a1712]/30 dark:bg-[#1a1712]/50',
    gradientText: 'bg-gradient-to-r from-[#dfb76c] via-[#f5d08b] to-[#c5a059] bg-clip-text text-transparent'
  },
  platinum: {
    border: 'border-[#b4b7d0]',
    leftBorder: 'border-l-[#b4b7d0]',
    badgeBg: 'bg-gradient-to-r from-[#b4b7d0] to-[#8f92ac] text-[#0b0f10]',
    glow: 'bg-[#b4b7d0]/[0.05]',
    text: 'text-[#b4b7d0]',
    hoverBorder: 'hover:border-[#b4b7d0]/40',
    glowShadow: 'rgba(180, 183, 208, 0.2)',
    btnSelected: 'bg-[#b4b7d0] text-[#0b0f10] border-transparent shadow-[#b4b7d0]/20 hover:shadow-[#b4b7d0]/40',
    bulletBg: 'bg-[#b4b7d0]',
    cardBg: 'bg-[#15161d]/30 dark:bg-[#15161d]/50',
    gradientText: 'bg-gradient-to-r from-[#b4b7d0] via-[#d1d4ed] to-[#8f92ac] bg-clip-text text-transparent'
  },
  gold: {
    border: 'border-[#d9a74a]',
    leftBorder: 'border-l-[#d9a74a]',
    badgeBg: 'bg-gradient-to-r from-[#d9a74a] to-[#b7852b] text-[#0b0f10]',
    glow: 'bg-[#d9a74a]/[0.05]',
    text: 'text-[#d9a74a]',
    hoverBorder: 'hover:border-[#d9a74a]/40',
    glowShadow: 'rgba(217, 167, 74, 0.2)',
    btnSelected: 'bg-[#d9a74a] text-[#0b0f10] border-transparent shadow-[#d9a74a]/20 hover:shadow-[#d9a74a]/40',
    bulletBg: 'bg-[#d9a74a]',
    cardBg: 'bg-[#191612]/30 dark:bg-[#191612]/50',
    gradientText: 'bg-gradient-to-r from-[#d9a74a] via-[#f7c96d] to-[#b7852b] bg-clip-text text-transparent'
  },
  silver: {
    border: 'border-[#94a3b8]',
    leftBorder: 'border-l-[#94a3b8]',
    badgeBg: 'bg-gradient-to-r from-[#94a3b8] to-[#64748b] text-[#0b0f10]',
    glow: 'bg-[#94a3b8]/[0.05]',
    text: 'text-[#94a3b8]',
    hoverBorder: 'hover:border-[#94a3b8]/40',
    glowShadow: 'rgba(148, 163, 184, 0.2)',
    btnSelected: 'bg-[#94a3b8] text-[#0b0f10] border-transparent shadow-[#94a3b8]/20 hover:shadow-[#94a3b8]/40',
    bulletBg: 'bg-[#94a3b8]',
    cardBg: 'bg-[#15181b]/30 dark:bg-[#15181b]/50',
    gradientText: 'bg-gradient-to-r from-[#94a3b8] via-[#cbd5e1] to-[#64748b] bg-clip-text text-transparent'
  },
  bronze: {
    border: 'border-[#cd7f32]',
    leftBorder: 'border-l-[#cd7f32]',
    badgeBg: 'bg-gradient-to-r from-[#cd7f32] to-[#a05a18] text-[#0b0f10]',
    glow: 'bg-[#cd7f32]/[0.05]',
    text: 'text-[#cd7f32]',
    hoverBorder: 'hover:border-[#cd7f32]/40',
    glowShadow: 'rgba(205, 127, 50, 0.2)',
    btnSelected: 'bg-[#cd7f32] text-[#0b0f10] border-transparent shadow-[#cd7f32]/20 hover:shadow-[#cd7f32]/40',
    bulletBg: 'bg-[#cd7f32]',
    cardBg: 'bg-[#191512]/30 dark:bg-[#191512]/50',
    gradientText: 'bg-gradient-to-r from-[#cd7f32] via-[#e8a35e] to-[#a05a18] bg-clip-text text-transparent'
  }
}

export function SponsorBentoCard({ tier, onViewBenefits }: SponsorBentoCardProps) {
  const theme = TIER_THEMES[tier.id] || TIER_THEMES.bronze
  const isTitle = tier.id === 'title'

  // Dynamic icon based on Tier
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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const getAvailabilityBadge = () => {
    if (tier.availability === 'sold_out') {
      return (
        <span className="bg-nbac-danger/15 text-nbac-danger border border-nbac-danger/35 text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
          Sold Out
        </span>
      )
    }

    let label = 'Open'
    if (tier.availability === 'limited') {
      if (tier.id === 'title') label = '1 Slot Available'
      else if (tier.id === 'platinum') label = '2 Slots Available'
      else if (tier.id === 'gold') label = '3 Slots Available'
      else if (tier.id === 'silver') label = '5 Slots Available'
      else label = 'Limited Slots'
    }

    return (
      <span className={cn("text-[9px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-current opacity-90", theme.text)}>
        {label}
      </span>
    )
  }

  const isSoldOut = tier.availability === 'sold_out'

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isSoldOut) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onViewBenefits()
    }
  }

  return (
    <motion.div
      role="button"
      tabIndex={isSoldOut ? -1 : 0}
      onKeyDown={handleKeyDown}
      onClick={() => !isSoldOut && onViewBenefits()}
      className={cn(
        "relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 border cursor-pointer select-none overflow-hidden flex flex-col justify-between group focus:outline-none focus-visible:ring-2 focus-visible:ring-nbac-gold",
        "bg-nbac-panel/40 border-nbac-border hover:bg-nbac-panel/70",
        theme.cardBg,
        theme.hoverBorder,
        isSoldOut && "opacity-40 cursor-not-allowed hover:border-nbac-border hover:shadow-none",
        isTitle ? "md:col-span-2" : "col-span-1"
      )}
      whileHover={!isSoldOut ? {
        y: -4,
        boxShadow: `0 12px 32px ${theme.glowShadow}`,
      } : {}}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Background glow when hovered */}
      <div className={cn(
        "absolute -right-24 -top-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-60",
        theme.glow
      )} />

      <div className="space-y-4">
        {/* Top bar */}
        <div className="flex justify-between items-center">
          <div className="bg-nbac-canvas/80 border border-nbac-border p-2.5 rounded-xl flex items-center justify-center shadow-inner">
            {getIcon(theme.text)}
          </div>
          <div className="flex items-center gap-2">
            {getAvailabilityBadge()}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between flex-wrap gap-x-2">
            <h3 className={cn("font-sans text-xl font-black uppercase tracking-wide", theme.gradientText || theme.text)}>
              {tier.name}
            </h3>
          </div>
          
          <p className="font-sans text-xs font-light text-nbac-body leading-relaxed max-w-2xl">
            {tier.description}
          </p>

          <div className="pt-2 flex items-baseline gap-2">
            <span className={cn("font-display text-3xl font-extrabold tracking-tight", theme.text)}>
              {formatPrice(tier.price)}
            </span>
            <span className="font-sans text-[10px] text-nbac-muted uppercase tracking-wider">
              USD / Partnership
            </span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className="pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onViewBenefits()
            }}
            className="w-full bg-nbac-canvas/60 border border-nbac-border hover:border-nbac-border/80 hover:text-nbac-text text-nbac-body font-sans font-semibold py-3 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>View Full Benefits</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
