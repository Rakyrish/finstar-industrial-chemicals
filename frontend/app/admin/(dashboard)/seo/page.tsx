import { fetchAdminList } from '@/lib/admin/server'
import type { AdminSeoRow } from '@/types/admin'
import { SeoResourceScreen } from './SeoScreen'

export default async function SeoPage() {
  const fallback = await fetchAdminList<AdminSeoRow>('seo')
  return <SeoResourceScreen fallback={fallback} />
}
