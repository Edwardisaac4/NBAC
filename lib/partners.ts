/**
 * Partner tiers for the homepage partner wall and /admin/partners.
 *
 * Headings use the wording each sponsorship package promises — Platinum is
 * "In partnership with", Gold "In collaboration with", Silver and Bronze
 * "Sponsored by" — so the site shows exactly what was sold.
 */

export const PARTNER_TIERS = [
  { id: 'platinum', label: 'Platinum', heading: 'In partnership with' },
  { id: 'gold', label: 'Gold', heading: 'In collaboration with' },
  { id: 'silver', label: 'Silver', heading: 'Sponsored by' },
  { id: 'bronze', label: 'Bronze', heading: 'Sponsored by' },
] as const

export type PartnerTier = (typeof PARTNER_TIERS)[number]['id']

export interface Partner {
  id: string
  name: string
  tier: PartnerTier
  logo_url: string
  storage_path: string | null
  website_url: string | null
  sort_order: number
  visible: boolean
}

export function partnerTierLabel(tier: string): string {
  return PARTNER_TIERS.find((t) => t.id === tier)?.label ?? tier
}
