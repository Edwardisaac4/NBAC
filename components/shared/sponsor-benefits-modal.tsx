'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ShieldCheck, Crown, Plane, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SponsorTierDetails } from '@/types'
import { cn } from '@/lib/utils'

interface SponsorBenefitsModalProps {
  tier: SponsorTierDetails | null
  isOpen: boolean
  onClose: () => void
}

interface TierTheme {
  border: string
  leftBorder: string
  badgeBg: string
  glow: string
  text: string
  glowShadow: string
  btnSelected: string
  bulletBg: string
  cardBg: string
  gradientText: string
}

const TIER_THEMES: Record<string, TierTheme> = {
  title: {
    border: 'border-nbac-gold',
    leftBorder: 'border-l-nbac-gold',
    badgeBg: 'bg-gradient-to-r from-nbac-gold-light to-nbac-gold text-[#0b0f10]',
    glow: 'bg-nbac-gold/[0.08]',
    text: 'text-nbac-gold-light',
    glowShadow: 'rgba(223, 183, 108, 0.25)',
    btnSelected: 'bg-gradient-to-r from-nbac-gold-light to-nbac-gold text-[#0b0f10] border-transparent shadow-nbac-gold/20 hover:shadow-nbac-gold/40',
    bulletBg: 'bg-nbac-gold-light',
    cardBg: 'bg-[#1a1712]/50',
    gradientText: 'bg-gradient-to-r from-nbac-gold-light via-[#f5d08b] to-nbac-gold bg-clip-text text-transparent'
  },
  platinum: {
    border: 'border-[#b4b7d0]',
    leftBorder: 'border-l-[#b4b7d0]',
    badgeBg: 'bg-gradient-to-r from-[#b4b7d0] to-[#8f92ac] text-[#0b0f10]',
    glow: 'bg-[#b4b7d0]/[0.05]',
    text: 'text-[#b4b7d0]',
    glowShadow: 'rgba(180, 183, 208, 0.2)',
    btnSelected: 'bg-[#b4b7d0] text-[#0b0f10] border-transparent shadow-[#b4b7d0]/20 hover:shadow-[#b4b7d0]/40',
    bulletBg: 'bg-[#b4b7d0]',
    cardBg: 'bg-[#15161d]/50',
    gradientText: 'bg-gradient-to-r from-[#b4b7d0] via-[#d1d4ed] to-[#8f92ac] bg-clip-text text-transparent'
  },
  gold: {
    border: 'border-nbac-gold-dark',
    leftBorder: 'border-l-nbac-gold-dark',
    badgeBg: 'bg-gradient-to-r from-nbac-gold to-nbac-gold-dark text-[#0b0f10]',
    glow: 'bg-nbac-gold/[0.05]',
    text: 'text-nbac-gold',
    glowShadow: 'rgba(197, 160, 89, 0.2)',
    btnSelected: 'bg-nbac-gold text-[#0b0f10] border-transparent shadow-nbac-gold/20 hover:shadow-nbac-gold/40',
    bulletBg: 'bg-nbac-gold',
    cardBg: 'bg-[#191612]/50',
    gradientText: 'bg-gradient-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold-dark bg-clip-text text-transparent'
  },
  silver: {
    border: 'border-[#94a3b8]',
    leftBorder: 'border-l-[#94a3b8]',
    badgeBg: 'bg-gradient-to-r from-[#94a3b8] to-[#64748b] text-[#0b0f10]',
    glow: 'bg-[#94a3b8]/[0.05]',
    text: 'text-[#94a3b8]',
    glowShadow: 'rgba(148, 163, 184, 0.2)',
    btnSelected: 'bg-[#94a3b8] text-[#0b0f10] border-transparent shadow-[#94a3b8]/20 hover:shadow-[#94a3b8]/40',
    bulletBg: 'bg-[#94a3b8]',
    cardBg: 'bg-[#15181b]/50',
    gradientText: 'bg-gradient-to-r from-[#94a3b8] via-[#cbd5e1] to-[#64748b] bg-clip-text text-transparent'
  },
  bronze: {
    border: 'border-[#cd7f32]',
    leftBorder: 'border-l-[#cd7f32]',
    badgeBg: 'bg-gradient-to-r from-[#cd7f32] to-[#a05a18] text-[#0b0f10]',
    glow: 'bg-[#cd7f32]/[0.05]',
    text: 'text-[#cd7f32]',
    glowShadow: 'rgba(205, 127, 50, 0.2)',
    btnSelected: 'bg-[#cd7f32] text-[#0b0f10] border-transparent shadow-[#cd7f32]/20 hover:shadow-[#cd7f32]/40',
    bulletBg: 'bg-[#cd7f32]',
    cardBg: 'bg-[#191512]/50',
    gradientText: 'bg-gradient-to-r from-[#cd7f32] via-[#e8a35e] to-[#a05a18] bg-clip-text text-transparent'
  }
}

const dialogVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  visible: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 16 }
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
}

