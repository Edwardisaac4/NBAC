'use client'

import React, { useState, useEffect } from 'react'
import { DelegateBentoCard } from '@/components/shared/delegate-bento-card'
import { DelegateBenefitsModal } from '@/components/shared/delegate-benefits-modal'
import { PASS_TIERS } from '@/lib/constants'
import { fetchTicketTiers } from '@/lib/supabase/dynamic-content'
import { PassTierDetails } from '@/types'

export function DelegateBentoGrid() {
  const [tiers, setTiers] = useState<PassTierDetails[]>(PASS_TIERS)
  const [selectedTier, setSelectedTier] = useState<PassTierDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    let active = true
    async function load() {
      const data = await fetchTicketTiers()
      if (active && data && data.length > 0) {
        setTiers(data)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const handleOpenModal = (tier: PassTierDetails) => {
    setSelectedTier(tier)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {tiers.map((tier) => (
          <DelegateBentoCard
            key={tier.id}
            tier={tier}
            onViewBenefits={() => handleOpenModal(tier)}
          />
        ))}
      </div>

      <DelegateBenefitsModal
        tier={selectedTier}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
