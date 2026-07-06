import { useMemo, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string, defaultValue = false): boolean {
  const [subscribe, getSnapshot] = useMemo(() => {
    return [
      (notify: () => void) => {
        if (typeof window === 'undefined') return () => {}
        const mediaQuery = window.matchMedia(query)
        mediaQuery.addEventListener('change', notify)
        return () => mediaQuery.removeEventListener('change', notify)
      },
      () => {
        if (typeof window === 'undefined') return defaultValue
        return window.matchMedia(query).matches
      },
    ]
  }, [query, defaultValue])

  return useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => defaultValue
  )
}
