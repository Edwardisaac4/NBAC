'use client'

import { AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageAnimatePresence({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Exclude admin dashboard from page-level animations to prevent layout/state issues
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return (
    <AnimatePresence mode="wait">
      <div key={pathname} className="contents">
        {children}
      </div>
    </AnimatePresence>
  )
}
