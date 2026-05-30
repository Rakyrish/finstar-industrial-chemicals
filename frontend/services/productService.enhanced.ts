/**
 * Enhanced Product Service with Error Tracking & Logging
 */
import { get, post, put, del, APIError } from '@/lib/api'
import { errorTracker, getUserFriendlyErrorMessage } from '@/lib/error-handler'
import type {
  Product,
  ProductListItem,
  ProductFilters,
  PaginatedProducts,
  Category,
  Tag,
} from '@/types'

const BASE = '/products/chemicals'

/**
 * Error handler wrapper for service calls
 */
function withErrorHandling<T>(
  serviceName: string,
  operation: string,
  fn: () => Promise<T>,
  fallback?: T
): Promise<T> {
  return fn().catch((error) => {
    const statusCode = error.response?.status || error.statusCode || 500
    const message = error.response?.data?.detail || error.message || 'Unknown error'

    errorTracker.log(
      'SERVICE_ERROR',
      `${serviceName}.${operation}() failed`,
      {
        operation: `${serviceName}.${operation}`,
        statusCode,
        message,
        error: error.message,
      },
      'error'
    )

    if (fallback !== undefined) {
      console.warn(`Using fallback for ${serviceName}.${operation}()`)
      return fallback
    }

    throw error
  })
}

/**
 * Enhanced Product Service
 */
export const productService = {
  /**
   * List products with filters and error tracking
   */
  async list(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    return withErrorHandling(
      'productService',
      'list',
      async () => {
        const params = new URLSearchParams()
        if (filters.category) params.set('category', filters.category)
        if (filters.search) params.set('search', filters.search)
        if (filters.status) params.set('status', filters.status)
        if (filters.page) params.set('page', String(filters.page))
        if (filters.pageSize) params.set('page_size', String(filters.pageSize))
        if (filters.ordering) params.set('ordering', filters.ordering)
        filters.tags?.forEach((t) => params.append('tags', t))

        return get<PaginatedProducts>(`${BASE}/?${params.toString()}`)
      },
      { results: [], count: 0, next: null, previous: null }
    )
  },

  /**
   * Get single product by slug with error tracking
   */
  async bySlug(slug: string): Promise<Product | null> {
    return withErrorHandling(
      'productService',
      'bySlug',
      async () => get<Product>(`${BASE}/${slug}/`),
      null as any
    )
  },

  /**
   * Get featured products
   */
  async featured(limit = 6): Promise<ProductListItem[]> {
    return withErrorHandling(
      'productService',
      'featured',
      async () => {
        const data = await get<PaginatedProducts>(
          `${BASE}/?is_featured=true&page_size=${limit}`
        )
        return data.results
      },
      []
    )
  },

  /**
   * Get new arrivals
   */
  async newArrivals(limit = 6): Promise<ProductListItem[]> {
    return withErrorHandling(
      'productService',
      'newArrivals',
      async () => {
        const data = await get<PaginatedProducts>(
          `${BASE}/?ordering=-created_at&page_size=${limit}`
        )
        return data.results
      },
      []
    )
  },

  /**
   * List all categories
   */
  async categories(): Promise<Category[]> {
    return withErrorHandling(
      'productService',
      'categories',
      async () => {
        const data = await get<any>('/products/categories/')
        return Array.isArray(data) ? data : data.results || []
      },
      []
    )
  },

  /**
   * Get category by slug
   */
  async categoryBySlug(slug: string): Promise<Category | null> {
    return withErrorHandling(
      'productService',
      'categoryBySlug',
      async () => {
        const categories = await this.categories()
        return categories.find((c) => c.slug === slug) || null
      },
      null
    )
  },

  /**
   * List all tags
   */
  async tags(): Promise<Tag[]> {
    return withErrorHandling(
      'productService',
      'tags',
      async () => {
        const data = await get<any>('/products/tags/')
        return Array.isArray(data) ? data : data.results || []
      },
      []
    )
  },

  /**
   * Search products
   */
  async search(query: string, limit = 10): Promise<ProductListItem[]> {
    return withErrorHandling(
      'productService',
      'search',
      async () => {
        const data = await get<PaginatedProducts>(
          `${BASE}/?search=${encodeURIComponent(query)}&page_size=${limit}`
        )
        return data.results
      },
      []
    )
  },

  /**
   * Get product inventory status
   */
  async getInventory(productId: number): Promise<any> {
    return withErrorHandling(
      'productService',
      'getInventory',
      async () => {
        return get(`/inventory/stocks/?product=${productId}`)
      },
      null
    )
  },

  /**
   * Get products by category
   */
  async byCategory(categorySlug: string, limit = 12): Promise<ProductListItem[]> {
    return withErrorHandling(
      'productService',
      'byCategory',
      async () => {
        const data = await get<PaginatedProducts>(
          `${BASE}/?category=${categorySlug}&page_size=${limit}`
        )
        return data.results
      },
      []
    )
  },
}

export default productService
