'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Menu, X, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

gsap.registerPlugin(ScrollTrigger)



export function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aboutDropdownOpen, setAboutDropdownOpen] = useState(false)
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false)
  const [tabletAboutOpen, setTabletAboutOpen] = useState(false)
  const [galleryDropdownOpen, setGalleryDropdownOpen] = useState(false)
  const [mobileGalleryOpen, setMobileGalleryOpen] = useState(false)
  const [tabletGalleryOpen, setTabletGalleryOpen] = useState(false)

  const activeLink = useMemo(() => {
    if (pathname === '/about' || pathname === '/blog' || pathname?.startsWith('/blog/') || pathname === '/privacy' || pathname === '/terms') return 'About Us'
    if (pathname === '/contact') return 'Contact'
    if (pathname === '/program' || pathname?.startsWith('/program/') || pathname === '/events' || pathname?.startsWith('/events/')) return 'Program'
    if (pathname === '/speakers' || pathname?.startsWith('/speakers/')) return 'Speakers'
    if (pathname === '/exhibitors' || pathname?.startsWith('/exhibitors/')) return 'Exhibitors'
    if (pathname === '/gallery' || pathname?.startsWith('/gallery/')) return 'Gallery'
    return 'Home'
  }, [pathname])

  // Helper to read the computed value of a CSS custom property
  const getCSSVar = (name: string) => {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  }

  // Apply the initial (non-scrolled) nav style from computed CSS vars
  const applyNavInitialStyle = () => {
    if (!navRef.current) return
    gsap.set(navRef.current, {
      backgroundColor: getCSSVar('--nbac-nav-bg-initial'),
      boxShadow: getCSSVar('--nbac-nav-shadow-initial'),
    })
  }

  useGSAP(
    () => {
      // Set the initial computed style
      applyNavInitialStyle()

      ScrollTrigger.create({
        start: 'top -20',
        onEnter: () => {
          gsap.to(navRef.current, {
            y: -2,
            scale: 0.98,
            backgroundColor: getCSSVar('--nbac-nav-bg-scrolled'),
            boxShadow: getCSSVar('--nbac-nav-shadow-scrolled'),
            duration: 0.35,
            ease: 'power2.out',
          })
        },
        onLeaveBack: () => {
          gsap.to(navRef.current, {
            y: 0,
            scale: 1,
            backgroundColor: getCSSVar('--nbac-nav-bg-initial'),
            boxShadow: getCSSVar('--nbac-nav-shadow-initial'),
            duration: 0.35,
            ease: 'power2.out',
          })
        },
      })
    },
    { scope: navRef }
  )



  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    if (!mobileMenuOpen) {
      setMobileAboutOpen(false)
      setTabletAboutOpen(false)
      setMobileGalleryOpen(false)
      setTabletGalleryOpen(false)
    }
  }


  return (
    <>
      <nav
        ref={navRef}
        className="fixed top-4 left-4 right-4 md:left-12 md:right-12 lg:left-24 lg:right-24 z-50 h-14 md:h-16 rounded-full flex items-center justify-between px-5 md:px-10"
        style={{ 
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer group">
          <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-lg overflow-hidden shadow-md shrink-0">
            <Image
              src="/images/logo-mark.jpg"
              alt="NBAC Logo Mark"
              fill
              className="object-cover scale-[1.05]"
              sizes="40px"
              priority
            />
          </div>
          <div className="flex lg:hidden xl:flex flex-col leading-[1.05] select-none">
            <span className="font-sans text-[8px] md:text-[9px] font-bold text-nbac-gold uppercase tracking-wider">
              Nigerian
            </span>
            <span className="font-display text-xs md:text-sm font-bold text-nbac-text tracking-wide">
              Business Aviation
            </span>
            <span className="font-display text-[10px] md:text-xs font-semibold text-nbac-muted tracking-wide">
              Conference
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex items-center gap-6 xl:gap-8">
          {NAV_LINKS.map((link) => {
            if (link.label === 'About Us') {
              return (
                <div
                  key={link.label}
                  className="relative py-4"
                  onMouseEnter={() => setAboutDropdownOpen(true)}
                  onMouseLeave={() => setAboutDropdownOpen(false)}
                  onFocus={() => setAboutDropdownOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setAboutDropdownOpen(false);
                    }
                  }}
                >
                  <Link
                    href={link.href}
                    aria-expanded={aboutDropdownOpen}
                    aria-haspopup="menu"
                    className={cn(
                      "flex items-center gap-1 font-sans text-xs uppercase tracking-wider transition-colors px-1",
                      activeLink === link.label ? "text-nbac-emerald font-medium" : "text-nbac-body hover:text-nbac-emerald"
                    )}
                  >
                    {link.label}
                    <ChevronDown size={12} className={cn("transition-transform duration-200", aboutDropdownOpen && "rotate-180")} />
                    {activeLink === link.label && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-nbac-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {aboutDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-48 rounded-xl bg-nbac-panel/95 border border-nbac-border backdrop-blur-md p-2 shadow-xl z-50 flex flex-col gap-0.5"
                      >
                        <Link
                          href="/blog"
                          className="px-4 py-2 font-sans text-[11px] uppercase tracking-wider text-nbac-body hover:text-nbac-emerald hover:bg-nbac-emerald/5 rounded-lg transition-all duration-200"
                        >
                          Blog
                        </Link>
                        <Link
                          href="/privacy"
                          className="px-4 py-2 font-sans text-[11px] uppercase tracking-wider text-nbac-body hover:text-nbac-emerald hover:bg-nbac-emerald/5 rounded-lg transition-all duration-200"
                        >
                          Privacy Policy
                        </Link>
                        <Link
                          href="/terms"
                          className="px-4 py-2 font-sans text-[11px] uppercase tracking-wider text-nbac-body hover:text-nbac-emerald hover:bg-nbac-emerald/5 rounded-lg transition-all duration-200"
                        >
                          Terms of Use
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            if (link.label === 'Gallery') {
              return (
                <div
                  key={link.label}
                  className="relative py-4"
                  onMouseEnter={() => setGalleryDropdownOpen(true)}
                  onMouseLeave={() => setGalleryDropdownOpen(false)}
                  onFocus={() => setGalleryDropdownOpen(true)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setGalleryDropdownOpen(false);
                    }
                  }}
                >
                  <Link
                    href={link.href}
                    aria-expanded={galleryDropdownOpen}
                    aria-haspopup="menu"
                    className={cn(
                      "flex items-center gap-1 font-sans text-xs uppercase tracking-wider transition-colors px-1",
                      activeLink === link.label ? "text-nbac-emerald font-medium" : "text-nbac-body hover:text-nbac-emerald"
                    )}
                  >
                    {link.label}
                    <ChevronDown size={12} className={cn("transition-transform duration-200", galleryDropdownOpen && "rotate-180")} />
                    {activeLink === link.label && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 left-0 right-0 h-[2px] bg-nbac-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>

                  <AnimatePresence>
                    {galleryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 w-48 rounded-xl bg-nbac-panel/95 border border-nbac-border backdrop-blur-md p-2 shadow-xl z-50 flex flex-col gap-0.5"
                      >
                        <Link
                          href="/gallery/archives"
                          className="px-4 py-2 font-sans text-[11px] uppercase tracking-wider text-nbac-body hover:text-nbac-emerald hover:bg-nbac-emerald/5 rounded-lg transition-all duration-200"
                        >
                          Archives
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            }

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "relative font-sans text-xs uppercase tracking-wider transition-colors py-2 px-1",
                  activeLink === link.label ? "text-nbac-emerald font-medium" : "text-nbac-body hover:text-nbac-emerald"
                )}
              >
                {link.label}
                {activeLink === link.label && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-nbac-emerald rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Actions & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <Link 
            href="/reservations"
            className={cn(
              mobileMenuOpen ? "hidden lg:inline-block" : "hidden md:inline-block",
              "bg-gradient-to-r from-nbac-gold to-nbac-gold-dark hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold px-6 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4),0_4px_15px_rgba(197,160,89,0.25)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_6px_20px_rgba(197,160,89,0.45)] active:scale-95"
            )}
          >
            REGISTER
          </Link>

          <button
            onClick={toggleMobileMenu}
            className="lg:hidden text-nbac-emerald hover:text-nbac-emerald-light transition-colors p-1 cursor-pointer"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile & Tablet Menus */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Scrim (active for both mobile and tablet) */}
            <motion.div
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />

            {/* Mobile Content Drawer (slides from left) */}
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 bg-nbac-panel/95 backdrop-blur-lg border-r border-nbac-border p-6 flex flex-col justify-between md:hidden"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <Link href="/" onClick={toggleMobileMenu} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-md shrink-0">
                      <Image
                        src="/images/logo-mark.jpg"
                        alt="NBAC Logo Mark"
                        fill
                        className="object-cover scale-[1.05]"
                        sizes="32px"
                        priority
                      />
                    </div>
                    <div className="flex flex-col leading-[1.05] select-none">
                      <span className="font-sans text-[7px] font-bold text-nbac-gold uppercase tracking-wider">
                        Nigerian
                      </span>
                      <span className="font-display text-xs font-bold text-nbac-text tracking-wide">
                        Business Aviation
                      </span>
                      <span className="font-display text-[9px] font-semibold text-nbac-muted tracking-wide">
                        Conference
                      </span>
                    </div>
                  </Link>
                  <button onClick={toggleMobileMenu} className="text-nbac-muted hover:text-nbac-text">
                    <X size={20} />
                  </button>
                </div>
                <div className="flex flex-col gap-6">
                  {NAV_LINKS.map((link) => {
                    if (link.label === 'About Us') {
                      return (
                        <div key={link.label} className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <Link
                              href={link.href}
                              onClick={toggleMobileMenu}
                              className={cn(
                                "text-sm font-sans uppercase tracking-wide transition-colors",
                                activeLink === link.label ? "text-[#10b981] font-semibold" : "text-nbac-text hover:text-nbac-emerald"
                              )}
                            >
                              {link.label}
                            </Link>
                            <button
                              onClick={() => setMobileAboutOpen(!mobileAboutOpen)}
                              className="p-1 text-nbac-muted hover:text-nbac-text"
                            >
                              <ChevronDown size={14} className={cn("transition-transform duration-250", mobileAboutOpen && "rotate-180")} />
                            </button>
                          </div>
                          
                          <AnimatePresence initial={false}>
                            {mobileAboutOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden flex flex-col pl-4 mt-2 gap-3 border-l border-nbac-border"
                              >
                                <Link
                                  href="/blog"
                                  onClick={toggleMobileMenu}
                                  className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                                >
                                  Blog
                                </Link>
                                <Link
                                  href="/privacy"
                                  onClick={toggleMobileMenu}
                                  className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                                >
                                  Privacy Policy
                                </Link>
                                <Link
                                  href="/terms"
                                  onClick={toggleMobileMenu}
                                  className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                                >
                                  Terms of Use
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    if (link.label === 'Gallery') {
                      return (
                        <div key={link.label} className="flex flex-col">
                          <div className="flex items-center justify-between">
                            <Link
                              href={link.href}
                              onClick={toggleMobileMenu}
                              className={cn(
                                "text-sm font-sans uppercase tracking-wide transition-colors",
                                activeLink === link.label ? "text-[#10b981] font-semibold" : "text-nbac-text hover:text-nbac-emerald"
                              )}
                            >
                              {link.label}
                            </Link>
                            <button
                              onClick={() => setMobileGalleryOpen(!mobileGalleryOpen)}
                              className="p-1 text-nbac-muted hover:text-nbac-text"
                            >
                              <ChevronDown size={14} className={cn("transition-transform duration-250", mobileGalleryOpen && "rotate-180")} />
                            </button>
                          </div>
                          
                          <AnimatePresence initial={false}>
                            {mobileGalleryOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden flex flex-col pl-4 mt-2 gap-3 border-l border-nbac-border"
                              >
                                <Link
                                  href="/gallery/archives"
                                  onClick={toggleMobileMenu}
                                  className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                                >
                                  Archives
                                </Link>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }

                    return (
                      <Link
                        key={link.label}
                        href={link.href}
                        onClick={toggleMobileMenu}
                        className={cn(
                          "text-sm font-sans uppercase tracking-wide transition-colors",
                          activeLink === link.label ? "text-[#10b981] font-semibold" : "text-nbac-text hover:text-nbac-emerald"
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Link 
                  href="/reservations"
                  onClick={toggleMobileMenu}
                  className="w-full text-center bg-gradient-to-r from-nbac-gold to-nbac-gold-dark hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold py-3 rounded-full text-sm uppercase tracking-widest transition-colors shadow-lg shadow-nbac-gold/20"
                >
                  REGISTER
                </Link>
              </div>
            </motion.div>

            {/* Tablet Content Dropdown (drops from top) */}
            <motion.div
              className="fixed left-0 right-0 top-0 z-40 bg-nbac-panel/95 backdrop-blur-lg border-b border-nbac-border pt-24 pb-8 px-12 hidden md:flex lg:hidden flex-col gap-6"
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="grid grid-cols-3 gap-6">
                {NAV_LINKS.map((link) => {
                  if (link.label === 'About Us') {
                    return (
                      <div
                        key={link.label}
                        className={cn(
                          "flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300",
                          activeLink === link.label ? "border-nbac-emerald/40 bg-nbac-emerald/5" : "border-nbac-border bg-nbac-canvas/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={link.href}
                            onClick={toggleMobileMenu}
                            className={cn(
                              "text-sm font-sans uppercase tracking-widest font-semibold",
                              activeLink === link.label ? "text-[#10b981]" : "text-nbac-text"
                            )}
                          >
                            {link.label}
                          </Link>
                          <button
                            onClick={() => setTabletAboutOpen(!tabletAboutOpen)}
                            className="p-1 text-nbac-muted hover:text-nbac-text"
                          >
                            <ChevronDown size={14} className={cn("transition-transform duration-250", tabletAboutOpen && "rotate-180")} />
                          </button>
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {tabletAboutOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden flex flex-col gap-2 border-t border-nbac-border/50 pt-2"
                            >
                              <Link
                                href="/blog"
                                onClick={toggleMobileMenu}
                                className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                              >
                                Blog
                              </Link>
                              <Link
                                href="/privacy"
                                onClick={toggleMobileMenu}
                                className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                              >
                                Privacy Policy
                              </Link>
                              <Link
                                href="/terms"
                                onClick={toggleMobileMenu}
                                className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                              >
                                Terms of Use
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  }

                  if (link.label === 'Gallery') {
                    return (
                      <div
                        key={link.label}
                        className={cn(
                          "flex flex-col gap-3 p-4 rounded-xl border transition-all duration-300",
                          activeLink === link.label ? "border-nbac-emerald/40 bg-nbac-emerald/5" : "border-nbac-border bg-nbac-canvas/40"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            href={link.href}
                            onClick={toggleMobileMenu}
                            className={cn(
                              "text-sm font-sans uppercase tracking-widest font-semibold",
                              activeLink === link.label ? "text-[#10b981]" : "text-nbac-text"
                            )}
                          >
                            {link.label}
                          </Link>
                          <button
                            onClick={() => setTabletGalleryOpen(!tabletGalleryOpen)}
                            className="p-1 text-nbac-muted hover:text-nbac-text"
                          >
                            <ChevronDown size={14} className={cn("transition-transform duration-250", tabletGalleryOpen && "rotate-180")} />
                          </button>
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {tabletGalleryOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden flex flex-col gap-2 border-t border-nbac-border/50 pt-2"
                            >
                              <Link
                                href="/gallery/archives"
                                onClick={toggleMobileMenu}
                                className="text-xs font-sans uppercase tracking-wider text-nbac-muted hover:text-nbac-emerald py-1 transition-colors text-left"
                              >
                                Archives
                              </Link>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={toggleMobileMenu}
                      className={cn(
                        "text-sm font-sans uppercase tracking-widest text-center py-4 rounded-xl border border-nbac-border bg-nbac-canvas/40 hover:bg-nbac-canvas hover:border-nbac-emerald/30 transition-colors flex items-center justify-center h-full",
                        activeLink === link.label ? "text-[#10b981] font-semibold border-nbac-emerald/40 bg-nbac-emerald/5" : "text-nbac-text"
                      )}
                    >
                      {link.label}
                    </Link>
                  )
                })}
              </div>
              <div className="mt-4 flex justify-center">
                <Link 
                  href="/reservations"
                  onClick={toggleMobileMenu}
                  className="w-full max-w-md text-center bg-gradient-to-r from-nbac-gold to-nbac-gold-dark hover:from-nbac-gold-light hover:to-nbac-gold text-[#0b0f10] font-sans font-bold py-3 rounded-full text-sm uppercase tracking-widest transition-colors shadow-lg shadow-nbac-gold/20"
                >
                  REGISTER
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
