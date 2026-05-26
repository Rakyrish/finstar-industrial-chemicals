import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { fetchAdminList } from '@/lib/admin/server'
import type { AdminInventoryAlert } from '@/types/admin'

export default async function InventoryPage() {
  const fallback = await fetchAdminList<AdminInventoryAlert>('inventory')
  return (
    <ResourceScreen
      resource="inventory"
      title="Inventory management"
      description="Track stock levels, monitor low inventory alerts, and coordinate supplier replenishment."
      fallback={fallback}
      searchKeys={['productName', 'sku', 'supplier']}
      filters={[{ key: 'severity', label: 'Severity', options: ['warning', 'critical'] }]}
      exportHref="#"
      emptyTitle="No inventory alerts"
      emptyDescription="Stock warnings and supplier records will be surfaced here."
      columns={[
        { key: 'productName', label: 'Product' },
        { key: 'sku', label: 'SKU' },
        { key: 'stock', label: 'Stock' },
        { key: 'threshold', label: 'Threshold' },
        { key: 'supplier', label: 'Supplier' },
        { key: 'severity', label: 'Severity' },
      ]}
    />
  )
}