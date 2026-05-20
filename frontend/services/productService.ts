import { get } from '@/lib/api'
import type {
  Product, ProductListItem, ProductFilters,
  PaginatedProducts, Category, Tag,
} from '@/types'

const BASE = '/products'

export const productService = {
  /** List products with filters */
  async list(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    const params = new URLSearchParams()
    if (filters.category) params.set('category', filters.category)
    if (filters.search)   params.set('search',   filters.search)
    if (filters.status)   params.set('status',   filters.status)
    if (filters.page)     params.set('page',     String(filters.page))
    if (filters.pageSize) params.set('page_size', String(filters.pageSize))
    if (filters.ordering) params.set('ordering', filters.ordering)
    filters.tags?.forEach((t) => params.append('tags', t))
    return get<PaginatedProducts>(`${BASE}/?${params}`)
  },

  /** Get single product by slug */
  async bySlug(slug: string): Promise<Product> {
    return get<Product>(`${BASE}/${slug}/`)
  },

  /** Get featured products */
  async featured(limit = 6): Promise<ProductListItem[]> {
    const data = await get<PaginatedProducts>(
      `${BASE}/?is_featured=true&page_size=${limit}`
    )
    return data.results
  },

  /** Get new arrivals */
  async newArrivals(limit = 6): Promise<ProductListItem[]> {
    const data = await get<PaginatedProducts>(
      `${BASE}/?is_new=true&page_size=${limit}&ordering=-created_at`
    )
    return data.results
  },

  /** List all categories */
  async categories(): Promise<Category[]> {
    return get<Category[]>('/categories/')
  },

  /** Get category by slug */
  async categoryBySlug(slug: string): Promise<Category> {
    return get<Category>(`/categories/${slug}/`)
  },

  /** List all tags */
  async tags(): Promise<Tag[]> {
    return get<Tag[]>('/tags/')
  },

  /** Search products */
  async search(query: string, limit = 10): Promise<ProductListItem[]> {
    const data = await get<PaginatedProducts>(
      `${BASE}/?search=${encodeURIComponent(query)}&page_size=${limit}`
    )
    return data.results
  },
}
