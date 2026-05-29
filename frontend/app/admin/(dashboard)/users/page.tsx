import { fetchAdminList } from '@/lib/admin/server'
import type { AdminUser } from '@/types/admin'
import { UsersResourceScreen } from './UsersScreen'

export default async function UsersPage() {
  const fallback = await fetchAdminList<AdminUser>('users')
  return <UsersResourceScreen fallback={fallback} />
}
