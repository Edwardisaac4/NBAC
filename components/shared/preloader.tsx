'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import Image from 'next/image'

const preloaderShownStore = {
  subscribe: () => () => {},
  getSnapshot: () => {
    if (typeof window === 'undefined') return false
    return !!sessionStorage.getItem('nbac-preloader-shown')
  },
  getServerSnapshot: () => false,
}

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const isAlreadyShown = useSyncExternalStore(
    preloaderShownStore.subscribe,
    preloaderShownStore.getSnapshot,
    preloaderShownStore.getServerSnapshot
  )

  const isMounted = useSyncExternalStore(
    preloaderShownStore.subscribe,
    () => typeof window !== 'undefined',
    () => false
  )
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    if (isMounted && !isAlreadyShown) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = ''
      }
    }
  }, [isMounted, isAlreadyShown])

  useGSAP(
    () => {
      if (!isMounted || isAlreadyShown || !isVisible) return

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = ''
          sessionStorage.setItem('nbac-preloader-shown', 'true')
          setIsVisible(false)
        },
      })

      tl.to(containerRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.out',
      })
    },
    { dependencies: [isMounted, isAlreadyShown, isVisible] }
  )

  if (!isMounted || isAlreadyShown || !isVisible) return null

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
          <span className="font-sans text-[10px] font-bold text-nbac-gold-light uppercase tracking-[0.25em]">
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
            className="absolute left-0 top-0 h-full bg-nbac-gold w-0"
          />
        </div>
      </div>
    </div>
  )
}
