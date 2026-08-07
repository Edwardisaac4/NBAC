import type { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://nbac.com.ng'
  const now  = new Date()

  return [
    // Static pages
    { url: base,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/events`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/reservations`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/hotels`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
  ]
}
