'use client'

import { useRef, useState, useMemo, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Menu, X, User, Sun, Moon } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setTheme(isDark ? 'dark' : 'light')
      setMounted(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.documentElement.style.colorScheme = 'dark'
      localStorage.setItem('nbac-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.style.colorScheme = 'light'
      localStorage.setItem('nbac-theme', 'light')
    }
    // Dispatch a custom event so the navbar can re-read computed CSS variables
    window.dispatchEvent(new CustomEvent('nbac-theme-change', { detail: newTheme }))
  }

  if (!mounted) {
    return <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-nbac-panel/10" />
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-nbac-panel/30 hover:bg-nbac-panel/50 text-nbac-text hover:text-nbac-emerald flex items-center justify-center transition-all duration-300 cursor-pointer select-none outline-none"
      aria-label="Toggle Theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          exit={{ scale: 0.5, opacity: 0, rotate: 90 }}
          transition={{ duration: 0.2 }}
          className="flex items-center justify-center"
        >
          {theme === 'dark' ? <Sun size={16} className="text-nbac-emerald" /> : <Moon size={16} className="text-nbac-muted" />}
        </motion.span>
      </AnimatePresence>
    </button>
  )
}

export function Navbar() {
  const navRef = useRef<HTMLElement>(null)
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeLink = useMemo(() => {
    if (pathname === '/about') return 'About'
    if (pathname === '/contact') return 'Contact'
    if (pathname === '/events') return 'Events'
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

  // Listen for theme changes and re-apply nav style with the new computed vars
  useEffect(() => {
    const handleThemeChange = () => {
      // Small delay to let the browser recompute CSS vars after class toggle
      requestAnimationFrame(() => {
        applyNavInitialStyle()
      })
    }
    window.addEventListener('nbac-theme-change', handleThemeChange)
    return () => window.removeEventListener('nbac-theme-change', handleThemeChange)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen)

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Events', href: '/events' },
    { label: 'Speakers', href: '/speakers' },
    { label: 'Exhibitors', href: '/exhibitors' },
    { label: 'Contact', href: '/contact' },
  ]

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
        {/* Logo and Mobile Toggle */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleMobileMenu}
            className="md:hidden text-nbac-emerald hover:text-nbac-emerald-light transition-colors p-1"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          
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
            <div className="flex flex-col leading-[1.05] select-none">
              <span className="font-sans text-[8px] md:text-[9px] font-bold text-nbac-emerald uppercase tracking-wider">
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
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
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
          ))}
        </div>

        {/* Actions Button */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Link 
            href="/reservations"
            className="hidden md:inline-block bg-linear-to-r from-nbac-emerald to-[#059669] hover:from-[#059669] hover:to-[#047857] text-white font-sans font-bold px-6 py-2 rounded-full text-xs uppercase tracking-wider transition-all duration-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[inset_0_1px_1px_rgba(255,255,255,0.35),0_6px_20px_rgba(16,185,129,0.5)] active:scale-95"
          >
            REGISTER
          </Link>

          <button className="text-nbac-muted hover:text-nbac-emerald transition-colors p-1 md:hidden" aria-label="Profile">
            <User size={20} />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Scrim */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleMobileMenu}
            />

            {/* Content Drawer */}
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
                      />
                    </div>
                    <div className="flex flex-col leading-[1.05] select-none">
                      <span className="font-sans text-[7px] font-bold text-nbac-emerald uppercase tracking-wider">
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
                  {navLinks.map((link) => (
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
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Link 
                  href="/reservations"
                  onClick={toggleMobileMenu}
                  className="w-full text-center bg-nbac-emerald hover:bg-nbac-emerald-dark text-white font-sans font-bold py-3 rounded-full text-sm uppercase tracking-widest transition-colors shadow-lg shadow-nbac-emerald/20"
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
