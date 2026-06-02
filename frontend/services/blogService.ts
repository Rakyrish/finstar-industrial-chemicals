import { get } from '@/lib/api'
import type { BlogPost, BlogListItem, BlogFilters, PaginatedBlogPosts, BlogCategory } from '@/types'

// Backend router: /api/v1/blog/posts/, /api/v1/blog/categories/, /api/v1/blog/tags/
const BASE = '/blog/posts'

export const blogService = {
  /** List blog posts with filters */
  async list(filters: BlogFilters = {}): Promise<PaginatedBlogPosts> {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.tag)      params.set('tag',      filters.tag)
    if (filters.search)   params.set('search',   filters.search)
    if (filters.page)     params.set('page',     String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    return get<PaginatedBlogPosts>(`${BASE}/?${params}`)
  },

  /** Get a single post by slug */
  async bySlug(slug: string): Promise<BlogPost> {
    return get<BlogPost>(`${BASE}/${slug}/`)
  },

  async detail(slug: string): Promise<BlogPost> {
    return this.bySlug(slug)
  },

  /** Get recent posts — uses the /recent/ action on the backend ViewSet */
  async recent(limit = 3): Promise<BlogListItem[]> {
    try {
      // Try dedicated action endpoint first
      const data = await get<BlogListItem[]>(`${BASE}/recent/?limit=${limit}`)
      return Array.isArray(data) ? data : []
    } catch {
      // Fallback to list ordered by published_at
      const data = await get<PaginatedBlogPosts>(
        `${BASE}/?ordering=-published_at&page_size=${limit}`
      )
      return data?.results ?? []
    }
  },

  /** List blog categories — backend mounts at /blog/categories/ */
  async categories(): Promise<BlogCategory[]> {
    try {
      const data = await get<any>('/blog/categories/')
      return Array.isArray(data) ? data : (data?.results ?? [])
    } catch {
      return []
    }
  },

  /** Get related posts for a given post slug */
  async related(slug: string, limit = 3): Promise<BlogListItem[]> {
    try {
      const data = await get<any>(`${BASE}/${slug}/related/?limit=${limit}`)
      return Array.isArray(data) ? data : (data?.results ?? [])
    } catch {
      return []
    }
  },
}
