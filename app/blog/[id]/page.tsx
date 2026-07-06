'use client'

import { use, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { getDbPosts, BlogPost } from '@/lib/blog-data'
import { ArrowLeft, User, Clock, Calendar, Share2, Check } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { MarkdownRenderer } from '@/components/shared/markdown-renderer'

export default function BlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [post, setPost] = useState<BlogPost | null>(null)
  const [copied, setCopied] = useState(false)
  const [recommendations, setRecommendations] = useState<BlogPost[]>([])

  useEffect(() => {
    let active = true
    async function loadPost() {
      const allPosts = await getDbPosts()
      if (!active) return
      
      const foundPost = allPosts.find(p => p.id === resolvedParams.id)
      
      if (!foundPost) {
        router.push('/blog')
        return
      }

      setPost(foundPost)
      
      // Find up to 3 recommendations
      const otherPosts = allPosts.filter(p => p.id !== resolvedParams.id && p.status === 'published')
      setRecommendations(otherPosts.slice(0, 3))
    }
    loadPost()
    return () => {
      active = false
    }
  }, [resolvedParams.id, router])

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }



  if (!post) {
    return (
      <div className="min-h-screen bg-nbac-canvas text-nbac-text flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-nbac-emerald border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-24 md:pt-32 pb-20">
        
        {/* Detail Container */}
        <div className="max-w-4xl mx-auto px-6 w-full">
          
          {/* Back button */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-nbac-muted hover:text-nbac-emerald transition-colors text-xs uppercase tracking-widest font-bold mb-8 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Briefings
          </Link>

          {/* Heading Info */}
          <div className="space-y-6">
            <span className="bg-nbac-emerald/10 border border-nbac-emerald/20 text-nbac-emerald text-[9px] font-bold tracking-widest uppercase px-3 py-1 rounded-full inline-block">
              {post.type === 'press_release' ? 'Press Release' : post.type === 'announcement' ? 'Announcement' : 'Intelligence'}
            </span>
            
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight text-nbac-text">
              {post.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2 pb-6 border-b border-nbac-border text-nbac-body text-sm font-light">
              <span className="flex items-center gap-2">
                <User size={14} className="text-nbac-emerald" />
                {post.author}
              </span>
              <span className="text-nbac-muted">•</span>
              <span className="flex items-center gap-2">
                <Clock size={14} className="text-nbac-emerald" />
                {post.read_time || '7 Min Read'}
              </span>
              <span className="text-nbac-muted">•</span>
              <span className="flex items-center gap-2">
                <Calendar size={14} className="text-nbac-emerald" />
                {formatDate(post.created_at)}
              </span>
            </div>
          </div>

          {/* Large cover image */}
          {post.featured_image && (
            <div className="relative w-full h-[320px] md:h-[480px] rounded-2xl overflow-hidden my-10 shadow-lg border border-nbac-border bg-nbac-deep">
              <Image
                src={post.featured_image}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 900px"
                quality={90}
                priority
              />
            </div>
          )}

          {/* Article Layout (Body + Share) */}
          <div className="flex flex-col lg:flex-row gap-12 items-start pt-4">
            
            {/* Main Content Body */}
            <article className="grow max-w-full">
              <MarkdownRenderer content={post.body} />
            </article>

            {/* Sticky Actions Sidebar */}
            <div className="lg:sticky lg:top-36 w-full lg:w-44 flex flex-row lg:flex-col items-center lg:items-start justify-between border-t lg:border-t-0 lg:border-l border-nbac-border pt-6 lg:pt-0 lg:pl-8 gap-4 shrink-0">
              <div className="space-y-1">
                <div className="text-[10px] text-nbac-muted font-sans font-bold uppercase tracking-wider">Share Insight</div>
                <div className="text-xs text-nbac-body font-light">Copy article link</div>
              </div>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 bg-nbac-panel hover:bg-nbac-panel/85 border border-nbac-border text-nbac-text hover:text-nbac-emerald font-sans text-xs px-4 py-2.5 rounded-full transition-all duration-300 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-nbac-emerald" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={12} />
                    <span>Share Briefing</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Related Articles Section */}
          {recommendations.length > 0 && (
            <div className="border-t border-nbac-border mt-20 pt-16">
              <h3 className="font-display text-2xl font-bold mb-8 text-nbac-text">Related Briefings</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {recommendations.map(item => (
                  <Link
                    href={`/blog/${item.id}`}
                    key={item.id}
                    className="group flex flex-col bg-nbac-panel/40 border border-nbac-border rounded-xl overflow-hidden p-5 hover:border-nbac-emerald/30 transition-all duration-300"
                  >
                    <span className="text-[9px] font-sans font-bold text-nbac-emerald uppercase tracking-wider mb-2">
                      {item.type === 'press_release' ? 'Press Release' : item.type === 'announcement' ? 'Announcement' : 'Intelligence'}
                    </span>
                    <h4 className="font-sans text-sm font-semibold text-nbac-text group-hover:text-nbac-emerald transition-colors line-clamp-2 leading-snug mb-3">
                      {item.title}
                    </h4>
                    <span className="mt-auto text-[10px] text-nbac-muted uppercase tracking-wider">
                      {formatDate(item.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

        </div>

      </main>
      <Footer />
    </PageTransition>
  )
}
