import DashboardScreen from '@/components/admin/screens/DashboardScreen'
import { fetchAdminDashboard } from '@/lib/admin/server'

export default async function AdminDashboardPage() {
  const fallback = await fetchAdminDashboard()
  return <DashboardScreen fallback={fallback} />
}