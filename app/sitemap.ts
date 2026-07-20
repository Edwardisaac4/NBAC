import type { MetadataRoute } from 'next'
import { createClient }       from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base      = 'https://nbac.com.ng'
  const now       = new Date()
  const supabase  = await createClient()

  // Fetch all published posts that have a slug
  const { data: posts } = await supabase
    .from('posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .not('slug', 'is', null)
    .order('updated_at', { ascending: false })

  const postEntries: MetadataRoute.Sitemap = (posts ?? []).map((post) => ({
    url:             `${base}/news/${post.slug}`,
    lastModified:    new Date(post.updated_at || now),
    changeFrequency: 'monthly' as const,
    priority:        0.6,
  }))

  return [
    // Static pages
    { url: base,                    lastModified: now, changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${base}/events`,        lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/speakers`,      lastModified: now, changeFrequency: 'weekly',  priority: 0.9 },
    { url: `${base}/reservations`,  lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/news`,          lastModified: now, changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${base}/hotels`,        lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/about`,         lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`,       lastModified: now, changeFrequency: 'yearly',  priority: 0.5 },
    // Dynamic blog posts
    ...postEntries,
  ]
}
