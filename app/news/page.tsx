import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'
import { Calendar, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'News & Announcements',
  description:
    'Latest news, press releases, sponsor updates, and event announcements ' +
    'from the Nigerian Business Aviation Conference 2027.',
  openGraph: {
    images: [{ url: '/og/news.jpg', width: 1200, height: 630,
               alt: 'NBAC 2027 News & Announcements' }],
  },
  alternates: { canonical: 'https://nbac.com.ng/news' },
}

export default async function NewsPage() {
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('id, title, slug, type, cover_image_url, meta_description, created_at, author_name, body')
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-nbac-canvas pt-24 pb-32 text-nbac-text">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          
          {/* Hero Header */}
          <div className="max-w-3xl mb-16">
            <SectionEyebrow>PRESS & UPDATES</SectionEyebrow>
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6">
              News & Announcements
            </h1>
            <p className="font-sans text-nbac-body text-base leading-relaxed">
              Latest press releases, official speaker announcements, sponsor updates, and executive briefings from the Nigerian Business Aviation Conference 2027.
            </p>
          </div>

          {/* Posts Grid */}
          {!posts || posts.length === 0 ? (
            <div className="text-center py-20 border border-nbac-border rounded-xl bg-nbac-card/30">
              <p className="text-nbac-muted font-sans text-sm">No announcements published yet. Check back soon.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const targetSlug = post.slug || post.id;
                return (
                  <article
                    key={post.id}
                    className="flex flex-col border border-nbac-border rounded-xl overflow-hidden bg-nbac-card/50 hover:border-nbac-emerald/50 transition-all group"
                  >
                    {post.cover_image_url ? (
                      <Link href={`/news/${targetSlug}`} className="relative h-48 w-full overflow-hidden bg-nbac-deep block">
                        <Image
                          src={post.cover_image_url}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                    ) : (
                      <Link href={`/news/${targetSlug}`} className="relative h-48 w-full overflow-hidden bg-nbac-deep flex items-center justify-center border-b border-nbac-border">
                        <span className="font-display text-2xl font-bold text-nbac-muted/30">NBAC 2027</span>
                      </Link>
                    )}

                    <div className="p-6 flex flex-col flex-1 justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-sans text-nbac-emerald uppercase tracking-wider mb-2">
                          <span>{post.type?.replace('_', ' ') || 'Announcement'}</span>
                          <span>·</span>
                          <span className="text-nbac-muted flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.created_at ? new Date(post.created_at).toLocaleDateString('en-NG', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            }) : ''}
                          </span>
                        </div>

                        <Link href={`/news/${targetSlug}`}>
                          <h2 className="font-display text-xl font-bold text-nbac-text group-hover:text-nbac-emerald transition-colors mb-3 line-clamp-2">
                            {post.title}
                          </h2>
                        </Link>

                        <p className="font-sans text-xs text-nbac-muted line-clamp-3 mb-6">
                          {post.meta_description || post.body?.replace(/<[^>]*>/g, '').slice(0, 150) + '...'}
                        </p>
                      </div>

                      <Link
                        href={`/news/${targetSlug}`}
                        className="inline-flex items-center gap-1.5 font-sans text-xs font-semibold text-nbac-emerald hover:text-nbac-emerald-light transition-colors mt-auto"
                      >
                        Read Full Story <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  )
}
