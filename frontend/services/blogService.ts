import { get } from '@/lib/api'
import type { BlogPost, BlogListItem, BlogFilters, PaginatedBlogPosts, BlogCategory } from '@/types'

const BASE = '/blog'

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

  /** Get recent posts */
  async recent(limit = 3): Promise<BlogListItem[]> {
    const data = await get<PaginatedBlogPosts>(
      `${BASE}/?ordering=-published_at&page_size=${limit}`
    )
    return data?.results ?? []
  },

  /** List blog categories */
  async categories(): Promise<BlogCategory[]> {
    return get<BlogCategory[]>('/blog-categories/')
  },

  /** Get related posts */
  async related(slug: string, limit = 3): Promise<BlogListItem[]> {
    return get<BlogListItem[]>(`${BASE}/${slug}/related/?limit=${limit}`)
  },
}
