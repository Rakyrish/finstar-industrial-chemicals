'use client'

import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminProductRow, AdminListResponse } from '@/types/admin'
import { productColumns } from './columns'

export function ProductsResourceScreen({ fallback }: { fallback: AdminListResponse<AdminProductRow> }) {
  return (
    <ResourceScreen
      resource="products"
      title="Product management"
      description="Create, update, feature, and inventory-track industrial chemicals with SEO metadata and multi-image support."
      fallback={fallback}
      searchKeys={['name', 'slug', 'category', 'packaging']}
      filters={[{ key: 'status', label: 'Status', options: ['active', 'inactive', 'out_of_stock', 'discontinued'] }]}
      newHref="/admin/products/new"
      exportHref="#"
      emptyTitle="No products yet"
      emptyDescription="Add your first product to start building the catalog and inventory dashboard."
      columns={productColumns}
    />
  )
}
