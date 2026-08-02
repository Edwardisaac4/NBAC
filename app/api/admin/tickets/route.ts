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
        badge: String(t.badge || ''),
        price: Number(t.price || 0),
        currency: String(t.currency || 'USD'),
        description: String(t.description || ''),
        privileges: Array.isArray(t.privileges) ? t.privileges : [],
        billing_model: String(t.billing_model || 'per_delegate'),
        included_delegates: Number(t.included_delegates || 1),
        availability: String(t.availability || 'available'),
        sort_order: Number(t.sort_order ?? idx),
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('ticket_tiers').upsert(formattedTiers);
      if (error) {
        console.error('Error seeding ticket_tiers:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'delete') {
      if (!id) return NextResponse.json({ error: 'Missing tier ID' }, { status: 400 });
      const { error } = await supabase.from('ticket_tiers').delete().eq('id', id);
      if (error) {
        console.error('Error deleting ticket_tier:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    if (action === 'upsert' || !action) {
      const tierData = tier || body;
      const { error } = await supabase.from('ticket_tiers').upsert({
        id: String(tierData.id || ''),
        name: String(tierData.name || ''),
        badge: String(tierData.badge || ''),
        price: Number(tierData.price || 0),
        currency: String(tierData.currency || 'USD'),
        description: String(tierData.description || ''),
        privileges: Array.isArray(tierData.privileges) ? tierData.privileges : [],
        billing_model: String(tierData.billing_model || 'per_delegate'),
        included_delegates: Number(tierData.included_delegates || 1),
        availability: String(tierData.availability || 'available'),
        sort_order: Number(tierData.sort_order ?? 0),
        updated_at: new Date().toISOString(),
      });

      if (error) {
        console.error('Error upserting ticket_tier:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    const error = err as Error;
    console.error('Unexpected error in tickets API route:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
