import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdminClient(url, key);
}

async function checkAdminAuth() {
  try {
    const supabaseServer = await createServerClient();
    const { data: { user } } = await supabaseServer.auth.getUser();
    const userRole = user?.app_metadata?.role;
    let isAdmin = userRole === 'head_admin' || userRole === 'editor';

    if (process.env.NODE_ENV !== 'production' && !isAdmin) {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('nbac_session')?.value;
      if (sessionCookie === 'head_admin' || sessionCookie === 'editor') {
        isAdmin = true;
      }
    }
    return isAdmin;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized: Admin privileges required' }, { status: 401 });
    }

    const supabase = getAdminClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase credentials missing' }, { status: 500 });
    }

    const body = await request.json();
    const { action, tier, id } = body;

    if (action === 'seed') {
      const { tiers } = body;
      if (!Array.isArray(tiers)) {
        return NextResponse.json({ error: 'Invalid tiers data' }, { status: 400 });
      }
      const formattedTiers = tiers.map((t: Record<string, unknown>, idx: number) => ({
        id: String(t.id || ''),
        name: String(t.name || ''),
        price: Number(t.price || 0),
        currency: String(t.currency || 'USD'),
        badge: String(t.badge || ''),
        description: String(t.description || ''),
        branding_privileges: Array.isArray(t.branding_privileges) ? t.branding_privileges : [],
        speaking_privileges: Array.isArray(t.speaking_privileges) ? t.speaking_privileges : [],
        digital_privileges: Array.isArray(t.digital_privileges) ? t.digital_privileges : [],
        availability: String(t.availability || 'available'),
        sort_order: Number(t.sort_order ?? idx),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('sponsor_tiers_db').upsert(formattedTiers);
      if (error) {
        console.error('Error seeding sponsor_tiers_db:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing tier ID' }, { status: 400 });
      const { error } = await supabase.from('sponsor_tiers_db').delete().eq('id', id);
      if (error) {
        console.error('Error deleting sponsor_tier:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'upsert' || !action) {
      const tierData = tier || body;
      const { error } = await supabase.from('sponsor_tiers_db').upsert({
        id: String(tierData.id || ''),
        name: String(tierData.name || ''),
        price: Number(tierData.price || 0),
        currency: String(tierData.currency || 'USD'),
        badge: String(tierData.badge || ''),
        description: String(tierData.description || ''),
        branding_privileges: Array.isArray(tierData.branding_privileges) ? tierData.branding_privileges : [],
        speaking_privileges: Array.isArray(tierData.speaking_privileges) ? tierData.speaking_privileges : [],
        digital_privileges: Array.isArray(tierData.digital_privileges) ? tierData.digital_privileges : [],
        availability: String(tierData.availability || 'available'),
        sort_order: Number(tierData.sort_order ?? 0),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error upserting sponsor_tier:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Unexpected error in sponsors API route:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
