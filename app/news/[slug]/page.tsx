import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { ArticleJsonLd } from '@/components/shared/json-ld'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import type { ContentPost } from '@/types'

// generateStaticParams — pre-renders published posts at build time
export async function generateStaticParams() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('posts')
    .select('slug, id')
    .eq('status', 'published')

  return (data ?? []).map((post) => ({ slug: post.slug || post.id }))
}

// generateMetadata — produces unique SEO metadata per post
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('title, meta_title, meta_description, cover_image_url, author_name, created_at, slug, id')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq('status', 'published')
    .single()

  if (!post) return { title: 'Post Not Found' }

  // meta_title overrides title if the admin set one in the editor
  const seoTitle       = post.meta_title || post.title
  // meta_description overrides the default if set
  const seoDescription = post.meta_description ||
    `Read the latest from NBAC 2027 — the Nigerian Business Aviation Conference.`

  const targetSlug = post.slug || post.id

  return {
    title:       seoTitle,
    description: seoDescription,
    openGraph: {
      type:        'article',
      title:       seoTitle,
      description: seoDescription,
      url:         `https://nbac.com.ng/news/${targetSlug}`,
      publishedTime: post.created_at,
      authors:     [post.author_name ?? 'NBAC Team'],
      images: post.cover_image_url
        ? [{ url: post.cover_image_url, width: 1200, height: 630,
             alt: seoTitle }]
        : [{ url: '/og/news.jpg', width: 1200, height: 630,
             alt: 'NBAC 2027 News' }],
    },
    twitter: {
      card:        'summary_large_image',
      title:       seoTitle,
      description: seoDescription,
      images:      [post.cover_image_url ?? '/og/news.jpg'],
    },
    alternates: {
      canonical: `https://nbac.com.ng/news/${targetSlug}`,
    },
  }
}

// Page component
export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .or(`slug.eq.${slug},id.eq.${slug}`)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  return (
    <>
      <Navbar />
      <ArticleJsonLd post={post as ContentPost} />
      <main className="min-h-screen bg-nbac-canvas pt-24 pb-32 text-nbac-text">
        <article className="max-w-3xl mx-auto px-6">

          {/* POST HEADER */}
          <header className="mb-12">
            <p className="font-sans text-xs text-nbac-emerald uppercase tracking-widest mb-4">
              {post.type ? post.type.replace('_', ' ') : 'Announcement'}
            </p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-nbac-text tracking-tight leading-tight mb-6">
              {post.title}
            </h1>
            <div className="flex items-center gap-3 text-nbac-muted font-sans text-sm">
              <span>{post.author_name ?? 'NBAC Team'}</span>
              <span>·</span>
              <time dateTime={post.created_at || undefined}>
                {post.created_at ? new Date(post.created_at).toLocaleDateString('en-NG', {
                  day:   'numeric',
                  month: 'long',
                  year:  'numeric',
                }) : ''}
              </time>
            </div>
          </header>

          {/* COVER IMAGE */}
          {post.cover_image_url && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden mb-12 border border-nbac-border">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 800px"
                className="object-cover"
              />
            </div>
          )}

          {/* POST BODY — Tiptap HTML output */}
          <div
            className="prose-nbac"
            dangerouslySetInnerHTML={{ __html: post.body || '' }}
          />

        </article>
      </main>
      <Footer />
    </>
  )
}
