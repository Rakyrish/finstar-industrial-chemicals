'use client'

import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import type { AdminInquiryRow } from '@/types/admin'

export const inquiryColumns: AdminTableColumn<AdminInquiryRow>[] = [
  {
    key: 'name',
    label: 'Customer',
    render: (row) => (
      <div>
        <p className="font-semibold text-text-primary">{row.name}</p>
        <p className="text-xs text-text-muted">{row.email}</p>
      </div>
    ),
  },
  { key: 'company', label: 'Company' },
  { key: 'subject', label: 'Subject' },
  {
    key: 'status',
    label: 'Status',
    render: (row) => (
      <span
        className={
          row.status === 'resolved'
            ? 'badge-green'
            : row.status === 'escalated'
              ? 'badge-red'
              : 'badge-amber'
        }
      >
        {row.status}
      </span>
    ),
  },
  { key: 'createdAt', label: 'Created' },
]
