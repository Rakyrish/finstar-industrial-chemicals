import AdminShell from '@/components/admin/AdminShell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}