import { fetchAdminList } from '@/lib/admin/server'
import type { AdminQuoteRow } from '@/types/admin'
import { QuotesResourceScreen } from './QuotesScreen'

export default async function QuotesPage() {
  const fallback = await fetchAdminList<AdminQuoteRow>('quotes')
  return <QuotesResourceScreen fallback={fallback} />
}