import type {
  SchemaOrganization, SchemaProduct, SchemaBreadcrumb,
  SchemaArticle, BreadcrumbItem, Product, BlogPost,
} from '@/types'

const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://finstarindustrial.com'
const SITE_NAME  = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Finstar Industrial Chemicals'
const LOGO_URL   = `${SITE_URL}/logo.png`

export function organizationSchema(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description: 'Leading supplier of industrial chemicals, solvents, reagents and specialty chemicals across East Africa.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Industrial Area',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      addressCountry: 'KE',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+254-700-000000',
        contactType: 'sales',
        areaServed: 'KE',
        availableLanguage: 'English',
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/finstar-industrial',
      'https://twitter.com/finstarindustrial',
    ],
  }
}

export function productSchema(product: Product): SchemaProduct {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description ?? product.name,
    image: (product.images ?? []).map((img) => img.image),
    sku: product.sku,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: {
      '@type': 'Offer',
      availability:
        product.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', name: SITE_NAME },
    },
    additionalProperty: product.specifications.map((spec) => ({
      '@type': 'PropertyValue',
      name: spec.key,
      value: spec.value,
      unitCode: spec.unit,
    })),
  }
}

export function breadcrumbSchema(items: BreadcrumbItem[]): SchemaBreadcrumb {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.href}`,
    })),
  }
}

export function articleSchema(post: BlogPost): SchemaArticle {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    author: { '@type': 'Person', name: post.author.name },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
  }
}

/** Render schema as a JSON-LD script tag string */
export function toJsonLd(schema: object): string {
  return JSON.stringify(schema)
}