export function SponsorBenefitsModal({ tier, isOpen, onClose }: SponsorBenefitsModalProps) {
  const router = useRouter()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!tier) return null

  const theme = TIER_THEMES[tier.id] || TIER_THEMES.bronze

  const getIcon = (themeText: string) => {
    switch (tier.id) {
      case 'title':
        return <Crown className={cn(themeText, "h-7 w-7")} />
      case 'platinum':
        return <Award className={cn(themeText, "h-7 w-7")} />
      case 'gold':
        return <ShieldCheck className={cn(themeText, "h-7 w-7")} />
      case 'silver':
        return <Plane className={cn(themeText, "h-7 w-7 rotate-45")} />
      case 'bronze':
        return <Award className={cn(themeText, "h-7 w-7")} />
      default:
        return <Crown className={cn(themeText, "h-7 w-7")} />
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price)
  }

  const handleSelectTier = () => {
    onClose()
    router.push(`/contact/sponsor?tier=${tier.id}`)
  }

  const getSpeakingHeader = () => {
    if (tier.id === 'silver' || tier.id === 'bronze') {
      return 'Content & Collateral'
    }
    return 'Speaking & Content'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          {/* Backdrop Scrim */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            variants={dialogVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-4xl bg-nbac-panel/95 border border-nbac-border rounded-2xl shadow-2xl overflow-hidden z-10 glass-card"
            style={{
              boxShadow: `0 20px 50px rgba(0, 0, 0, 0.6), 0 0 40px ${theme.glowShadow}`
            }}
          >
            {/* Ambient Background Glow */}
            <div className={cn("absolute -top-32 -left-32 w-64 h-64 rounded-full blur-3xl pointer-events-none", theme.glow)} />
            <div className={cn("absolute -bottom-32 -right-32 w-64 h-64 rounded-full blur-3xl pointer-events-none", theme.glow)} />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-nbac-canvas/40 hover:bg-nbac-canvas/80 text-nbac-text hover:text-nbac-gold flex items-center justify-center transition-all duration-200 cursor-pointer"
              aria-label="Close Dialog"
            >
              <X size={18} />
            </button>

            {/* Content Scroll Area */}
            <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
              {/* Header Info */}
              <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start mb-8 border-b border-nbac-border pb-6">
                <div className="bg-nbac-canvas/80 border border-nbac-border p-4 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                  {getIcon(theme.text)}
                </div>

                <div className="text-center md:text-left flex-1 space-y-2">
                  <span className={cn("font-sans text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-current select-none", theme.text)}>
                    {tier.availability === 'sold_out' ? 'Sold Out' : tier.badge || 'Open'}
                  </span>
                  
                  <h3 className="font-sans text-3xl font-black uppercase tracking-wide">
                    {tier.name}
                  </h3>

                  <p className="font-sans text-sm font-light text-nbac-body leading-relaxed max-w-2xl">
                    {tier.description}
                  </p>

                  <div className="pt-2 flex items-baseline justify-center md:justify-start gap-2">
                    <span className={cn("font-display text-4xl font-extrabold tracking-tight", theme.text)}>
                      {formatPrice(tier.price)}
                    </span>
                    <span className="font-sans text-xs text-nbac-muted uppercase tracking-wider">
                      USD / Partnership
                    </span>
                  </div>
                </div>
              </div>

              {/* Benefits Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mb-8">
                {/* Column 1: Branding & Presence */}
                <div className="space-y-3">
                  <h4 className={cn("font-sans text-xs uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-2 flex items-center gap-1.5", theme.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", theme.bulletBg)} />
                    Branding & Presence
                  </h4>
                  <ul className="space-y-3">
                    {tier.brandingPrivileges.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={14} className={cn(theme.text, "shrink-0 mt-0.5")} />
                        <span className="font-sans text-xs text-nbac-body leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Speaking & Content */}
                <div className="space-y-3">
                  <h4 className={cn("font-sans text-xs uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-2 flex items-center gap-1.5", theme.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", theme.bulletBg)} />
                    {getSpeakingHeader()}
                  </h4>
                  <ul className="space-y-3">
                    {tier.speakingPrivileges.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={14} className={cn(theme.text, "shrink-0 mt-0.5")} />
                        <span className="font-sans text-xs text-nbac-body leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 3: Digital, Media & Access */}
                <div className="space-y-3">
                  <h4 className={cn("font-sans text-xs uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-2 flex items-center gap-1.5", theme.text)}>
                    <span className={cn("h-1.5 w-1.5 rounded-full", theme.bulletBg)} />
                    Digital, Media & Access
                  </h4>
                  <ul className="space-y-3">
                    {tier.digitalPrivileges.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check size={14} className={cn(theme.text, "shrink-0 mt-0.5")} />
                        <span className="font-sans text-xs text-nbac-body leading-relaxed font-light">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-4 border-t border-nbac-border">
                <button
                  onClick={handleSelectTier}
                  disabled={tier.availability === 'sold_out'}
                  className={cn(
                    "w-full md:w-auto font-sans font-bold px-8 py-4 rounded-full text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 border cursor-pointer",
                    tier.availability === 'sold_out'
                      ? "border-nbac-border text-nbac-muted bg-transparent cursor-not-allowed"
                      : "bg-linear-to-r from-nbac-gold to-nbac-gold-light text-[#0b0f10] border-transparent shadow-[0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[0_6px_20px_rgba(197,160,89,0.45)] hover:scale-[1.01] active:scale-[0.99]"
                  )}
                >
                  {tier.availability === 'sold_out' ? 'Sold Out' : `Select ${tier.name} Tier`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
