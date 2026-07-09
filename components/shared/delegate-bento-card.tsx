'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ShieldCheck, Crown, Plane, Award } from 'lucide-react'
import { PassTierDetails } from '@/types'
import { cn } from '@/lib/utils'

interface DelegateBentoCardProps {
  tier: PassTierDetails
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
  vip: {
    border: 'border-nbac-gold',
    leftBorder: 'border-l-nbac-gold',
    badgeBg: 'bg-gradient-to-r from-nbac-gold-light to-nbac-gold text-[#0b0f10]',
    glow: 'bg-nbac-gold/[0.08]',
    text: 'text-nbac-gold-light',
    hoverBorder: 'hover:border-nbac-gold/40',
    glowShadow: 'rgba(223, 183, 108, 0.25)',
    btnSelected: 'bg-gradient-to-r from-nbac-gold-light to-nbac-gold text-[#0b0f10] border-transparent shadow-nbac-gold/20 hover:shadow-nbac-gold/40',
    bulletBg: 'bg-nbac-gold-light',
    cardBg: 'bg-[#1a1712]/30 dark:bg-[#1a1712]/50',
    gradientText: 'bg-gradient-to-r from-nbac-gold-light via-[#f5d08b] to-nbac-gold bg-clip-text text-transparent'
  },
  exhibitor: {
    border: 'border-nbac-emerald',
    leftBorder: 'border-l-nbac-emerald',
    badgeBg: 'bg-gradient-to-r from-nbac-emerald-light to-nbac-emerald text-[#0b0f10]',
    glow: 'bg-nbac-emerald/[0.08]',
    text: 'text-nbac-emerald-light',
    hoverBorder: 'hover:border-nbac-emerald/40',
    glowShadow: 'rgba(16, 185, 129, 0.25)',
    btnSelected: 'bg-nbac-emerald text-white border-transparent shadow-nbac-emerald/20 hover:shadow-nbac-emerald/40',
    bulletBg: 'bg-nbac-emerald-light',
    cardBg: 'bg-[#121a17]/30 dark:bg-[#121a17]/50',
    gradientText: 'bg-gradient-to-r from-nbac-emerald-light via-[#34d399] to-nbac-emerald bg-clip-text text-transparent'
  },
  jet_display: {
    border: 'border-nbac-emerald-dark',
    leftBorder: 'border-l-nbac-emerald-dark',
    badgeBg: 'bg-gradient-to-r from-[#10b981] to-nbac-emerald-dark text-[#0b0f10]',
    glow: 'bg-nbac-emerald/[0.06]',
    text: 'text-nbac-emerald',
    hoverBorder: 'hover:border-nbac-emerald-dark/40',
    glowShadow: 'rgba(6, 110, 74, 0.2)',
    btnSelected: 'bg-nbac-emerald-dark text-white border-transparent shadow-nbac-emerald-dark/20 hover:shadow-nbac-emerald-dark/40',
    bulletBg: 'bg-nbac-emerald',
    cardBg: 'bg-[#12191a]/30 dark:bg-[#12191a]/50',
    gradientText: 'bg-gradient-to-r from-nbac-emerald via-[#10b981] to-nbac-emerald-dark bg-clip-text text-transparent'
  }
}

export function DelegateBentoCard({ tier, onViewBenefits }: DelegateBentoCardProps) {
  const theme = TIER_THEMES[tier.id] || TIER_THEMES.exhibitor
  const isVip = tier.id === 'vip'

  const getIcon = (themeText: string) => {
    switch (tier.id) {
      case 'vip':
        return <Crown className={cn(themeText, "h-6 w-6")} />
      case 'exhibitor':
        return <ShieldCheck className={cn(themeText, "h-6 w-6")} />
      case 'jet_display':
        return <Plane className={cn(themeText, "h-6 w-6 rotate-45")} />
      default:
        return <Award className={cn(themeText, "h-6 w-6")} />
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

    let label = 'Available'
    if (tier.availability === 'limited') {
      label = 'Limited'
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
        "relative rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 border cursor-pointer select-none overflow-hidden flex flex-col justify-between group focus:outline-none focus-visible:ring-2",
        isVip ? "focus-visible:ring-nbac-gold" : "focus-visible:ring-nbac-emerald",
        "bg-nbac-panel/40 border-nbac-border hover:bg-nbac-panel/70",
        theme.cardBg,
        theme.hoverBorder,
        isSoldOut && "opacity-40 cursor-not-allowed hover:border-nbac-border hover:shadow-none",
        isVip ? "md:col-span-2" : "col-span-1"
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
          
          {tier.badge && (
            <span className={cn("text-[10px] font-sans font-semibold uppercase tracking-wider block", theme.text)}>
              {tier.badge}
            </span>
          )}

          <div className="pt-2 flex items-baseline gap-2">
            <span className={cn("font-display text-3xl font-extrabold tracking-tight", theme.text)}>
              {formatPrice(tier.price)}
            </span>
            <span className="font-sans text-[10px] text-nbac-muted uppercase tracking-wider">
              USD {tier.billingModel === 'package' ? '/ package' : '/ delegate'}
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
