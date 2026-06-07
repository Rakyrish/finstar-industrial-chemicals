import type {
  SchemaOrganization, SchemaProduct, SchemaBreadcrumb,
  SchemaArticle, BreadcrumbItem, Product, BlogPost,
} from '@/types'
import { frontendConfig } from './config'

const SITE_URL   = frontendConfig.siteUrl
const SITE_NAME  = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Finstar Industrial Chemicals'
const LOGO_URL   = `${SITE_URL}/logo.png`
const SITE_EMAIL = process.env.NEXT_PUBLIC_COMPANY_EMAIL ?? 'finstarindustrialsystems@gmail.com'
const SITE_PHONE = process.env.NEXT_PUBLIC_COMPANY_PHONE ?? '+254726417966'
const SITE_WHATSAPP = process.env.NEXT_PUBLIC_COMPANY_WHATSAPP ?? '+254726417966'
const EAST_AFRICA = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'East Africa']

// ── Core Organization ────────────────────────────────────────────────────────

export function organizationSchema(): SchemaOrganization {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: {
      '@type': 'ImageObject',
      url: LOGO_URL,
      width: 200,
      height: 60,
    },
    description:
      'Leading supplier of industrial chemicals, solvents, reagents, detergent chemicals, food-grade chemicals, cosmetic chemicals, laboratory chemicals, mining chemicals, and water treatment chemicals across East Africa.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Industrial Area',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      postalCode: '00506',
      addressCountry: 'KE',
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: SITE_PHONE,
        contactType: 'sales',
        areaServed: EAST_AFRICA,
        availableLanguage: ['English', 'Swahili'],
      },
      {
        '@type': 'ContactPoint',
        telephone: SITE_WHATSAPP,
        contactType: 'customer support',
        contactOption: 'TollFree',
        areaServed: EAST_AFRICA,
      },
    ],
    email: SITE_EMAIL,
    sameAs: [
      process.env.NEXT_PUBLIC_LINKEDIN_URL,
      process.env.NEXT_PUBLIC_TWITTER_URL,
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
    ].filter(Boolean) as string[],
    foundingDate: '2010',
    numberOfEmployees: { '@type': 'QuantitativeValue', minValue: 50, maxValue: 200 },
    knowsAbout: [
      'Industrial Chemicals', 'Chemical Supply', 'Detergent Chemicals',
      'Food Grade Chemicals', 'Cosmetic Chemicals', 'Laboratory Chemicals',
      'Mining Chemicals', 'Water Treatment Chemicals', 'Manufacturing Raw Materials',
    ],
    areaServed: EAST_AFRICA.map(country => ({ '@type': 'Country', name: country })),
  }
}

// ── LocalBusiness ────────────────────────────────────────────────────────────

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ChemicalSupplier'],
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    image: `${SITE_URL}/og-default.png`,
    description:
      'Premier industrial chemicals supplier serving Kenya, Uganda, Tanzania, and Rwanda. Bulk supply of solvents, acids, detergent chemicals, food-grade, and specialty chemicals for manufacturing, mining, water treatment, and laboratory applications.',
    telephone: SITE_PHONE,
    email: SITE_EMAIL,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Industrial Area',
      addressLocality: 'Nairobi',
      addressRegion: 'Nairobi County',
      postalCode: '00506',
      addressCountry: 'KE',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -1.3031934,
      longitude: 36.8219462,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '08:30',
        closes: '13:00',
      },
    ],
    currenciesAccepted: 'KES, USD',
    paymentAccepted: 'Cash, Bank Transfer, MPESA, Invoice',
    priceRange: '$$',
    areaServed: EAST_AFRICA.map(country => ({ '@type': 'Country', name: country })),
    sameAs: [
      process.env.NEXT_PUBLIC_LINKEDIN_URL,
      process.env.NEXT_PUBLIC_FACEBOOK_URL,
    ].filter(Boolean) as string[],
  }
}

// ── WebSite with SearchAction (enables Sitelinks Searchbox) ─────────────────

export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description:
      'Industrial chemical supplier in Kenya, Uganda, Tanzania, and Rwanda. Browse our catalogue of solvents, acids, detergent, food-grade, cosmetic, lab, mining, and water treatment chemicals.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
  }
}

// ── Product Schema ────────────────────────────────────────────────────────────

export function productSchema(product: Product): SchemaProduct {
  const faqs = (product.faqs ?? []).map((faq: any) => ({
    q: faq.q || faq.question || '',
    a: faq.a || faq.answer || '',
  })).filter((f: any) => f.q && f.a)

  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description ?? product.name,
    image: (product.images ?? []).map((img: any) => img.image).filter(Boolean),
    sku: product.casNumber || product.sku || String(product.id),
    brand: { '@type': 'Brand', name: SITE_NAME },
    manufacturer: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    category: product.category?.name ?? 'Industrial Chemical',
    url: `${SITE_URL}/products/${product.slug}`,
    offers: {
      '@type': 'Offer',
      availability:
        product.status === 'active'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      priceCurrency: 'KES',
      areaServed: EAST_AFRICA,
      seller: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    },
    additionalProperty: (product.specifications ?? []).map((spec: any) => ({
      '@type': 'PropertyValue',
      name: spec.key,
      value: spec.value,
      ...(spec.unit ? { unitCode: spec.unit } : {}),
    })),
  }

  // Add aggregate rating if reviews exist
  if (product.reviews && product.reviews.length > 0) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: (
        product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length
      ).toFixed(1),
      reviewCount: product.reviews.length,
      bestRating: 5,
      worstRating: 1,
    }
  }

  return schema
}

// ── FAQ Schema ───────────────────────────────────────────────────────────────

export function faqSchema(faqs: Array<{ q: string; a: string }>) {
  if (!faqs || faqs.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.a,
      },
    })),
  }
}

// ── Breadcrumb Schema ────────────────────────────────────────────────────────

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

// ── Article Schema ───────────────────────────────────────────────────────────

export function articleSchema(post: BlogPost): SchemaArticle {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [post.coverImage] : [`${SITE_URL}/og-default.png`],
    author: { '@type': 'Person', name: post.author?.name ?? 'Finstar Editorial' },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: LOGO_URL },
    },
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    url: `${SITE_URL}/blog/${post.slug}`,
    keywords: (post.tags ?? []).map((t: any) => typeof t === 'string' ? t : t.name).join(', '),
    articleSection: post.category?.name ?? 'Industrial Chemistry',
    inLanguage: 'en',
    isPartOf: { '@type': 'Blog', name: `${SITE_NAME} Knowledge Base`, url: `${SITE_URL}/blog` },
  }
}

// ── @graph bundler ───────────────────────────────────────────────────────────
/**
 * Combines multiple schema objects into a single @graph payload.
 * This reduces the number of <script> tags and is preferred by Google.
 */
export function graphSchema(schemas: object[]) {
  return {
    '@context': 'https://schema.org',
    '@graph': schemas.filter(Boolean),
  }
}

/** Render schema as a JSON-LD script tag string */
export function toJsonLd(schema: object): string {
  return JSON.stringify(schema)
}
