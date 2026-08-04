import Image from 'next/image'
import Link from 'next/link'
import { NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants'

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect width="4" height="12" x="2" y="9" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  )
}

function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

export function Footer() {
  const getSocialIcon = (name: string) => {
    switch (name) {
      case 'LinkedIn':
        return <LinkedinIcon className="w-4 h-4" />
      case 'Instagram':
        return <InstagramIcon className="w-4 h-4" />
      case 'TikTok':
        return <TikTokIcon className="w-4 h-4" />
      case 'Facebook':
        return <FacebookIcon className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <footer className="py-12 md:py-16 bg-nbac-deep border-t border-nbac-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 md:px-24 flex flex-col md:flex-row justify-between items-start gap-12">
        {/* BRAND & DESCRIPTION */}
        <div className="space-y-4 max-w-sm">
          <div className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 rounded-lg overflow-hidden border border-nbac-border shadow-md shrink-0">
              <Image
                src="/images/logo-mark.jpg"
                alt="NBAC Logo Mark"
                fill
                className="object-cover scale-[1.05]"
                sizes="44px"
                priority
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
          <p className="text-nbac-body text-sm font-light leading-relaxed pt-1">
            Elevating the standards of business aviation across the Nigerian landscape through strategic collaboration and elite networking.
          </p>

          {/* SOCIAL ICONS (ICON BUTTON BAR) */}
          <div className="flex items-center gap-2.5 pt-2">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 rounded-lg bg-nbac-alt border border-nbac-border flex items-center justify-center text-nbac-body hover:text-nbac-gold hover:border-nbac-gold/40 hover:bg-nbac-gold/5 transition-all duration-200 group"
              >
                <div className="transition-transform group-hover:scale-110">
                  {getSocialIcon(social.label)}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* NAVIGATION & LINKS GRID */}
        <div className="flex flex-wrap gap-12 md:gap-20">
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-widest text-nbac-gold-light font-medium">Explore</h4>
            <ul className="text-nbac-body space-y-2 text-sm font-light">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="hover:text-nbac-emerald transition-colors cursor-pointer block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-sans text-xs uppercase tracking-widest text-nbac-gold-light font-medium">Socials</h4>
            <ul className="text-nbac-body space-y-2 text-sm font-light">
              {SOCIAL_LINKS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-nbac-emerald transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <span className="text-nbac-gold">{getSocialIcon(social.label)}</span>
                    <span>{social.label}</span>
                  </a>
                </li>
              ))}
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
            </ul>
          </div>
        </div>
      </div>

      {/* BOTTOM COPYRIGHT & ORGANISER ROW */}
      <div className="max-w-7xl mx-auto px-6 md:px-24 mt-12 pt-8 border-t border-nbac-border/30 flex flex-col sm:flex-row justify-between items-center gap-6 text-sm text-nbac-muted">
        <div className="flex items-center gap-3 select-none">
          <span className="font-sans text-xs font-light text-nbac-muted">Organised by</span>
          <div className="relative w-[120px] h-[55px]">
            <Image
              src="/images/ean-logo-full.png"
              alt="EAN Aviation"
              fill
              className="object-contain dark:brightness-0 dark:invert opacity-80 hover:opacity-100 transition-opacity"
              sizes="120px"
              priority
            />
          </div>
        </div>
        <div className="font-sans text-xs font-light text-nbac-muted text-center sm:text-right">
          Copyright {new Date().getFullYear()}, Nigerian Business Aviation Conference
        </div>
      </div>
    </footer>
  )
}
