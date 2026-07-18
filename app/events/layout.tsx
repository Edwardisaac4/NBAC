import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Conference Agenda & Sessions',
  description:
    'Full NBAC 2027 programme — panel sessions, keynote speakers, ' +
    'AeroLab pitches, and the Gala Dinner. 4–5 May 2027, Lagos, Nigeria.',
  openGraph: {
    images: [{ url: '/og/events.jpg', width: 1200, height: 630,
               alt: 'NBAC 2027 Conference Agenda' }],
  },
  alternates: { canonical: 'https://nbac.com.ng/events' },
}

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
