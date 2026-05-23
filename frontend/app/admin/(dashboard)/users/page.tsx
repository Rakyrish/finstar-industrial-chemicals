import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { adminUsers } from '@/lib/admin/mock-data'

export default function UsersPage() {
  return (
    <ResourceScreen
      resource="users"
      title="Users and access"
      description="Manage Django staff and superuser accounts, invitations, and backend-driven permissions."
      fallback={{ results: adminUsers, count: adminUsers.length }}
      searchKeys={['username', 'displayName', 'email', 'role', 'status']}
      filters={[{ key: 'role', label: 'Access level', options: ['staff', 'superuser'] }]}
      exportHref="#"
      emptyTitle="No users found"
      emptyDescription="Invite team members to manage content, support, inventory, and analytics."
      columns={[
        { key: 'displayName', label: 'Name', render: (row) => <div><p className="font-semibold text-text-primary">{row.displayName}</p><p className="text-xs text-text-muted">@{row.username}</p></div> },
        { key: 'username', label: 'Username' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status' },
        { key: 'lastLoginAt', label: 'Last login' },
      ]}
    />
  )
}