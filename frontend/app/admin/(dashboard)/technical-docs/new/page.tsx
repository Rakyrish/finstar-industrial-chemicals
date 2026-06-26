import type { Metadata } from 'next'
import TechnicalDocForm from '@/components/admin/forms/TechnicalDocForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const metadata: Metadata = {
  title: 'New Technical Document | FINSTAR Admin',
}

export default function NewTechnicalDocPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Create technical document"
        description="Draft custom ISO, KEBS guides, whitepapers, or case studies with markdown/HTML editor."
      />
      <TechnicalDocForm />
    </div>
  )
}
