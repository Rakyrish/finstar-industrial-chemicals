'use client'

import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import type { AdminSeoRow } from '@/types/admin'

export const seoColumns: AdminTableColumn<AdminSeoRow>[] = [
  { key: 'page', label: 'Page' },
  { key: 'metaTitle', label: 'Meta title' },
  { key: 'metaDescription', label: 'Meta description' },
  {
    key: 'keywords',
    label: 'Keywords',
    render: (row) => (
      <div className="flex flex-wrap gap-2">
        {row.keywords.map((keyword: string) => (
          <span key={keyword} className="badge-muted">
            {keyword}
          </span>
        ))}
      </div>
    ),
  },
  { key: 'updatedAt', label: 'Updated' },
]
