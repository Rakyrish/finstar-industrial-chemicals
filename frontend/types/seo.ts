// SEO & Metadata types
import type { Metadata } from 'next'

export interface SeoConfig {
  title: string
  description: string
  canonical?: string
  ogImage?: string
  ogType?: 'website' | 'article' | 'product'
  noIndex?: boolean
  noFollow?: boolean
  keywords?: string[]
  publishedAt?: string
  updatedAt?: string
  author?: string
}

export interface BreadcrumbItem {
  name: string
  href: string
}

export interface SchemaOrganization {
  '@context': 'https://schema.org'
  '@type': 'Organization'
  name: string
  url: string
  logo: string
  description: string
  address: SchemaPostalAddress
  contactPoint: SchemaContactPoint[]
  sameAs: string[]
  foundingDate?: string
  numberOfEmployees?: number
}

export interface SchemaPostalAddress {
  '@type': 'PostalAddress'
  streetAddress: string
  addressLocality: string
  addressRegion?: string
  postalCode?: string
  addressCountry: string
}

export interface SchemaContactPoint {
  '@type': 'ContactPoint'
  telephone: string
  contactType: string
  areaServed?: string
  availableLanguage?: string
}

export interface SchemaProduct {
  '@context': 'https://schema.org'
  '@type': 'Product'
  name: string
  description: string
  image?: string[]
  sku?: string
  brand: { '@type': 'Brand'; name: string }
  manufacturer?: { '@type': 'Organization'; name: string }
  offers?: SchemaOffer
  additionalProperty?: SchemaPropertyValue[]
}

export interface SchemaOffer {
  '@type': 'Offer'
  availability: string
  priceCurrency?: string
  itemCondition: string
  seller: { '@type': 'Organization'; name: string }
}

export interface SchemaPropertyValue {
  '@type': 'PropertyValue'
  name: string
  value: string
  unitCode?: string
}

export interface SchemaBreadcrumb {
  '@context': 'https://schema.org'
  '@type': 'BreadcrumbList'
  itemListElement: {
    '@type': 'ListItem'
    position: number
    name: string
    item: string
  }[]
}

export interface SchemaArticle {
  '@context': 'https://schema.org'
  '@type': 'Article'
  headline: string
  description: string
  image?: string
  author: { '@type': 'Person'; name: string }
  publisher: { '@type': 'Organization'; name: string; logo: { '@type': 'ImageObject'; url: string } }
  datePublished: string
  dateModified: string
}

export type GeneratedMetadata = Metadata
