import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About NBAC',
  description:
    'Learn about the Nigerian Business Aviation Conference — mission, ' +
    "2027 objectives, and the steering committee shaping West Africa's " +
    'premier aviation event.',
  alternates: { canonical: 'https://nbac.com.ng/about' },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
