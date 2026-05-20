// Quote / Inquiry types
export type InquiryType = 'quote' | 'inquiry' | 'sample' | 'bulk'
export type InquiryStatus = 'pending' | 'reviewing' | 'quoted' | 'closed' | 'rejected'

export interface QuoteItem {
  productId: number
  productName: string
  sku: string
  quantity: number
  unit: string
  specifications?: string
}

export interface QuoteRequest {
  // Contact Info
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  jobTitle?: string
  country: string
  // Inquiry
  type: InquiryType
  items: QuoteItem[]
  message?: string
  deliveryTimeline?: string
  preferredContactMethod?: 'email' | 'phone' | 'whatsapp'
  // Consent
  acceptTerms: boolean
  marketingConsent?: boolean
}

export interface QuoteResponse {
  id: number
  referenceNumber: string
  status: InquiryStatus
  submittedAt: string
  estimatedResponseTime: string
  message: string
}

export interface Inquiry {
  id: number
  referenceNumber: string
  type: InquiryType
  status: InquiryStatus
  firstName: string
  lastName: string
  email: string
  phone: string
  company: string
  country: string
  items: QuoteItem[]
  message?: string
  createdAt: string
  updatedAt: string
}

// Simple contact form
export interface ContactFormData {
  name: string
  email: string
  phone?: string
  company?: string
  subject: string
  message: string
}
