import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { adminBlogPosts } from '@/lib/admin/mock-data'

export default function AdminBlogPage() {
  return (
    <ResourceScreen
      resource="blog"
      title="Blog management"
      description="Publish articles, manage drafts, update SEO, and keep a clean content pipeline for technical and marketing posts."
      fallback={{ results: adminBlogPosts, count: adminBlogPosts.length }}
      searchKeys={['title', 'slug', 'author']}
      filters={[{ key: 'status', label: 'Status', options: ['draft', 'published', 'archived'] }]}
      newHref="/admin/blog/new"
      exportHref="#"
      emptyTitle="No blog posts yet"
      emptyDescription="Start drafting articles to improve search visibility and customer education."
      columns={[
        { key: 'title', label: 'Post', render: (row) => <div><p className="font-semibold text-text-primary">{row.title}</p><p className="text-xs text-text-muted">{row.slug}</p></div> },
        { key: 'author', label: 'Author' },
        { key: 'status', label: 'Status', render: (row) => <span className={row.status === 'published' ? 'badge-green' : 'badge-muted'}>{row.status}</span> },
        { key: 'tags', label: 'Tags', render: (row) => <div className="flex flex-wrap gap-2">{row.tags.map((tag: string) => <span key={tag} className="badge-muted">{tag}</span>)}</div> },
        { key: 'updatedAt', label: 'Updated' },
      ]}
    />
  )
}