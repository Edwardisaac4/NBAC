import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Register — Secure Your Pass',
  description:
    'Register for NBAC 2027. VIP, Exhibitor, or Jet Display passes. ' +
    'Pay in NGN or USD. Limited availability. Lagos, Nigeria.',
  openGraph: {
    images: [{ url: '/og/reservations.jpg', width: 1200, height: 630,
               alt: 'NBAC 2027 Registration' }],
  },
  alternates: { canonical: 'https://nbac.com.ng/reservations' },
}

export default function ReservationsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
