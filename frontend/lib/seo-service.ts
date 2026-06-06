/**
 * SEO Optimization Utilities & Schema Generation
 */

export interface SEOMetadata {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  robots?: string
  author?: string
  publisher?: string
  publishedTime?: string
  modifiedTime?: string
}

/**
 * JSON-LD Schema Types
 */
export interface JsonLdSchema {
  '@context': string
  '@type': string
  [key: string]: any
}

/**
 * Generate Product Schema
 */
export function generateProductSchema(
  product: any,
  baseUrl: string
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.short_description || product.description,
    image: product.cloudinary_url || product.primary_image_url || '',
    url: `${baseUrl}/products/${product.slug}`,
    sku: product.cas_number || product.id,
    brand: {
      '@type': 'Brand',
      name: 'Finstar Industrial Chemicals',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Finstar Industrial Chemicals',
      url: baseUrl,
    },
    offers: {
      '@type': 'Offer',
      price: product.pricing?.base_price || 'Contact for pricing',
      priceCurrency: 'KES',
      availability: product.status === 'active' ? 'InStock' : 'OutOfStock',
      url: `${baseUrl}/products/${product.slug}`,
    },
    aggregateRating:
      product.reviews?.length > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: (
              product.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
              product.reviews.length
            ).toFixed(1),
            reviewCount: product.reviews.length,
          }
        : undefined,
    specifications: product.technical_specifications?.map((spec: any) => ({
      '@type': 'PropertyValue',
      name: spec.key,
      value: spec.value,
    })),
  }
}

/**
 * Generate Organization Schema
 */
export function generateOrganizationSchema(baseUrl: string): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Finstar Industrial Chemicals',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      'Leading industrial chemicals supplier in East Africa. Bulk chemical distribution, sourcing, and supply chain solutions.',
    sameAs: [
      'https://www.linkedin.com/company/finstar-industrial-chemicals',
      'https://www.facebook.com/finstarindustrials',
      'https://www.twitter.com/finstarindustrial',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Finstar Industrial Systems',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi',
      postalCode: '00100',
      addressCountry: 'KE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Sales',
      telephone: '+254-726-417966',
      email: 'finstarindustrialsystems@gmail.com',
    },
  }
}

/**
 * Generate Breadcrumb Schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
  baseUrl: string
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${baseUrl}${item.url}`,
    })),
  }
}

/**
 * Generate FAQ Schema
 */
export function generateFaqSchema(
  faqs: Array<{ q: string; a: string }>
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

/**
 * Generate Blog Post Schema
 */
export function generateBlogPostSchema(
  post: any,
  baseUrl: string
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.cover_image_url || `${baseUrl}/default-blog-image.jpg`,
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name || post.author?.name || 'Finstar Editorial',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Finstar Industrial Chemicals',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/logo.png`,
      },
    },
    url: `${baseUrl}/blog/${post.slug}`,
    articleBody: post.content,
    keywords: post.seo_keywords?.join(', '),
  }
}

/**
 * Generate Category Schema
 */
export function generateCategorySchema(
  category: any,
  baseUrl: string,
  productCount: number
): JsonLdSchema {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description,
    url: `${baseUrl}/products?category=${category.slug}`,
    itemListElement: {
      '@type': 'Product',
      description: `Browse our collection of ${category.name} products (${productCount} items)`,
    },
  }
}

/**
 * Generate SEO metadata for a page
 */
export function generateMetadata(options: {
  title: string
  description: string
  keywords?: string[]
  canonical?: string
  ogImage?: string
  ogType?: string
  author?: string
  publishedTime?: string
  modifiedTime?: string
}): SEOMetadata {
  return {
    title: options.title,
    description: options.description,
    keywords: options.keywords,
    canonical: options.canonical,
    ogTitle: options.title,
    ogDescription: options.description,
    ogImage: options.ogImage,
    ogType: options.ogType || 'website',
    twitterTitle: options.title.substring(0, 70),
    twitterDescription: options.description.substring(0, 200),
    twitterCard: options.ogImage ? 'summary_large_image' : 'summary',
    robots: 'index, follow',
    author: options.author || 'Finstar Industrial Chemicals',
    publishedTime: options.publishedTime,
    modifiedTime: options.modifiedTime,
  }
}

/**
 * Create structured JSON-LD script tag content
 */
export function createJsonLdScript(schema: JsonLdSchema): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`
}

/**
 * Validate and optimize keyword density
 */
export function analyzeKeywordDensity(
  text: string,
  keywords: string[]
): Record<string, { count: number; density: string }> {
  const textLower = text.toLowerCase()
  const wordCount = textLower.split(/\s+/).length

  const analysis: Record<string, { count: number; density: string }> = {}

  keywords.forEach((keyword) => {
    const keywordLower = keyword.toLowerCase()
    const regex = new RegExp(`\\b${keywordLower}\\b`, 'gi')
    const matches = textLower.match(regex) || []
    const count = matches.length
    const density = ((count / wordCount) * 100).toFixed(2)

    analysis[keyword] = {
      count,
      density: `${density}%`,
    }
  })

  return analysis
}

/**
 * Get SEO recommendations
 */
export function getSEORecommendations(
  metadata: SEOMetadata,
  content: string
): Array<{ type: 'error' | 'warning' | 'info'; message: string }> {
  const recommendations: Array<{ type: 'error' | 'warning' | 'info'; message: string }> = []

  // Title checks
  if (!metadata.title) {
    recommendations.push({ type: 'error', message: 'Title is missing' })
  } else if (metadata.title.length < 30) {
    recommendations.push({ type: 'warning', message: 'Title should be at least 30 characters' })
  } else if (metadata.title.length > 60) {
    recommendations.push({ type: 'warning', message: 'Title should not exceed 60 characters' })
  }

  // Meta description checks
  if (!metadata.description) {
    recommendations.push({ type: 'error', message: 'Meta description is missing' })
  } else if (metadata.description.length < 120) {
    recommendations.push({
      type: 'warning',
      message: 'Meta description should be at least 120 characters',
    })
  } else if (metadata.description.length > 160) {
    recommendations.push({
      type: 'warning',
      message: 'Meta description should not exceed 160 characters',
    })
  }

  // Keywords checks
  if (!metadata.keywords || metadata.keywords.length === 0) {
    recommendations.push({ type: 'warning', message: 'No keywords defined' })
  } else if (metadata.keywords.length > 10) {
    recommendations.push({
      type: 'info',
      message: `Consider limiting keywords to 5-10. Currently: ${metadata.keywords.length}`,
    })
  }

  // Content checks
  if (content.length < 300) {
    recommendations.push({
      type: 'warning',
      message: 'Content is too short. Aim for at least 300 words.',
    })
  }

  // OG Tags checks
  if (!metadata.ogImage) {
    recommendations.push({ type: 'info', message: 'No OpenGraph image defined' })
  }

  // Canonical URL check
  if (!metadata.canonical) {
    recommendations.push({ type: 'info', message: 'Consider adding a canonical URL' })
  }

  return recommendations
}

/**
 * Export service
 */
export const seoService = {
  generateProductSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateFaqSchema,
  generateBlogPostSchema,
  generateCategorySchema,
  generateMetadata,
  createJsonLdScript,
  analyzeKeywordDensity,
  getSEORecommendations,
}

export default seoService
