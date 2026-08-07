import { createClient } from '@/lib/supabase/client'

export async function logAdminActivity(
  action: 'login' | 'logout' | 'published' | 'edited' | 'deleted' | 'permission_changed',
  target: string
): Promise<void> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Skip the audit entry if no authenticated user is found
    if (!user) {
      return;
    }
    
    const adminEmail = user.email || 'unknown'
    const roleVal = (user.app_metadata?.role as string) || 'unknown'
    
    // Client-side call context: secure IP tracking is not available directly on the client.
    const clientActivityContext = 'client-side'

    const { error } = await supabase
      .from('audit_logs')
      .insert({
        admin_email: adminEmail,
        role: roleVal === 'head_admin' ? 'Head Admin' : roleVal === 'editor' ? 'Editor' : roleVal,
        action,
        target,
        ip_address: clientActivityContext
      })
      
    if (error) {
      console.error('Failed to write audit log:', error.message)
    }
  } catch (err) {
    console.error('Audit logger failed:', err)
  }
}
