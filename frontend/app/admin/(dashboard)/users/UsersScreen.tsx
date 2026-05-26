'use client'

import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminUser, AdminListResponse } from '@/types/admin'
import { userColumns } from './columns'

export function UsersResourceScreen({ fallback }: { fallback: AdminListResponse<AdminUser> }) {
  return (
    <ResourceScreen
      resource="users"
      title="Users and access"
      description="Manage Django staff and superuser accounts, invitations, and backend-driven permissions."
      fallback={fallback}
      searchKeys={['username', 'displayName', 'email', 'role', 'status']}
      filters={[{ key: 'role', label: 'Access level', options: ['staff', 'superuser'] }]}
      exportHref="#"
      emptyTitle="No users found"
      emptyDescription="Invite team members to manage content, support, inventory, and analytics."
      columns={userColumns}
    />
  )
}
