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
        return <Crown className="text-nbac-emerald-light h-6 w-6" />
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
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
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

  return (
    <motion.div
      onClick={() => !isSoldOut && onSelect()}
      className={cn(
        "relative rounded-xl p-6 backdrop-blur-xl transition-all duration-300 border cursor-pointer select-none overflow-hidden flex flex-col justify-between h-full group",
        isSelected
          ? "bg-nbac-panel border-nbac-emerald shadow-[0_12px_40px_rgba(16,185,129,0.08)] border-l-4 border-l-nbac-emerald"
          : "bg-nbac-panel/40 border-nbac-border hover:bg-nbac-panel/70 hover:border-nbac-emerald/30",
        isSoldOut && "opacity-50 cursor-not-allowed hover:border-nbac-border hover:shadow-none hover:bg-nbac-panel/40"
      )}
      whileHover={!isSoldOut ? {
        y: -4,
        borderColor: isSelected ? 'var(--color-nbac-emerald)' : 'rgba(16, 185, 129, 0.4)',
        boxShadow: isSelected ? '0 12px 40px rgba(16, 185, 129, 0.12)' : '0 12px 32px rgba(16, 185, 129, 0.04)',
      } : {}}
      transition={{ duration: 0.2 }}
    >
      {/* Subtle glow background for selected state */}
      {isSelected && (
        <div className="absolute -right-24 -top-24 w-48 h-48 bg-nbac-emerald/[0.04] blur-[80px] rounded-full pointer-events-none" />
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
            <span className="text-[11px] font-sans text-nbac-emerald-light font-medium uppercase tracking-wider block mt-1">
              {tier.badge}
            </span>
          )}
          <div className="mt-4 flex items-baseline">
            <span className="font-display text-3xl font-extrabold text-nbac-text tracking-tight">
              {formatPrice(tier.price)}
            </span>
            <span className="font-sans text-xs text-nbac-muted ml-2">/ delegate</span>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-nbac-border/80 w-full" />

        {/* Privileges List */}
        <ul className="space-y-3.5">
          {tier.privileges.map((privilege, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check size={16} className="text-nbac-emerald shrink-0 mt-0.5" />
              <span className="font-sans text-xs text-nbac-body leading-relaxed font-light font-sans">
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
              ? "bg-nbac-emerald text-white shadow-lg shadow-nbac-emerald/10"
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
