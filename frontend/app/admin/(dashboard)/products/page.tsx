import { fetchAdminList } from '@/lib/admin/server'
import type { AdminProductRow } from '@/types/admin'
import { ProductsResourceScreen } from './ProductsScreen'

export default async function AdminProductsPage() {
  const fallback = await fetchAdminList<AdminProductRow>('products')
  return <ProductsResourceScreen fallback={fallback} />
}