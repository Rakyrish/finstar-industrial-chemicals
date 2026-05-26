import { fetchAdminList } from '@/lib/admin/server'
import type { AdminInquiryRow } from '@/types/admin'
import { InquiriesResourceScreen } from './InquiriesScreen'

export default async function InquiriesPage() {
  const fallback = await fetchAdminList<AdminInquiryRow>('inquiries')
  return <InquiriesResourceScreen fallback={fallback} />
}