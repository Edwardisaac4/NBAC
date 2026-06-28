'use client'

import Image from 'next/image'

export default function Loading() {
  return (
    <div className="fixed inset-0 z-9999 bg-nbac-canvas flex flex-col items-center justify-center transition-colors duration-300">
      <div className="flex flex-col items-center space-y-4">
        {/* Logo Mark with a glowing pulse */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-2xl shrink-0 border border-nbac-border animate-pulse bg-nbac-panel flex items-center justify-center">
          <Image
            src="/images/logo-mark.jpg"
            alt="NBAC Logo Mark"
            fill
            className="object-cover scale-[1.05]"
            sizes="64px"
            priority
          />
        </div>

        {/* Bouncing dots in emerald */}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald animate-bounce [animation-delay:-0.3s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald animate-bounce [animation-delay:-0.15s]" />
          <span className="w-1.5 h-1.5 rounded-full bg-nbac-emerald animate-bounce" />
        </div>
      </div>
    </div>
  )
}
