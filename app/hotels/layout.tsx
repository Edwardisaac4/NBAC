import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hotels & Flight Operations',
  description:
    'Partner hotel listings, delegate rates, and FBO terminal information ' +
    'for NBAC 2027 delegates and inbound operators. Lagos, Nigeria.',
  alternates: { canonical: 'https://nbac.com.ng/hotels' },
}

export default function HotelsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
