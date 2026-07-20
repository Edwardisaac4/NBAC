import type { ContentPost } from '@/types'

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

// ─── ARTICLE JSON-LD (individual blog posts) ──────────────────────────────────
export function ArticleJsonLd({ post }: { post: ContentPost }) {
  const schema = {
    '@context':       'https://schema.org',
    '@type':          'NewsArticle',
    headline:         post.meta_title || post.title,
    description:      post.meta_description ?? '',
    datePublished:    post.created_at,
    dateModified:     post.updated_at,
    author: {
      '@type': 'Organization',
      name:    post.author_name ?? 'NBAC Team',
      url:     'https://nbac.com.ng',
    },
    publisher: {
      '@type': 'Organization',
      name:    'Nigerian Business Aviation Conference',
      url:     'https://nbac.com.ng',
      logo: {
        '@type': 'ImageObject',
        url:     'https://nbac.com.ng/og/default.jpg',
      },
    },
    image:         post.cover_image_url ?? 'https://nbac.com.ng/og/news.jpg',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id':   `https://nbac.com.ng/news/${post.slug}`,
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
