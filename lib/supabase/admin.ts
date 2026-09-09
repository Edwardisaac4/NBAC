import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client for server-side use only.
 *
 * Bypasses RLS, so it must never be imported into a client component.
 * The payment tables (`payments`, `discount_codes`, `discount_redemptions`)
 * carry no `anon` grants at all, so every read of them — including the
 * public /pay/<token> page — goes through this client inside a server
 * component or route handler.
 *
 * Returns null rather than throwing when credentials are absent, so builds
 * and prerenders on a machine without secrets do not hard-fail. Callers
 * must handle the null.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    console.error(
      '[supabase/admin] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Service-role operations are unavailable.'
    )
    return null
  }

  return createSupabaseClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
