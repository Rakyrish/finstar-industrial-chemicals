import { adminUsers } from '@/lib/admin/mock-data'
import { UsersResourceScreen } from './UsersScreen'

export default function UsersPage() {
  const fallback = { results: adminUsers, count: adminUsers.length }
  return <UsersResourceScreen fallback={fallback} />
}