import type { Metadata } from 'next'
import BlogForm from '@/components/admin/forms/BlogForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const metadata: Metadata = {
  title: 'New Blog Post | FINSTAR Admin',
}

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Create blog post" description="Write, tag, and optimize a new article with draft and publishing support." />
      <BlogForm />
    </div>
  )
}