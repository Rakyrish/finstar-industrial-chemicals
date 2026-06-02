/**
 * Product Service
 * Connects to Django REST API at /api/v1/products/
 *
 * Endpoint map (from backend urls.py):
 *   /api/v1/products/categories/          → CategoryViewSet
 *   /api/v1/products/tags/                → TagViewSet
 *   /api/v1/products/chemicals/           → ProductViewSet (list/create)
 *   /api/v1/products/chemicals/{slug}/    → ProductViewSet (retrieve/update/delete)
 *   /api/v1/products/chemicals/featured/  → featured action
 *   /api/v1/products/chemicals/{slug}/related/ → related action
 */
import { get, post } from '@/lib/api'
import type {
  Product,
  ProductListItem,
  ProductFilters,
  PaginatedProducts,
  Category,
  Tag,
} from '@/types'

const BASE = '/products/chemicals'

// ─── helpers ──────────────────────────────────────────────────────────────────
type ApiRecord = Record<string, any>

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeCategory(category: any): Category {
  return {
    ...category,
    isFeatured: category?.isFeatured ?? category?.is_featured ?? false,
    productCount: category?.productCount ?? category?.product_count ?? 0,
  }
}

function normalizeProduct<T extends ApiRecord>(product: T): T {
  return {
    ...product,
    category: product.category ? normalizeCategory(product.category) : product.category,
    shortDescription: product.shortDescription ?? product.short_description ?? '',
    longDescription: product.longDescription ?? product.long_description ?? '',
    minOrderQuantity: toNumber(product.minOrderQuantity ?? product.min_order_quantity, 1),
    unitOfMeasure: product.unitOfMeasure ?? product.unit_of_measure ?? 'unit',
    packagingType: product.packagingType ?? product.packaging_type ?? '',
    casNumber: product.casNumber ?? product.cas_number ?? '',
    chemicalFormula: product.chemicalFormula ?? product.chemical_formula ?? '',
    hazardClassification: product.hazardClassification ?? product.hazard_classification ?? '',
    imageAlt: product.imageAlt ?? product.image_alt ?? '',
    imageTitle: product.imageTitle ?? product.image_title ?? '',
    imageCaption: product.imageCaption ?? product.image_caption ?? '',
    seoTitle: product.seoTitle ?? product.seo_title ?? '',
    seoDescription: product.seoDescription ?? product.seo_description ?? '',
    seoKeywords: product.seoKeywords ?? product.seo_keywords ?? '',
    whatsappTemplate: product.whatsappTemplate ?? product.whatsapp_template ?? '',
    quotationTemplate: product.quotationTemplate ?? product.quotation_template ?? '',
    ctaContent: product.ctaContent ?? product.cta_content ?? '',
    schemaMarkup: product.schemaMarkup ?? product.schema_markup ?? '',
    isNew: product.isNew ?? product.is_new ?? false,
    isFeatured: product.isFeatured ?? product.is_featured ?? false,
    updatedAt: product.updatedAt ?? product.updated_at,
    createdAt: product.createdAt ?? product.created_at,
    specifications: Array.isArray(product.specifications) ? product.specifications : [],
    applications: Array.isArray(product.applications) ? product.applications : [],
    benefits: Array.isArray(product.benefits) ? product.benefits : [],
    features: Array.isArray(product.features) ? product.features : [],
    industriesServed: Array.isArray(product.industriesServed ?? product.industries_served)
      ? product.industriesServed ?? product.industries_served
      : [],
    faqs: Array.isArray(product.faqs) ? product.faqs : [],
  }
}

function buildParams(filters: ProductFilters): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.search)   params.set('search',   filters.search)
  if (filters.status)   params.set('status',   filters.status)
  if (filters.page)     params.set('page',     String(filters.page))
  if (filters.pageSize) params.set('page_size', String(filters.pageSize))
  if (filters.ordering) params.set('ordering', filters.ordering)
  filters.tags?.forEach((t) => params.append('tags', t))
  return params
}

// ─── service ──────────────────────────────────────────────────────────────────

