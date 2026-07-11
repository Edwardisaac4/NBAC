import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';

export async function POST(request: Request) {
  try {
    // 1. Authenticate the requesting user using the standard cookies client
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized: Session expired or invalid' }, { status: 401 });
    }

    // 2. Check if the user is authorized (must have an admin role)
    const userRole = user.app_metadata?.role;
    if (userRole !== 'head_admin' && userRole !== 'editor') {
      return NextResponse.json({ error: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }

    // 3. Parse input parameters
    const { targetUserId, newRole } = await request.json();

    if (!targetUserId || !newRole) {
      return NextResponse.json({ error: 'Missing targetUserId or newRole' }, { status: 400 });
    }

    if (newRole !== 'head_admin' && newRole !== 'editor') {
      return NextResponse.json({ error: 'Invalid role value' }, { status: 400 });
    }

    // Only Head Admins can change anyone's role (including their own)
    if (userRole !== 'head_admin') {
      return NextResponse.json({ error: 'Forbidden: Only Head Admins can change user roles' }, { status: 403 });
    }

    // 4. Initialize Supabase Admin client with service role key
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 5. Update user's role in auth.users app_metadata
    const { error: adminUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { app_metadata: { role: newRole } }
    );

    if (adminUpdateError) {
      console.error('Failed to update app_metadata:', adminUpdateError.message);
      return NextResponse.json({ error: `Auth update failed: ${adminUpdateError.message}` }, { status: 500 });
    }

    // 6. Update user's role in public.profiles table
    const { error: dbUpdateError } = await supabaseAdmin
      .from('profiles')
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq('id', targetUserId);

    if (dbUpdateError) {
      console.error('Failed to update profiles table role:', dbUpdateError.message);
      return NextResponse.json({ error: `Profiles update failed: ${dbUpdateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, role: newRole });
  } catch (err: unknown) {
    console.error('Unexpected error in update-role API:', err);
    return NextResponse.json({ error: 'An unexpected internal server error occurred' }, { status: 500 });
  }
}
