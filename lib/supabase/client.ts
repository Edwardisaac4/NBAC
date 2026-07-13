import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // Return a dummy client during build/prerender to prevent build failures.
    // In the browser, this will help identify configuration issues without hard crashing during compilation.
    if (typeof window === 'undefined') {
      console.warn(
        "Supabase environment variables are missing during server-side prerender. A dummy client has been returned."
      )
    } else {
      console.error(
        "Supabase environment variables are missing on the client side. Please check your env configuration."
      )
    }

    return new Proxy({} as any, {
      get(target, prop) {
        if (prop === 'auth') {
          return new Proxy({} as any, {
            get(authTarget, authProp) {
              if (authProp === 'getUser') {
                return () => Promise.resolve({ data: { user: null }, error: null })
              }
              return () => Promise.resolve({ data: null, error: null })
            }
          })
        }
        if (prop === 'from') {
          return () => new Proxy({} as any, {
            get(fromTarget, fromProp) {
              return () => Promise.resolve({ data: [], error: null })
            }
          })
        }
        if (prop === 'storage') {
          return new Proxy({} as any, {
            get(storageTarget, storageProp) {
              if (storageProp === 'from') {
                return () => new Proxy({} as any, {
                  get(bucketTarget, bucketProp) {
                    if (bucketProp === 'getPublicUrl') {
                      return () => ({ data: { publicUrl: '' } })
                    }
                    return () => Promise.resolve({ data: [], error: null })
                  }
                })
              }
              return () => Promise.resolve({ data: [], error: null })
            }
          })
        }
        return () => Promise.resolve({ data: null, error: null })
      }
    })
  }

  return createBrowserClient(url, anonKey)
}

