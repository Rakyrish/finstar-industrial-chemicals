import type { Metadata } from 'next'
import ProductForm from '@/components/admin/forms/ProductForm'
import AdminPageHeader from '@/components/admin/AdminPageHeader'

export const metadata: Metadata = {
  title: 'New Product | FINSTAR Admin',
}

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Add new product" description="Create a production-ready product record with images, packaging, pricing, inventory, and SEO metadata." />
      <ProductForm />
    </div>
  )
}