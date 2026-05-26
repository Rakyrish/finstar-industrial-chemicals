'use client'

import Link from 'next/link'
import { Pencil } from 'lucide-react'
import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import type { AdminProductRow } from '@/types/admin'

export const productColumns: AdminTableColumn<AdminProductRow>[] = [
  {
    key: 'name',
    label: 'Product',
    render: (row) => (
      <div>
        <p className="font-semibold text-text-primary">{String(row.name ?? '')}</p>
        <p className="text-xs text-text-muted">{String(row.slug ?? '')}</p>
      </div>
    ),
  },
  { key: 'category', label: 'Category' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span
        className={
          row.status === 'active'
            ? 'badge-green'
            : row.status === 'out_of_stock'
              ? 'badge-red'
              : 'badge-muted'
        }
      >
        {String(row.status ?? '')}
      </span>
    ),
  },
  { key: 'inventory', label: 'Inventory' },
  { key: 'packaging', label: 'Packaging' },
  { key: 'updatedAt', label: 'Updated' },
  {
    key: 'id',
    label: 'Actions',
    render: (row) => (
      <Link
        href={`/admin/products/${row.id}/edit`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-surface-border hover:border-amber-500/40 hover:text-amber-400 transition-all duration-150"
      >
        <Pencil className="w-3 h-3" /> Edit
      </Link>
    ),
  },
]
