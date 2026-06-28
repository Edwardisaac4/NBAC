import { Plane, Globe, Shield, Navigation, Compass, Star } from 'lucide-react'

export function SponsorsStrip() {
  const sponsors = [
    { name: 'Falcon Aero', icon: Plane },
    { name: 'VistaJet', icon: Globe },
    { name: 'Bombardier', icon: Shield },
    { name: 'Embraer', icon: Navigation },
    { name: 'Gulfstream', icon: Compass },
    { name: 'NCAA', icon: Star },
  ]

  // Triple the array to ensure seamless infinite looping on wider viewports
  const doubled = [...sponsors, ...sponsors, ...sponsors]

  return (
    <div className="overflow-hidden border-y border-nbac-border/20 py-8 bg-nbac-alt/50 select-none">
      <div className="flex animate-marquee gap-12 w-max">
        {doubled.map((sponsor, i) => {
          const Icon = sponsor.icon
          return (
            <div
              key={`${sponsor.name}-${i}`}
              className="flex items-center gap-3 px-6 py-3 bg-nbac-panel/40 border border-nbac-border/10 rounded-full text-nbac-muted grayscale opacity-50 hover:opacity-100 hover:grayscale-0 hover:border-nbac-emerald/30 hover:text-nbac-emerald transition-all duration-300 cursor-pointer"
            >
              <Icon size={18} className="flex-shrink-0" />
              <span className="font-sans text-sm font-semibold tracking-wider uppercase">
                {sponsor.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
