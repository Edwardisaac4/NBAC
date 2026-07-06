'use client'

import { PageTransition } from "@/components/layout/page-transition"
import { usePathname } from "next/navigation"

export default function RootTemplate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Exclude admin dashboard from page transitions
  if (pathname?.startsWith('/admin')) {
    return <>{children}</>
  }

  return <PageTransition>{children}</PageTransition>
}
