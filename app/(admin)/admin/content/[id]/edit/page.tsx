import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { StudioShell }  from '@/components/admin/content/studio-shell'
import { getDbPosts }   from '@/lib/blog-data'
import type { ContentPost } from '@/types'

interface EditPostPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  // First try fetching from Supabase database table
  const { data: dbPost } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  let existingPost: ContentPost | null = dbPost as ContentPost | null

  // If not found in DB table, check blog mock data / fallback
  if (!existingPost) {
    const allPosts = await getDbPosts()
    const found = allPosts.find((p) => p.id === id)
    if (found) {
      existingPost = {
        id:              found.id,
        title:           found.title,
        slug:            found.title ? found.title.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') : id,
        type:            found.type,
        status:          found.status,
        body:            found.body,
        author_id:       found.author_id,
        author_name:     found.author,
        cover_image_url: found.featured_image,
        created_at:      found.created_at,
        updated_at:      found.updated_at,
      }
    }
  }

  if (!existingPost) {
    notFound()
  }

  return <StudioShell mode="edit" existingPost={existingPost} />
}
