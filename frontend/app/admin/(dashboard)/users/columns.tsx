'use client'

import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import type { AdminUser } from '@/types/admin'

export const userColumns: AdminTableColumn<AdminUser>[] = [
  {
    key: 'displayName',
    label: 'Name',
    render: (row) => (
      <div>
        <p className="font-semibold text-text-primary">{row.displayName}</p>
        <p className="text-xs text-text-muted">@{row.username}</p>
      </div>
    ),
  },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'lastLoginAt', label: 'Last login' },
]
