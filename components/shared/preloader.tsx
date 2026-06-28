'use client'

import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    // Check if preloader has already run in this session
    const shown = sessionStorage.getItem('nbac-preloader-shown')
    if (shown) {
      setIsVisible(false)
    } else {
      document.body.style.overflow = 'hidden'
    }
    setHasChecked(true)
  }, [])

  useGSAP(
    () => {
      if (!isVisible) return

      const tl = gsap.timeline({
        onComplete: () => {
          // Fade out the entire preloader container
          gsap.to(containerRef.current, {
            opacity: 0,
            scale: 1.05,
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
              document.body.style.overflow = ''
              sessionStorage.setItem('nbac-preloader-shown', 'true')
              setIsVisible(false)
            },
          })
        },
      })

      // 1. Logo scales and fades in
      tl.fromTo(
        logoRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.8, ease: 'back.out(1.7)' }
      )

      // 2. Text fades and slides in
      tl.fromTo(
        textRef.current,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: 'power2.out' },
        '-=0.4'
      )

      // 3. Progress bar animates to 100%
      tl.fromTo(
        barRef.current,
        { width: '0%' },
        { width: '100%', duration: 1.2, ease: 'power1.inOut' },
        '-=0.3'
      )
    },
    { scope: containerRef, dependencies: [isVisible] }
  )

  if (hasChecked && !isVisible) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-9999 bg-[#101415] flex flex-col items-center justify-center px-6"
    >
      <div className="flex flex-col items-center max-w-sm text-center space-y-6">
        {/* Logo Mark */}
        <div ref={logoRef} className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl shrink-0 border border-white/10 opacity-0">
          <Image
            src="/images/logo-mark.jpg"
            alt="NBAC Logo Mark"
            fill
            className="object-cover scale-[1.05]"
            sizes="64px"
            priority
          />
        </div>

        {/* Text Brand */}
        <div ref={textRef} className="flex flex-col leading-[1.1] select-none opacity-0">
          <span className="font-sans text-[10px] font-bold text-nbac-emerald uppercase tracking-[0.25em]">
            Nigerian
          </span>
          <span className="font-display text-lg font-bold text-white tracking-wide mt-0.5">
            Business Aviation
          </span>
          <span className="font-display text-sm font-semibold text-neutral-400 tracking-wide">
            Conference
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-48 h-[2px] bg-white/10 relative overflow-hidden rounded-full mt-2">
          <div
            ref={barRef}
            className="absolute left-0 top-0 h-full bg-nbac-emerald w-0"
          />
        </div>
      </div>
    </div>
  )
}
