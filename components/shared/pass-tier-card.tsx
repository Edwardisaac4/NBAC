'use client'

import { motion } from 'framer-motion'
import { Check, ShieldCheck, Crown, Plane } from 'lucide-react'
import { PassTierDetails } from '@/types'
import { cn } from '@/lib/utils'

interface PassTierCardProps {
  tier: PassTierDetails
  isSelected: boolean
  onSelect: () => void
}

export function PassTierCard({ tier, isSelected, onSelect }: PassTierCardProps) {
  // Select tier icon based on ID
  const getIcon = () => {
    switch (tier.id) {
      case 'vip':
        return <Crown className="text-nbac-gold h-6 w-6" />
      case 'exhibitor':
        return <ShieldCheck className="text-nbac-emerald-light h-6 w-6" />
      case 'jet_display':
        return <Plane className="text-nbac-emerald-light h-6 w-6 rotate-45" />
      default:
        return <Crown className="text-nbac-emerald-light h-6 w-6" />
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
  const getAvailabilityBadge = () => {
    switch (tier.availability) {
      case 'available':
        return (
          <span className="bg-nbac-emerald/10 text-nbac-emerald border border-nbac-emerald/20 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
            Available
          </span>
        )
      case 'limited':
        return (
          <span className="bg-nbac-amber/10 text-nbac-amber border border-nbac-amber/20 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
            Limited Availability
          </span>
        )
      case 'sold_out':
        return (
          <span className="bg-nbac-danger/10 text-nbac-danger border border-nbac-danger/20 text-[10px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
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

  return (
    <motion.div
      role="button"
      tabIndex={isSoldOut ? -1 : 0}
      onKeyDown={handleKeyDown}
      onClick={() => !isSoldOut && onSelect()}
      className={cn(
        "relative rounded-xl p-6 backdrop-blur-xl transition-all duration-300 border cursor-pointer select-none overflow-hidden flex flex-col justify-between h-full group focus:outline-none focus-visible:ring-2 focus-visible:ring-nbac-emerald",
        isSelected
          ? (tier.id === 'vip'
              ? "bg-nbac-panel border-nbac-gold shadow-[0_12px_40px_rgba(197,160,89,0.08)] border-l-4 border-l-nbac-gold"
              : "bg-nbac-panel border-nbac-emerald shadow-[0_12px_40px_rgba(16,185,129,0.08)] border-l-4 border-l-nbac-emerald")
          : "bg-nbac-panel/40 border-nbac-border hover:bg-nbac-panel/70 hover:border-nbac-emerald/40",
        isSoldOut && "opacity-50 cursor-not-allowed hover:border-nbac-border hover:shadow-none hover:bg-nbac-panel/40"
      )}
      whileHover={!isSoldOut ? {
        y: -4,
        boxShadow: isSelected
          ? (tier.id === 'vip' ? '0 12px 40px rgba(197, 160, 89, 0.12)' : '0 12px 40px rgba(16, 185, 129, 0.12)')
          : (tier.id === 'vip' ? '0 12px 32px rgba(197, 160, 89, 0.04)' : '0 12px 32px rgba(16, 185, 129, 0.04)'),
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Subtle glow background for selected state */}
      {isSelected && (
        <div className={cn(
          "absolute -right-24 -top-24 w-48 h-48 blur-[80px] rounded-full pointer-events-none",
          tier.id === 'vip' ? "bg-nbac-gold/4" : "bg-nbac-emerald/4"
        )} />
      )}

      <div className="space-y-6">
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="bg-nbac-canvas/80 border border-nbac-border p-3 rounded-lg flex items-center justify-center">
            {getIcon()}
          </div>
          {getAvailabilityBadge()}
        </div>

        {/* Tier Details */}
        <div>
          <h3 className="font-sans text-lg font-bold text-nbac-text uppercase tracking-wide">
            {tier.name}
          </h3>
          {tier.badge && (
            <span className={cn(
              "text-[11px] font-sans font-medium uppercase tracking-wider block mt-1",
              tier.id === 'vip' ? "text-nbac-gold-light" : "text-nbac-emerald-light"
            )}>
              {tier.badge}
            </span>
          )}
          <div className="mt-4 flex items-baseline">
            <span className="font-display text-3xl font-extrabold text-nbac-text tracking-tight">
              {formatPrice(tier.price)}
            </span>
            <span className="font-sans text-xs text-nbac-muted ml-2">
              {tier.billingModel === 'package' ? '/ package' : '/ delegate'}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-nbac-border/80 w-full" />

        {/* Privileges List */}
        <ul className="space-y-3.5">
          {tier.privileges.map((privilege, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check size={16} className={cn("shrink-0 mt-0.5", tier.id === 'vip' ? "text-nbac-gold" : "text-nbac-emerald")} />
              <span className="font-sans text-xs text-nbac-body leading-relaxed font-light">
                {privilege}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Select CTA Button */}
      <div className="mt-8 pt-4">
        <button
          disabled={isSoldOut}
          className={cn(
            "w-full font-sans font-bold py-3.5 rounded-full text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2",
            isSelected
              ? (tier.id === 'vip'
                  ? "bg-linear-to-r from-nbac-gold via-nbac-gold-light to-nbac-gold text-[#0b0f10] shadow-lg shadow-nbac-gold/15"
                  : "bg-nbac-emerald text-white shadow-lg shadow-nbac-emerald/10")
              : "border border-nbac-border text-nbac-body hover:text-nbac-text hover:bg-nbac-panel/80",
            isSoldOut && "border-nbac-border text-nbac-muted bg-transparent hover:bg-transparent"
          )}
        >
          {isSelected ? 'Selected' : isSoldOut ? 'Sold Out' : 'Select Package'}
        </button>
      </div>
    </motion.div>
  )
}
