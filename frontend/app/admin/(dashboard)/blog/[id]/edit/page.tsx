import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import BlogForm from '@/components/admin/forms/BlogForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { fetchAdminDetail } from '@/lib/admin/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Blog Post | FINSTAR Admin',
}

export default async function EditBlogPage({ params }: PageProps) {
  const { id } = await params
  // Fetch details from backend via helper
  const post = await fetchAdminDetail<any>('blog', id)

  if (!post) {
    notFound()
  }

  // Map backend fields to the keys expected by BlogForm (or we can handle mapping inside BlogForm)
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit blog post"
        description="Update article content, manage tags, review quality score, and publish or schedule the post."
      />
      <BlogForm blogId={id} initialData={post} />
    </div>
  )
}
