import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname
  const userRole = user?.app_metadata?.role
  let isAdmin = userRole === 'head_admin' || userRole === 'editor'

  // Gated fallback for development mode
  if (process.env.NODE_ENV !== 'production' && !isAdmin) {
    const sessionCookie = request.cookies.get('nbac_session')?.value
    if (sessionCookie === 'head_admin' || sessionCookie === 'editor') {
      isAdmin = true
    }
  }

  // Helper to redirect and preserve cookies
  const redirectWithCookies = (toPath: string) => {
    const url = request.nextUrl.clone()
    url.pathname = toPath
    const redirectResponse = NextResponse.redirect(url)
    supabaseResponse.cookies.getAll().forEach((c) => {
      redirectResponse.cookies.set(c.name, c.value, {
        path: c.path,
        domain: c.domain,
        maxAge: c.maxAge,
        expires: c.expires,
        secure: c.secure,
        httpOnly: c.httpOnly,
        sameSite: c.sameSite,
      })
    })
    return redirectResponse
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!isAdmin) {
      return redirectWithCookies('/admin/login')
    }
  }

  // Redirect logged-in admin away from login page
  if (pathname === '/admin/login' && user && isAdmin) {
    return redirectWithCookies('/admin')
  }

  return supabaseResponse
}
