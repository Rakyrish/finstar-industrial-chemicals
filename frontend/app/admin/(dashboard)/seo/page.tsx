import { adminSeoPages } from '@/lib/admin/mock-data'
import { SeoResourceScreen } from './SeoScreen'

export default function SeoPage() {
  const fallback = { results: adminSeoPages, count: adminSeoPages.length }
  return <SeoResourceScreen fallback={fallback} />
}