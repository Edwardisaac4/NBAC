import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="py-12 md:py-16 bg-nbac-deep border-t border-nbac-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-24 flex flex-col md:flex-row justify-between items-start gap-12">
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-nbac-border shadow-md shrink-0">
              <Image
                src="/images/logo-mark.jpg"
                alt="NBAC Logo Mark"
                fill
                className="object-cover scale-[1.05]"
                sizes="44px"
              />
            </div>
            <div className="flex flex-col leading-[1.05] select-none">
              <span className="font-sans text-[9px] font-bold text-nbac-gold uppercase tracking-wider">
                Nigerian
              </span>
              <span className="font-display text-base font-bold text-nbac-text tracking-wide">
                Business Aviation
              </span>
              <span className="font-display text-xs font-semibold text-nbac-body tracking-wide">
                Conference
              </span>
            </div>
          </div>
          <p className="text-nbac-body text-sm font-light leading-relaxed pt-2">
            Elevating the standards of business aviation across the Nigerian landscape through strategic collaboration and elite networking.
          </p>
        </div>
        <div className="flex flex-wrap gap-12 md:gap-24">
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-widest text-nbac-gold-light font-medium">Connect</h4>
            <ul className="text-nbac-body space-y-2 text-sm font-light">
              <li className="hover:text-nbac-emerald transition-colors cursor-pointer">Sponsorships</li>
              <li className="hover:text-nbac-emerald transition-colors cursor-pointer">Exhibitor Kit</li>
              <li className="hover:text-nbac-emerald transition-colors cursor-pointer">Media Center</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-widest text-nbac-gold-light font-medium">Legal</h4>
            <ul className="text-nbac-body space-y-2 text-sm font-light">
              <li>
                <Link href="/privacy" className="hover:text-nbac-emerald transition-colors cursor-pointer block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-nbac-emerald transition-colors cursor-pointer block">
                  Terms of Service
                </Link>
              </li>
              <li className="hover:text-nbac-emerald transition-colors cursor-pointer">Safety Guidelines</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="mt-12 pt-8 border-t border-nbac-border/30 text-center text-xs text-nbac-muted tracking-widest uppercase">
        © {new Date().getFullYear()} Nigerian Business Aviation Conference. All Rights Reserved.
      </div>
    </footer>
  )
}
