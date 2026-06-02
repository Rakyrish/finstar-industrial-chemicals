// Core product & category types
export interface Category {
  id: number
  name: string
  slug: string
  description: string
  image?: string
  icon?: string
  productCount: number
  isFeatured: boolean
  parent?: number | null
  children?: Category[]
}

export interface Tag {
  id: number
  name: string
  slug: string
}

export interface ProductImage {
  id: number
  image: string
  alt: string
  isPrimary: boolean
  order: number
}

export interface ProductSpec {
  key: string
  value: string
  unit?: string
}

export type ProductStatus = 'active' | 'inactive' | 'out_of_stock' | 'discontinued' | 'draft' | 'scheduled'
export type UnitOfMeasure = 'kg' | 'litre' | 'tonne' | 'drum' | 'bag' | 'unit' | 'pallet' | 'KG' | 'L' | 'MT'

export interface Product {
  id: number
  name: string
  slug: string
  sku?: string
  description?: string
  shortDescription?: string
  longDescription?: string
  category: Category
  tags: Tag[]
  images?: ProductImage[]
  primaryImage?: string
  specifications: ProductSpec[]
  applications?: string[]
  benefits?: string[]
  features?: string[]
  industriesServed?: string[]
  faqs?: Array<{ q?: string; question?: string; a?: string; answer?: string }>
  casNumber?: string
  chemicalFormula?: string
  purity?: string
  appearance?: string
  density?: string
  packagingType?: string
  pricing?: string
  hazardClassification?: string
  imageAlt?: string
  imageTitle?: string
  imageCaption?: string
  whatsappTemplate?: string
  quotationTemplate?: string
  ctaContent?: string
  status: ProductStatus
  unitOfMeasure: UnitOfMeasure
  minOrderQuantity: number
  packagingInfo?: string
  storageConditions?: string
  safetyDataSheetUrl?: string
  technicalDataSheetUrl?: string
  isFeatured: boolean
  isNew: boolean
  createdAt: string
  updatedAt: string
  // SEO
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
}

export interface ProductListItem {
  id: number
  name: string
  slug: string
  sku: string
  shortDescription: string
  category: Pick<Category, 'id' | 'name' | 'slug'>
  tags: Tag[]
  primaryImage?: string
  status: ProductStatus
  unitOfMeasure: UnitOfMeasure
  minOrderQuantity: number
  casNumber?: string
  updatedAt?: string
  isFeatured: boolean
  isNew: boolean
}

export interface ProductFilters {
  category?: string
  tags?: string[]
  search?: string
  status?: ProductStatus
  page?: number
  pageSize?: number
  ordering?: string
}

export interface PaginatedProducts {
  count: number
  next: string | null
  previous: string | null
  results: ProductListItem[]
}
