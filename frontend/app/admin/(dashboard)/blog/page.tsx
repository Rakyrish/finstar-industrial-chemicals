import { adminBlogPosts } from '@/lib/admin/mock-data'
import { BlogResourceScreen } from './BlogScreen'

export default function AdminBlogPage() {
  const fallback = { results: adminBlogPosts, count: adminBlogPosts.length }
  return <BlogResourceScreen fallback={fallback} />
}