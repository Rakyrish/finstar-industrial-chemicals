'use client'

import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminInquiryRow, AdminListResponse } from '@/types/admin'
import { inquiryColumns } from './columns'

export function InquiriesResourceScreen({ fallback }: { fallback: AdminListResponse<AdminInquiryRow> }) {
  return (
    <ResourceScreen
      resource="inquiries"
      title="Contact inquiries"
      description="Review customer submissions, mark them resolved, and prepare email follow-ups."
      fallback={fallback}
      searchKeys={['name', 'email', 'subject', 'company']}
      filters={[{ key: 'status', label: 'Status', options: ['pending', 'resolved', 'escalated'] }]}
      exportHref="#"
      emptyTitle="No inquiries found"
      emptyDescription="Customer contact requests will appear here once users submit the contact form."
      columns={inquiryColumns}
    />
  )
}
