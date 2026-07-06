'use client'

import React, { useState } from 'react'
import { SponsorBentoCard } from '@/components/shared/sponsor-bento-card'
import { SponsorBenefitsModal } from '@/components/shared/sponsor-benefits-modal'
import { SPONSOR_TIERS } from '@/lib/constants'
import { SponsorTierDetails } from '@/types'

export function SponsorBentoGrid() {
  const [selectedTier, setSelectedTier] = useState<SponsorTierDetails | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = (tier: SponsorTierDetails) => {
    setSelectedTier(tier)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {SPONSOR_TIERS.map((tier) => (
          <SponsorBentoCard
            key={tier.id}
            tier={tier}
            onViewBenefits={() => handleOpenModal(tier)}
          />
        ))}
      </div>

      <SponsorBenefitsModal
        tier={selectedTier}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  )
}
