/**
 * Partner tiers for the homepage partner wall and /admin/partners.
 *
 * Headings use the recognition wording each sponsorship package promises —
 * Title Partner is "In partnership with", Platinum "Platinum partner", Gold
 * "Gold partner", Silver "Sponsored by", Bronze "Supported by" — so the site
 * shows exactly what was sold.
 */

export const PARTNER_TIERS = [
  { id: 'title', label: 'Title Partner', heading: 'In partnership with' },
  { id: 'platinum', label: 'Platinum', heading: 'Platinum partner' },
  { id: 'gold', label: 'Gold', heading: 'Gold partner' },
  { id: 'silver', label: 'Silver', heading: 'Sponsored by' },
  { id: 'bronze', label: 'Bronze', heading: 'Supported by' },
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
