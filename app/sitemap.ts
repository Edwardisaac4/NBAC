import { MetadataRoute } from 'next';
import { MOCK_EVENTS } from '@/lib/mock-events';
import { DEFAULT_POSTS, BlogPost } from '@/lib/blog-data';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://nbac.com.ng';

  // Static routes with differentiated SEO priorities
  const staticRoutes: { path: string; priority: number; changeFrequency: 'daily' | 'weekly' | 'monthly' }[] = [
    { path: '', priority: 1.0, changeFrequency: 'daily' },
    { path: '/events', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/speakers', priority: 0.9, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/aerolab', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/blog', priority: 0.8, changeFrequency: 'daily' },
    { path: '/gallery', priority: 0.8, changeFrequency: 'weekly' },
    { path: '/gallery/archives', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/contact/delegate', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/contact/sponsor', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'monthly' },
  ];

  const sitemapEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteUrl}${route.path}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  // Dynamic event program routes
  const eventRoutes = MOCK_EVENTS.map((event) => ({
    url: `${siteUrl}/events/${event.id}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  // Dynamic blog post routes
  let blogPosts = DEFAULT_POSTS;
  try {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );
      const { data, error } = await supabase
        .from('posts')
        .select('id, updated_at')
        .eq('status', 'published');

      if (!error && data && data.length > 0) {
        blogPosts = data as BlogPost[];
      }
    }
  } catch (err) {
    console.error('Sitemap: Failed to fetch dynamic blog posts from Supabase:', err);
  }

  const blogRoutes = blogPosts.map((post) => ({
    url: `${siteUrl}/blog/${post.id}`,
    lastModified: post.updated_at ? new Date(post.updated_at).toISOString() : new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...sitemapEntries, ...eventRoutes, ...blogRoutes];
}
