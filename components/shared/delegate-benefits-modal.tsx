'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check, ShieldCheck, Crown, Plane, Award } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PassTierDetails } from '@/types'
import { cn } from '@/lib/utils'

interface DelegateBenefitsModalProps {
  tier: PassTierDetails | null
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
  vip: {
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
  exhibitor: {
    border: 'border-nbac-emerald',
    leftBorder: 'border-l-nbac-emerald',
    badgeBg: 'bg-gradient-to-r from-nbac-emerald-light to-nbac-emerald text-[#0b0f10]',
    glow: 'bg-nbac-emerald/[0.08]',
    text: 'text-nbac-emerald-light',
    glowShadow: 'rgba(16, 185, 129, 0.25)',
    btnSelected: 'bg-nbac-emerald text-white border-transparent shadow-nbac-emerald/20 hover:shadow-nbac-emerald/40',
    bulletBg: 'bg-nbac-emerald-light',
    cardBg: 'bg-[#121a17]/50',
    gradientText: 'bg-gradient-to-r from-nbac-emerald-light via-[#34d399] to-nbac-emerald bg-clip-text text-transparent'
  },
  jet_display: {
    border: 'border-nbac-emerald-dark',
    leftBorder: 'border-l-nbac-emerald-dark',
    badgeBg: 'bg-gradient-to-r from-[#10b981] to-nbac-emerald-dark text-[#0b0f10]',
    glow: 'bg-nbac-emerald/[0.06]',
    text: 'text-nbac-emerald',
    glowShadow: 'rgba(6, 110, 74, 0.2)',
    btnSelected: 'bg-nbac-emerald-dark text-white border-transparent shadow-nbac-emerald-dark/20 hover:shadow-nbac-emerald-dark/40',
    bulletBg: 'bg-nbac-emerald',
    cardBg: 'bg-[#12191a]/50',
    gradientText: 'bg-gradient-to-r from-nbac-emerald via-[#10b981] to-nbac-emerald-dark bg-clip-text text-transparent'
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

export function DelegateBenefitsModal({ tier, isOpen, onClose }: DelegateBenefitsModalProps) {
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

  const theme = TIER_THEMES[tier.id] || TIER_THEMES.exhibitor

  const getIcon = (themeText: string) => {
    switch (tier.id) {
      case 'vip':
        return <Crown className={cn(themeText, "h-7 w-7")} />
      case 'exhibitor':
        return <ShieldCheck className={cn(themeText, "h-7 w-7")} />
      case 'jet_display':
        return <Plane className={cn(themeText, "h-7 w-7 rotate-45")} />
      default:
        return <Award className={cn(themeText, "h-7 w-7")} />
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
    router.push(`/contact/delegate?tier=${tier.id}`)
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
            className="relative w-full max-w-3xl bg-nbac-panel/95 border border-nbac-border rounded-2xl shadow-2xl overflow-hidden z-10 glass-card"
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
                    {tier.availability === 'sold_out' ? 'Sold Out' : tier.badge || 'Available'}
                  </span>
                  
                  <h3 className="font-sans text-3xl font-black uppercase tracking-wide">
                    {tier.name}
                  </h3>

                  <div className="pt-2 flex items-baseline justify-center md:justify-start gap-2">
                    <span className={cn("font-display text-4xl font-extrabold tracking-tight", theme.text)}>
                      {formatPrice(tier.price)}
                    </span>
                    <span className="font-sans text-xs text-nbac-muted uppercase tracking-wider">
                      USD {tier.billingModel === 'package' ? '/ package' : '/ delegate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inclusions Area */}
              <div className="space-y-4 text-left mb-8">
                <h4 className={cn("font-sans text-xs uppercase tracking-wider font-bold border-b border-nbac-border/40 pb-2 flex items-center gap-1.5", theme.text)}>
                  <span className={cn("h-1.5 w-1.5 rounded-full", theme.bulletBg)} />
                  Included Privileges & Inclusions
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tier.privileges.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-nbac-canvas/40 border border-nbac-border/40 rounded-xl">
                      <div className={cn("p-1 rounded-full shrink-0 mt-0.5 bg-nbac-canvas border border-nbac-border")}>
                        <Check size={14} className={cn(theme.text)} />
                      </div>
                      <span className="font-sans text-xs text-nbac-body leading-relaxed font-light">
                        {item}
                      </span>
                    </div>
                  ))}
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
                      : (tier.id === 'vip' 
                          ? "bg-linear-to-r from-nbac-gold to-nbac-gold-light text-[#0b0f10] border-transparent shadow-[0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[0_6px_20px_rgba(197,160,89,0.45)] hover:scale-[1.01] active:scale-[0.99]"
                          : "bg-linear-to-r from-nbac-emerald to-nbac-emerald-light text-white border-transparent shadow-[0_4px_15px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.45)] hover:scale-[1.01] active:scale-[0.99]")
                  )}
                >
                  {tier.availability === 'sold_out' ? 'Sold Out' : `Select ${tier.name} Package`}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
