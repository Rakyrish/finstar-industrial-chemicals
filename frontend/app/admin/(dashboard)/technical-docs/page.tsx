import { fetchAdminList } from '@/lib/admin/server'
import { TechnicalDocsResourceScreen } from './TechnicalDocsScreen'

export default async function AdminTechnicalDocsPage() {
  const fallback = await fetchAdminList<any>('technical-docs')
  return <TechnicalDocsResourceScreen fallback={fallback} />
}
