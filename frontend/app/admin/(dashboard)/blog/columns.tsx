'use client'

import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import type { AdminBlogRow } from '@/types/admin'

export const blogColumns: AdminTableColumn<AdminBlogRow>[] = [
  {
    key: 'title',
    label: 'Post',
    render: (row) => (
      <div>
        <p className="font-semibold text-text-primary">{row.title}</p>
        <p className="text-xs text-text-muted">{row.slug}</p>
      </div>
    ),
  },
  { key: 'author', label: 'Author' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span className={row.status === 'published' ? 'badge-green' : 'badge-muted'}>
        {row.status}
      </span>
    ),
  },
  {
    key: 'tags',
    label: 'Tags',
    render: (row) => (
      <div className="flex flex-wrap gap-2">
        {row.tags.map((tag: string) => (
          <span key={tag} className="badge-muted">
            {tag}
          </span>
        ))}
      </div>
    ),
  },
  { key: 'updatedAt', label: 'Updated' },
]
