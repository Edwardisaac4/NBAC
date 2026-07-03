'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PageTransition } from '@/components/layout/page-transition'
import { SectionEyebrow } from '@/components/shared/section-eyebrow'
import { getStoredPosts, BlogPost } from '@/lib/blog-data'
import { Calendar, User, Clock, ArrowRight, Mail, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatDate } from '@/lib/utils'

export default function BlogOverviewPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Load posts from localStorage (reactive to admin changes)
    const timeoutId = setTimeout(() => {
      setPosts(getStoredPosts())
    }, 0)

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'nbac-blog-posts') {
        setPosts(getStoredPosts())
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('storage', handleStorage)
    }
  }, [])

  // Find the featured post (fallback to first post if none matches 'post_featured')
  const featuredPost = posts.find(p => p.id === 'post_featured' && p.status === 'published') || 
                       posts.find(p => p.status === 'published')

  // Filter other published posts
  const otherPosts = posts.filter(p => p.id !== featuredPost?.id && p.status === 'published')

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubscribed(true)
      setEmail('')
    }, 1200)
  }



  return (
    <PageTransition>
      <Navbar />
      <main className="flex flex-col min-h-screen bg-nbac-canvas text-nbac-text pt-16 md:pt-20">
        
        {/* Hero Section: Featured Article */}
        {featuredPost && (
          <section className="relative min-h-[85vh] flex items-center overflow-hidden border-b border-nbac-border">
            {/* Background Image with subtle zoom overlay */}
            <div className="absolute inset-0 z-0">
              <Image
                src={featuredPost.featured_image || '/images/private_jet_runway_dusk.png'}
                alt={featuredPost.title}
                fill
                className="object-cover scale-[1.03] transition-transform duration-10000 ease-out hover:scale-105 z-0"
                priority
                sizes="100vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-black/30 z-10" />
              <div className="absolute inset-0 bg-linear-to-r from-nbac-canvas via-nbac-canvas/80 to-transparent z-20" />
              <div className="absolute inset-0 bg-linear-to-t from-nbac-canvas via-transparent to-transparent z-20" />
            </div>

            {/* Environmental Glow */}
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[50vw] h-[50vw] bg-nbac-emerald/10 rounded-full blur-3xl opacity-60 pointer-events-none z-0" />

            {/* Content Container */}
            <div className="relative z-20 max-w-7xl mx-auto px-6 md:px-24 w-full py-20">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 mb-6">
                  <span className="bg-nbac-emerald/15 border border-nbac-emerald/30 text-nbac-emerald text-[10px] font-bold tracking-widest uppercase px-3 py-1 rounded-full">
                    Featured Briefing
                  </span>
                  <span className="w-12 h-px bg-nbac-border" />
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight md:leading-none tracking-tight text-nbac-text mb-6">
                  {featuredPost.title}
                </h1>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-8 text-nbac-body text-sm font-light">
                  <span className="flex items-center gap-2">
                    <User size={14} className="text-nbac-emerald" />
                    {featuredPost.author}
                  </span>
                  <span className="text-nbac-muted">•</span>
                  <span className="flex items-center gap-2">
                    <Clock size={14} className="text-nbac-emerald" />
                    {featuredPost.read_time || '7 Min Read'}
                  </span>
                  <span className="text-nbac-muted">•</span>
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-nbac-emerald" />
                    {formatDate(featuredPost.created_at)}
                  </span>
                </div>

                {/* CTA Button */}
                <Link
                  href={`/blog/${featuredPost.id}`}
                  className="inline-flex items-center gap-3 bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-medium px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-nbac-emerald/20 hover:shadow-nbac-emerald/30 active:scale-95 group"
                >
                  <span className="text-xs uppercase tracking-wider font-bold">Read Full Insight</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Latest Briefings Grid */}
        <section className="py-20 md:py-28 max-w-7xl mx-auto px-6 md:px-24 w-full">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
              <div>
                <SectionEyebrow>Precision Aviation Intelligence</SectionEyebrow>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-nbac-text mt-2">
                  Latest Briefings
                </h2>
              </div>
              <p className="text-nbac-body font-light text-sm max-w-md md:text-right leading-relaxed">
                Strategic updates, policy briefs, and market insights compiled by industry operators and regulators.
              </p>
            </div>

            {otherPosts.length === 0 ? (
              <div className="bg-nbac-panel border border-nbac-border rounded-2xl p-12 text-center text-nbac-muted">
                No other briefings available at this time. Check back soon.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {otherPosts.map((post) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.id}`}
                    className="focus:outline-none focus-visible:ring-2 focus-visible:ring-nbac-emerald rounded-xl block h-full"
                  >
                    <motion.article
                      className="group relative flex flex-col bg-nbac-panel border border-nbac-border rounded-xl overflow-hidden shadow-md hover:border-nbac-emerald/40 transition-all duration-300 h-full"
                      whileHover={{ y: -6, boxShadow: '0 12px 30px rgba(16,185,129,0.06)' }}
                    >
                      {/* Featured Image */}
                      <div className="h-56 relative overflow-hidden bg-nbac-deep">
                        {post.featured_image ? (
                          <Image
                            src={post.featured_image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            quality={90}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-nbac-muted">
                            No Image
                          </div>
                        )}
                        
                        {/* Category Tag */}
                        <div className="absolute top-4 left-4 z-20">
                          <span className="bg-nbac-panel/90 backdrop-blur-md text-nbac-emerald border border-nbac-emerald/20 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase">
                            {post.type === 'press_release' ? 'Press Release' : post.type === 'announcement' ? 'Announcement' : 'Intelligence'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 grow flex flex-col justify-between">
                        <div>
                          <h3 className="font-sans text-lg font-bold mb-3 leading-snug text-nbac-text group-hover:text-nbac-emerald transition-colors line-clamp-2">
                            {post.title}
                          </h3>
                          <p className="font-sans text-xs font-light text-nbac-body leading-relaxed mb-6 line-clamp-3">
                            {post.body ? post.body.replace(/[#*`>]/g, '').trim().substring(0, 140) + '...' : ''}
                          </p>
                        </div>

                        {/* Footer Metadata */}
                        <div className="pt-4 border-t border-nbac-border/50 flex items-center justify-between text-[11px] text-nbac-muted uppercase tracking-wider font-medium">
                          <span>{formatDate(post.created_at)}</span>
                          <span className="flex items-center gap-1 text-nbac-emerald font-semibold">
                            Read Briefing
                            <ArrowRight size={10} className="group-hover:translate-x-1 transition-transform" />
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                ))}
              </div>
            )}
          </section>

        {/* The Executive Briefing Subscription CTA */}
        <section className="py-20 md:py-28 bg-nbac-alt border-y border-nbac-border relative overflow-hidden">
          {/* Parallax Icon Backdrop */}
          <div className="absolute top-1/2 right-10 -translate-y-1/2 opacity-[0.02] pointer-events-none select-none hidden lg:block">
            <Mail size={400} className="text-nbac-emerald rotate-12" />
          </div>

          <div className="max-w-7xl mx-auto px-6 md:px-24 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-12 md:gap-16">
              {/* Text Info */}
              <div className="lg:w-1/2 space-y-6">
                <SectionEyebrow>Weekly Intelligence Sync</SectionEyebrow>
                <h2 className="font-display text-3xl md:text-5xl font-bold text-nbac-text tracking-tight">
                  The Executive Briefing
                </h2>
                <p className="font-sans text-base font-light text-nbac-body leading-relaxed max-w-lg">
                  Receive the month&apos;s most critical business aviation intelligence, regulatory policy briefs, and market predictions sent straight to your desk. Join 500+ aviation executives shaping regional transport policy.
                </p>
                <div className="flex items-center gap-3 text-nbac-emerald text-xs font-semibold uppercase tracking-widest pt-2">
                  <Sparkles size={14} className="animate-pulse" />
                  <span>Curated for decision-makers only</span>
                </div>
              </div>

              {/* Form Input Card */}
              <div className="lg:w-1/2 w-full">
                <div className="glass-card p-8 md:p-10 rounded-2xl relative">
                  {subscribed ? (
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-6 space-y-4"
                    >
                      <div className="w-12 h-12 bg-nbac-emerald/10 text-nbac-emerald rounded-full flex items-center justify-center mx-auto border border-nbac-emerald/20">
                        <Sparkles size={20} />
                      </div>
                      <h3 className="font-sans text-lg font-bold text-nbac-text">Subscription Confirmed</h3>
                      <p className="font-sans text-sm text-nbac-body font-light max-w-sm mx-auto">
                        Welcome to the Briefing. You will receive our next monthly intelligence report directly in your inbox.
                      </p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="space-y-6">
                      <div className="space-y-2">
                        <label htmlFor="newsletter-email" className="block text-[10px] font-sans font-bold uppercase tracking-widest text-nbac-muted">
                          Official Email Address
                        </label>
                        <input
                          id="newsletter-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="executive@company.com"
                          className="w-full bg-nbac-canvas border border-nbac-border rounded-xl px-4 py-3.5 text-nbac-text placeholder:text-nbac-muted font-sans text-sm focus:outline-none focus:border-nbac-emerald focus:ring-1 focus:ring-nbac-emerald transition-all duration-300"
                        />
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-bold py-3.5 rounded-xl uppercase text-xs tracking-wider transition-all duration-300 shadow-md shadow-nbac-emerald/10 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {loading ? 'Securing Sync...' : 'Subscribe Now'}
                      </button>
                      <p className="text-[10px] text-center text-nbac-muted uppercase tracking-wider leading-relaxed">
                        By subscribing, you agree to our Terms of Use and Privacy Policy.
                      </p>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </PageTransition>
  )
}
