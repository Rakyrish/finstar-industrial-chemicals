'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
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
  {
    key: 'id',
    label: 'Actions',
    render: (row) => (
      <Link
        href={`/admin/blog/${row.id}/edit`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-surface-border hover:border-amber-500/40 hover:text-amber-400 transition-all duration-150"
      >
        <Pencil className="w-3 h-3" /> Edit
      </Link>
    ),
  },
]
