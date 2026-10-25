import { createClient } from '@supabase/supabase-js';
import type { Partner } from '@/lib/partners';

/**
 * Server-side read of the visible partners for the homepage wall.
 *
 * Uses a plain anon client rather than lib/supabase/server.ts for the same
 * reason as program-server.ts: that helper reads cookies(), which would opt
 * the homepage out of static generation. RLS only lets anon see rows marked
 * visible, so hidden partners never reach the page.
 *
 * Returns an empty list on any failure, so the homepage renders without the
 * wall rather than erroring.
 */
export async function fetchPartnersServer(): Promise<Partner[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) return [];

  try {
    const supabase = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error } = await supabase
      .from('partners')
      .select('id, name, tier, logo_url, storage_path, website_url, sort_order, visible')
      .eq('visible', true)
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('[partners-server] fetch failed:', error.message);
      return [];
    }

    return (data ?? []) as Partner[];
  } catch (err) {
    console.error('[partners-server] fetch threw:', err);
    return [];
  }
}