export const productService = {
  /** List products with filters & pagination */
  async list(filters: ProductFilters = {}): Promise<PaginatedProducts> {
    try {
      const data = await get<PaginatedProducts>(`${BASE}/?${buildParams(filters)}`)
      return {
        ...data,
        results: data.results.map((product) => normalizeProduct(product) as ProductListItem),
      }
    } catch {
      return { results: [], count: 0, next: null, previous: null }
    }
  },

  /** Get single product by slug */
  async bySlug(slug: string): Promise<Product> {
    const product = await get<Product>(`${BASE}/${slug}/`)
    return normalizeProduct(product) as Product
  },

  async detail(slug: string): Promise<Product> {
    return this.bySlug(slug)
  },

  /**
   * Get featured products.
   * Uses the dedicated /featured/ action endpoint on ProductViewSet.
   * Falls back to list with is_featured param if action fails.
   */
  async featured(limit = 6): Promise<ProductListItem[]> {
    try {
      // Preferred: dedicated action endpoint
      const data = await get<any>(`${BASE}/featured/?limit=${limit}`)
      if (Array.isArray(data)) return data.map((product) => normalizeProduct(product) as ProductListItem)
      if (Array.isArray(data?.results)) return data.results.map((product: ProductListItem) => normalizeProduct(product) as ProductListItem)
    } catch {
      // Fallback: list endpoint with is_featured filter
    }
    try {
      const data = await get<PaginatedProducts>(
        `${BASE}/?is_featured=true&page_size=${limit}`
      )
      return data.results.map((product) => normalizeProduct(product) as ProductListItem)
    } catch {
      return []
    }
  },

  /** Get new arrivals ordered by creation date */
  async newArrivals(limit = 6): Promise<ProductListItem[]> {
    try {
      const data = await get<PaginatedProducts>(
        `${BASE}/?ordering=-created_at&page_size=${limit}`
      )
      return data.results.map((product) => normalizeProduct(product) as ProductListItem)
    } catch {
      return []
    }
  },

  /** List all active categories */
  async categories(): Promise<Category[]> {
    try {
      const data = await get<any>('/products/categories/')
      const categories = Array.isArray(data) ? data : (data?.results ?? [])
      return categories.map(normalizeCategory)
    } catch {
      return []
    }
  },

  /** Get a single category by slug */
  async categoryBySlug(slug: string): Promise<Category | null> {
    try {
      return normalizeCategory(await get<Category>(`/products/categories/${slug}/`))
    } catch {
      return null
    }
  },

  /** List all tags */
  async tags(): Promise<Tag[]> {
    try {
      const data = await get<any>('/products/tags/')
      return Array.isArray(data) ? data : (data?.results ?? [])
    } catch {
      return []
    }
  },

  /** Search products by keyword */
  async search(query: string, limit = 10): Promise<ProductListItem[]> {
    try {
      const data = await get<PaginatedProducts>(
        `${BASE}/?search=${encodeURIComponent(query)}&page_size=${limit}`
      )
      return data.results.map((product) => normalizeProduct(product) as ProductListItem)
    } catch {
      return []
    }
  },

  /**
   * Get related products for a given product slug.
   * Uses the dedicated /related/ action endpoint on ProductViewSet.
   */
  async related(slug: string, limit = 4): Promise<ProductListItem[]> {
    try {
      const data = await get<any>(`${BASE}/${slug}/related/?limit=${limit}`)
      if (Array.isArray(data)) return data.map((product) => normalizeProduct(product) as ProductListItem)
      if (Array.isArray(data?.results)) return data.results.map((product: ProductListItem) => normalizeProduct(product) as ProductListItem)
    } catch {
      // Fallback: fetch product's category and list by category
    }
    try {
      const product = await this.bySlug(slug)
      const categorySlug =
        typeof product.category === 'object' ? product.category?.slug : undefined
      const data = await this.list({ category: categorySlug, pageSize: limit + 1 })
      return data.results.filter((p) => p.slug !== slug).slice(0, limit)
    } catch {
      return []
    }
  },

  /** Get products by category slug */
  async byCategory(categorySlug: string, limit = 12): Promise<ProductListItem[]> {
    try {
      const data = await get<PaginatedProducts>(
        `${BASE}/?category=${categorySlug}&page_size=${limit}`
      )
      return data.results.map((product) => normalizeProduct(product) as ProductListItem)
    } catch {
      return []
    }
  },

  /** Get inventory status for a product */
  async getInventory(productId: number): Promise<any> {
    try {
      return await get(`/inventory/stocks/?product=${productId}`)
    } catch {
      return null
    }
  },
}

export default productService
