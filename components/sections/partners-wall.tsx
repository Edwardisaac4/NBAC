import { PARTNER_TIERS, type Partner, type PartnerTier } from '@/lib/partners'
import { isValidHttpUrl } from '@/lib/utils'

/**
 * Homepage partner wall: one panel per sponsorship tier, Platinum first.
 *
 * Each tier's panel carries its metal colour (border, glow, label), and logo
 * size is the tier — Platinum tiles are the largest and sit at most two to a
 * row, Bronze the smallest at up to six — because prominence is part of what
 * each package pays for. Rows are flex-wrapped and centred, so a tier with a
 * single partner still sits in the middle.
 *
 * Logos are shown exactly as the sponsor supplied them, never recoloured or
 * cropped: brand guidelines usually forbid it. Tiles are black to suit the
 * site's dark design, so ask each sponsor for their logo version for dark
 * backgrounds ("reversed" or "white" in most logo packs). Artwork supplied on
 * a black background blends straight into the tile.
 *
 * Renders nothing when there are no partners, so the homepage never shows an
 * empty "Our Partners" heading.
 */

const THEME: Record<PartnerTier, { panel: string; label: string; tileBorder: string }> = {
  platinum: {
    panel: 'border-[#e5e4e2]/25 from-[#e5e4e2]/[0.07]',
    label: 'text-[#e5e4e2] border-[#e5e4e2]/30 bg-[#e5e4e2]/10',
    tileBorder: 'border-[#e5e4e2]/20',
  },
  gold: {
    panel: 'border-nbac-gold/30 from-nbac-gold/[0.08]',
    label: 'text-nbac-gold border-nbac-gold/30 bg-nbac-gold/10',
    tileBorder: 'border-nbac-gold/20',
  },
  silver: {
    panel: 'border-[#c0c0c0]/25 from-[#c0c0c0]/[0.07]',
    label: 'text-[#c0c0c0] border-[#c0c0c0]/30 bg-[#c0c0c0]/10',
    tileBorder: 'border-[#c0c0c0]/20',
  },
  bronze: {
    panel: 'border-[#cd7f32]/30 from-[#cd7f32]/[0.08]',
    label: 'text-[#cd7f32] border-[#cd7f32]/30 bg-[#cd7f32]/10',
    tileBorder: 'border-[#cd7f32]/20',
  },
}

const SIZE: Record<PartnerTier, { tile: string; panel: string }> = {
  platinum: { tile: 'w-full sm:w-[22rem] h-36 md:h-44 p-4', panel: 'max-w-4xl' },
  gold: { tile: 'w-[calc(50%-0.5rem)] md:w-60 h-28 md:h-32 p-3', panel: 'max-w-4xl' },
  silver: { tile: 'w-[calc(50%-0.5rem)] sm:w-44 h-24 p-2', panel: 'max-w-5xl' },
  bronze: { tile: 'w-[calc(50%-0.5rem)] sm:w-36 h-16 md:h-20 p-1.5', panel: 'max-w-5xl' },
}

export function PartnersWall({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) return null

  const tiers = PARTNER_TIERS.map((tier) => ({
    ...tier,
    partners: partners.filter((p) => p.tier === tier.id),
  })).filter((tier) => tier.partners.length > 0)

  return (
    <section id="partners" className="relative py-16 md:py-24 bg-nbac-canvas border-t border-nbac-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-24">
        <div className="text-center mb-12 md:mb-16">
          <span className="font-sans text-[11px] uppercase tracking-widest font-semibold text-nbac-gold block mb-3">
            Our Partners
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-nbac-text tracking-tight">
            NBAC 2027 is made possible by
          </h2>
        </div>

        <div className="space-y-6 md:space-y-8">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`mx-auto rounded-2xl border bg-linear-to-b to-transparent px-4 py-6 sm:px-8 md:py-8 ${SIZE[tier.id].panel} ${THEME[tier.id].panel}`}
            >
              <div className="flex flex-col items-center gap-2 mb-6">
                <span
                  className={`inline-block rounded-full border px-3 py-0.5 font-sans text-[10px] font-bold uppercase tracking-[0.2em] ${THEME[tier.id].label}`}
                >
                  {tier.label}
                </span>
                <h3 className="font-sans text-xs uppercase tracking-[0.2em] font-semibold text-nbac-muted text-center">
                  {tier.heading}
                </h3>
              </div>

              <ul className="flex flex-wrap justify-center gap-4">
                {tier.partners.map((partner) => {
                  const logo = (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  )
                  const tileClass = `flex items-center justify-center overflow-hidden rounded-xl border bg-black ${SIZE[tier.id].tile} ${THEME[tier.id].tileBorder}`

                  return (
                    <li key={partner.id} className={tileClass}>
                      {partner.website_url && isValidHttpUrl(partner.website_url) ? (
                        <a
                          href={partner.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`${partner.name} (opens in a new tab)`}
                          className="flex h-full w-full items-center justify-center transition-transform duration-300 hover:scale-[1.03]"
                        >
                          {logo}
                        </a>
                      ) : (
                        logo
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
