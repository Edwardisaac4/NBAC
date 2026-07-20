import { createClient } from '@/lib/supabase/server'
import { redirect }     from 'next/navigation'
import { StudioShell }  from '@/components/admin/content/studio-shell'

export default async function NewPostPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const authorName = user.user_metadata?.full_name ?? user.email ?? 'NBAC Team'

  return <StudioShell mode="create" authorName={authorName} />
}
