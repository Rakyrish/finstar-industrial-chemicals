import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import AdminProviders from '@/components/admin/AdminProviders'
import { ADMIN_THEME_COOKIE } from '@/lib/admin/auth'
import { getCurrentAdminSession } from '@/lib/admin/server'

export const metadata: Metadata = {
  title: 'Admin Dashboard | FINSTAR',
  description: 'Secure industrial chemicals administration dashboard',
}

export default async function AdminRootLayout({ children }: { children: React.ReactNode }) {
  const initialSession = await getCurrentAdminSession()
  const cookieStore = await cookies()
  const theme = cookieStore.get(ADMIN_THEME_COOKIE)?.value === 'light' ? 'light' : 'dark'

  return (
    <AdminProviders initialSession={initialSession}>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.dataset.theme = ${JSON.stringify(theme)};`,
        }}
      />
      <div className="min-h-screen bg-surface">{children}</div>
    </AdminProviders>
  )
}