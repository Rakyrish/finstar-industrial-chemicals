import { get } from '@/lib/api'
import type {
  Product, ProductListItem, ProductFilters,
  PaginatedProducts, Category, Tag,
} from '@/types'

const BASE = '/products/chemicals'

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

  async detail(slug: string): Promise<Product> {
    return this.bySlug(slug)
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
    const data = await get<any>('/products/categories/')
    return Array.isArray(data) ? data : data.results || []
  },

  /** Get category by slug */
  async categoryBySlug(slug: string): Promise<Category> {
    return get<Category>(`/products/categories/${slug}/`)
  },

  /** List all tags */
  async tags(): Promise<Tag[]> {
    const data = await get<any>('/products/tags/')
    return Array.isArray(data) ? data : data.results || []
  },

  /** Search products */
  async search(query: string, limit = 10): Promise<ProductListItem[]> {
    const data = await get<PaginatedProducts>(
      `${BASE}/?search=${encodeURIComponent(query)}&page_size=${limit}`
    )
    return data.results
  },

  async related(slug: string, limit = 4): Promise<ProductListItem[]> {
    const current = await this.bySlug(slug)
    const categorySlug = typeof current.category === 'object' ? current.category?.slug : undefined
    const data = await this.list({ category: categorySlug, pageSize: limit + 1 })
    return data.results.filter((product) => product.slug !== slug).slice(0, limit)
  },
}
