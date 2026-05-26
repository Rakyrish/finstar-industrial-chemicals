'use client'

import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminBlogRow, AdminListResponse } from '@/types/admin'
import { blogColumns } from './columns'

export function BlogResourceScreen({ fallback }: { fallback: AdminListResponse<AdminBlogRow> }) {
  return (
    <ResourceScreen
      resource="blog"
      title="Blog management"
      description="Publish articles, manage drafts, update SEO, and keep a clean content pipeline for technical and marketing posts."
      fallback={fallback}
      searchKeys={['title', 'slug', 'author']}
      filters={[{ key: 'status', label: 'Status', options: ['draft', 'published', 'archived'] }]}
      newHref="/admin/blog/new"
      exportHref="#"
      emptyTitle="No blog posts yet"
      emptyDescription="Start drafting articles to improve search visibility and customer education."
      columns={blogColumns}
    />
  )
}
