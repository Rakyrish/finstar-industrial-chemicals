import type { MetadataRoute } from 'next'
import { productService } from '@/services/productService'
import { blogService } from '@/services/blogService'
import { frontendConfig } from '@/lib/config'

const BASE = frontendConfig.siteUrl

// Static pages with accurate SEO priorities
const STATIC_PAGES: MetadataRoute.Sitemap = [
  { url: `${BASE}/`,         lastModified: new Date(), changeFrequency: 'weekly',  priority: 1.0 },
  { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
  { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
  { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
  { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  { url: `${BASE}/quote`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  { url: `${BASE}/search`,   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.5 },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!BASE) return []

  try {
    // ── Products (priority 0.95 — highest transactional intent) ──────────────
    const productsRes = await productService
      .list({ pageSize: 1000 })
      .catch(() => ({ results: [] as any[] }))

    const productPages: MetadataRoute.Sitemap = productsRes.results.map((product) => ({
      url: `${BASE}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    }))

    // ── Category landing pages ────────────────────────────────────────────────
    const categoriesRes = await productService
      .categories()
      .catch(() => [] as any[])

    const categoryPages: MetadataRoute.Sitemap = categoriesRes.map((cat) => ({
      url: `${BASE}/products?category=${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    }))

    // ── Blog posts ────────────────────────────────────────────────────────────
    const blogRes = await blogService
      .list({ pageSize: 500 })
      .catch(() => ({ results: [] as any[] }))

    const blogPages: MetadataRoute.Sitemap = blogRes.results.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

    // ── Technical Docs ────────────────────────────────────────────────────────
    const { technicalDocService } = await import('@/services/technicalDocService')
    const techDocsRes = await technicalDocService
      .list()
      .catch(() => [] as any[])

    const techDocPages: MetadataRoute.Sitemap = techDocsRes.map((doc) => ({
      url: `${BASE}/technical-docs/${doc.slug}`,
      lastModified: new Date(doc.updated_at || doc.created_at || new Date()),
      changeFrequency: 'monthly' as const,
      priority: 0.75,
    }))

    return [
      ...STATIC_PAGES,
      { url: `${BASE}/technical-docs`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
      ...categoryPages,
      ...productPages,
      ...blogPages,
      ...techDocPages,
    ]
  } catch (error) {
    console.error('[sitemap] Error generating dynamic sitemap:', error)
    return STATIC_PAGES
  }
}
