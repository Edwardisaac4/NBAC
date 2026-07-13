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

    return new Proxy({} as unknown as ReturnType<typeof createBrowserClient>, {
      get(target, prop) {
        if (prop === 'auth') {
          return new Proxy({} as unknown as Record<string, unknown>, {
            get(authTarget, authProp) {
              if (authProp === 'onAuthStateChange') {
                return (_callback?: unknown) => {
                  return {
                    data: {
                      subscription: {
                        unsubscribe: () => {
                          // Safe no-op
                        }
                      }
                    }
                  }
                }
              }
              if (authProp === 'getUser') {
                return () => Promise.resolve({ data: { user: null }, error: null })
              }
              if (authProp === 'getSession') {
                return () => Promise.resolve({ data: { session: null }, error: null })
              }
              return () => Promise.resolve({ data: { session: null, user: null }, error: null })
            }
          })
        }
        if (prop === 'from') {
          return () => {
            const builder: unknown = new Proxy(
              Object.assign(
                (onfulfilled?: (value: { data: unknown[]; error: null }) => unknown) => {
                  return Promise.resolve({ data: [], error: null }).then(onfulfilled)
                },
                {
                  then(
                    onfulfilled?: (value: { data: unknown[]; error: null }) => unknown,
                    onrejected?: (reason: unknown) => unknown
                  ) {
                    return Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected)
                  }
                }
              ),
              {
                get(targetBuilder, method) {
                  if (method === 'then') {
                    return (targetBuilder as { then: unknown }).then
                  }
                  return () => builder
                }
              }
            );
            return builder;
          }
        }
        if (prop === 'storage') {
          return new Proxy({} as unknown as Record<string, unknown>, {
            get(storageTarget, storageProp) {
              if (storageProp === 'from') {
                return () => new Proxy({} as unknown as Record<string, unknown>, {
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

