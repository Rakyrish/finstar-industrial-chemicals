'use client'

import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminQuoteRow, AdminListResponse } from '@/types/admin'
import { quoteColumns } from './columns'

export function QuotesResourceScreen({ fallback }: { fallback: AdminListResponse<AdminQuoteRow> }) {
  return (
    <ResourceScreen
      resource="quotes"
      title="Quote requests"
      description="Track quote submissions, requested products, and response status in one place."
      fallback={fallback}
      searchKeys={['name', 'company', 'product', 'quantity']}
      filters={[{ key: 'status', label: 'Status', options: ['pending', 'reviewed', 'approved', 'rejected'] }]}
      exportHref="#"
      emptyTitle="No quote requests"
      emptyDescription="Customers requesting pricing will appear here for follow-up and export."
      columns={quoteColumns}
    />
  )
}
