'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { cn } from '@/lib/utils'

gsap.registerPlugin(ScrollTrigger)

interface StatCounterProps {
  value: number
  suffix?: string
  label: string
  duration?: number
  numberClassName?: string
  labelClassName?: string
}

export function StatCounter({
  value,
  suffix = '',
  label,
  duration = 2,
  numberClassName,
  labelClassName,
}: StatCounterProps) {
  const numberRef = useRef<HTMLSpanElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const counter = { val: 0 }

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top 85%',
        onEnter: () => {
          gsap.to(counter, {
            val: value,
            duration,
            ease: 'power1.inOut',
            onUpdate: () => {
              if (numberRef.current) {
                numberRef.current.textContent =
                  Math.round(counter.val).toLocaleString() + suffix
              }
            },
          })
        },
      })
    },
    { scope: containerRef }
  )

  return (
    <div ref={containerRef} className="text-center group flex flex-col items-center w-full">
      <div className={cn("font-display text-3xl sm:text-4xl font-bold tracking-tight", numberClassName || "text-nbac-text")}>
        <span ref={numberRef}>0{suffix}</span>
      </div>
      <div className={cn("font-sans text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-widest mt-2 px-1 text-center leading-tight", labelClassName || "text-nbac-muted")}>
        {label}
      </div>
    </div>
  )
}
