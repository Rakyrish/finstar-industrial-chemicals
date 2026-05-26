import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/forms/ProductForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { fetchAdminDetail } from '@/lib/admin/server'
import type { AdminProductDraft } from '@/types/admin'

interface PageProps {
  params: Promise<{ id: string }>
}

export const metadata: Metadata = {
  title: 'Edit Product | FINSTAR Admin',
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params
  const product = await fetchAdminDetail<AdminProductDraft>('products', id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit product"
        description="Update product details, media, SEO metadata, and publish settings."
      />
      <ProductForm productId={id} initialData={product} />
    </div>
  )
}
