import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Speakers',
  description:
    'Meet the operators, regulators, financiers, and innovators speaking ' +
    'at NBAC 2027. 4–5 May 2027, Lagos, Nigeria.',
  openGraph: {
    images: [{ url: '/og/speakers.jpg', width: 1200, height: 630,
               alt: 'NBAC 2027 Speakers' }],
  },
  alternates: { canonical: 'https://nbac.com.ng/speakers' },
}

export default function SpeakersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
