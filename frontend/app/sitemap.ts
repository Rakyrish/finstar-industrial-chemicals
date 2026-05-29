import type { MetadataRoute } from 'next'
import { productService } from '@/services/productService'
import { blogService } from '@/services/blogService'

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!BASE) return []

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`,        lastModified: new Date(), changeFrequency: 'weekly',  priority: 1 },
    { url: `${BASE}/products`, lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: `${BASE}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/blog`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${BASE}/contact`,  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/quote`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
  ]

  try {
    // Fetch dynamic products
    const productsRes = await productService.list({ pageSize: 500 }).catch(() => ({ results: [] }))
    const productPages: MetadataRoute.Sitemap = productsRes.results.map((product) => ({
      url: `${BASE}/products/${product.slug}`,
      lastModified: new Date(product.updatedAt || new Date()),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    // Fetch dynamic blog posts
    const blogRes = await blogService.list({ pageSize: 500 }).catch(() => ({ results: [] }))
    const blogPages: MetadataRoute.Sitemap = blogRes.results.map((post) => ({
      url: `${BASE}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt || new Date()),
      changeFrequency: 'monthly',
      priority: 0.7,
    }))

    return [...staticPages, ...productPages, ...blogPages]
  } catch (error) {
    console.error('Error generating dynamic sitemap:', error)
    return staticPages
  }
}
