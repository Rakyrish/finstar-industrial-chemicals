import { fetchAdminList } from '@/lib/admin/server'
import type { AdminBlogRow } from '@/types/admin'
import { BlogResourceScreen } from './BlogScreen'

export default async function AdminBlogPage() {
  const fallback = await fetchAdminList<AdminBlogRow>('blog')
  return <BlogResourceScreen fallback={fallback} />
}
