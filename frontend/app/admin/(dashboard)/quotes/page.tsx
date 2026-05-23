import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { fetchAdminList } from '@/lib/admin/server'
import type { AdminQuoteRow } from '@/types/admin'

export default async function QuotesPage() {
  const fallback = await fetchAdminList<AdminQuoteRow>('quotes')
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
      columns={[
        { key: 'name', label: 'Requester' },
        { key: 'company', label: 'Company' },
        { key: 'product', label: 'Product' },
        { key: 'quantity', label: 'Quantity' },
        { key: 'status', label: 'Status', render: (row) => <span className={row.status === 'approved' ? 'badge-green' : row.status === 'rejected' ? 'badge-red' : 'badge-muted'}>{row.status}</span> },
      ]}
    />
  )
}