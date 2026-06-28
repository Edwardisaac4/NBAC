'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

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
    <div ref={containerRef} className="text-center group flex flex-col items-center">
      <div className={`font-display text-4xl font-bold tracking-tight ${numberClassName || "text-nbac-text"}`}>
        <span ref={numberRef}>0{suffix}</span>
      </div>
      <div className={`font-sans text-xs uppercase tracking-widest mt-2 ${labelClassName || "text-nbac-muted"}`}>
        {label}
      </div>
    </div>
  )
}
