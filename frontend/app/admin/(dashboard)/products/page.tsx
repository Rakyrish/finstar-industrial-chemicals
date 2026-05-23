import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { fetchAdminList } from '@/lib/admin/server'
import type { AdminProductRow } from '@/types/admin'

export default async function AdminProductsPage() {
  const fallback = await fetchAdminList<AdminProductRow>('products')
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
      columns={[
        { key: 'name', label: 'Product', render: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs text-text-muted">{row.slug}</p></div> },
        { key: 'category', label: 'Category' },
        { key: 'status', label: 'Status', render: (row) => <span className={row.status === 'active' ? 'badge-green' : row.status === 'out_of_stock' ? 'badge-red' : 'badge-muted'}>{row.status}</span> },
        { key: 'inventory', label: 'Inventory' },
        { key: 'packaging', label: 'Packaging' },
        { key: 'updatedAt', label: 'Updated' },
      ]}
    />
  )
}