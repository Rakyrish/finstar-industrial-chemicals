import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TechnicalDocForm from '@/components/admin/forms/TechnicalDocForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { fetchAdminDetail } from '@/lib/admin/server'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Technical Document | FINSTAR Admin',
}

export default async function EditTechnicalDocPage({ params }: PageProps) {
  const { id } = await params
  const doc = await fetchAdminDetail<any>('technical-docs', id)

  if (!doc) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit technical document"
        description="Update guidelines, safety parameters, metadata, and relations of this document."
      />
      <TechnicalDocForm docId={id} initialData={doc} />
    </div>
  )
}
