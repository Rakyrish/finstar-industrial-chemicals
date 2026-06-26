import { get } from '@/lib/api'

// Backend router: /api/v1/technical-docs/
const BASE = '/technical-docs'

export interface TechnicalDocListItem {
  id: number
  title: string
  slug: string
  doc_type: string
  doc_type_label: string
  standard_code: string
  excerpt: string
  is_published: boolean
  created_at: string
  updated_at: string
  view_count: number
}

export interface TechnicalDocDetail extends TechnicalDocListItem {
  body_html: string
  pdf_file: string | null
  related_products: any[]
}

export const technicalDocService = {
  /** List public technical documents with filters */
  async list(filters: { doc_type?: string; product?: string } = {}): Promise<TechnicalDocListItem[]> {
    const params = new URLSearchParams()
    if (filters.doc_type) params.set('doc_type', filters.doc_type)
    if (filters.product) params.set('product', filters.product)
    
    try {
      const data = await get<any>(`${BASE}/?${params}`)
      // The endpoint returns pagination list or flat array
      if (Array.isArray(data)) return data
      if (data && Array.isArray(data.results)) return data.results
      return []
    } catch (err) {
      console.error('Error listing technical docs:', err)
      return []
    }
  },

  /** Get a single document by slug */
  async bySlug(slug: string): Promise<TechnicalDocDetail | null> {
    try {
      return await get<TechnicalDocDetail>(`${BASE}/${slug}/`)
    } catch (err) {
      console.error(`Error getting technical doc ${slug}:`, err)
      return null
    }
  }
}
