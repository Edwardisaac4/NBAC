// ─── EVENT JSON-LD (home page) ────────────────────────────────────────────────
export function EventJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type':    'Event',
    name:        'Nigerian Business Aviation Conference 2027',
    alternateName: 'NBAC 2027',
    description:
      "West Africa's premier business aviation conference bringing " +
      "together operators, regulators, financiers, and innovators.",
    startDate:           '2027-05-04',
    endDate:             '2027-05-05',
    eventStatus:         'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: {
      '@type': 'Place',
      name:    'Lagos, Nigeria',
      address: {
        '@type':         'PostalAddress',
        addressLocality: 'Lagos',
        addressCountry:  'NG',
      },
    },
    organizer: {
      '@type': 'Organization',
      name:    'Nigerian Business Aviation Conference',
      url:     'https://nbac.com.ng',
    },
    offers: [
      {
        '@type':       'Offer',
        name:          'Chamberlain VIP Pass',
        availability:  'https://schema.org/InStock',
        url:           'https://nbac.com.ng/reservations',
        priceCurrency: 'NGN',
      },
      {
        '@type':       'Offer',
        name:          'Corporate Chalet Exhibitor',
        availability:  'https://schema.org/InStock',
        url:           'https://nbac.com.ng/reservations',
        priceCurrency: 'NGN',
      },
    ],
    image: 'https://nbac.com.ng/og/default.jpg',
    url:   'https://nbac.com.ng',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
