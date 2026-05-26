'use client'

import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import type { AdminQuoteRow } from '@/types/admin'

export const quoteColumns: AdminTableColumn<AdminQuoteRow>[] = [
  { key: 'name', label: 'Requester' },
  { key: 'company', label: 'Company' },
  { key: 'product', label: 'Product' },
  { key: 'quantity', label: 'Quantity' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span
        className={
          row.status === 'approved'
            ? 'badge-green'
            : row.status === 'rejected'
              ? 'badge-red'
              : 'badge-muted'
        }
      >
        {row.status}
      </span>
    ),
  },
]
