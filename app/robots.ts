import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow:    '/',
        // /pay carries a delegate's amount, reference and name behind an
        // opaque token. Tokens leak through referrers, shared links and
        // forwarded email, so these pages must never be crawled or indexed.
        disallow: ['/admin', '/admin/', '/api/', '/portal', '/pay', '/pay/'],
      },
    ],
    sitemap: 'https://nbac.com.ng/sitemap.xml',
  }
}
