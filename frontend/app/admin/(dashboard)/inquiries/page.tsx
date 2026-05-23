import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { fetchAdminList } from '@/lib/admin/server'
import type { AdminInquiryRow } from '@/types/admin'

export default async function InquiriesPage() {
  const fallback = await fetchAdminList<AdminInquiryRow>('inquiries')
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
      columns={[
        { key: 'name', label: 'Customer', render: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs text-text-muted">{row.email}</p></div> },
        { key: 'company', label: 'Company' },
        { key: 'subject', label: 'Subject' },
        { key: 'status', label: 'Status', render: (row) => <span className={row.status === 'resolved' ? 'badge-green' : row.status === 'escalated' ? 'badge-red' : 'badge-amber'}>{row.status}</span> },
        { key: 'createdAt', label: 'Created' },
      ]}
    />
  )
}