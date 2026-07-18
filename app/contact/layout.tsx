import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact & Enquiries',
  description:
    'Get in touch with the NBAC 2027 team for registration, sponsorship, ' +
    'media accreditation, or FBO logistics enquiries.',
  alternates: { canonical: 'https://nbac.com.ng/contact' },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
