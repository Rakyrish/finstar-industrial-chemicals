import { post } from '@/lib/api'
import type { QuoteRequest, QuoteResponse, ContactFormData } from '@/types'

export const quoteService = {
  /** Submit a quotation request */
  async submitQuote(data: QuoteRequest): Promise<QuoteResponse> {
    return post<QuoteResponse>('/inquiries/quotes/', data)
  },

  /** Submit a contact form message */
  async submitContact(data: ContactFormData): Promise<{ success: boolean; message: string }> {
    return post('/inquiries/contact/', data)
  },

  /** Get quote status by reference number */
  async getStatus(referenceNumber: string): Promise<QuoteResponse> {
    return post('/inquiries/status/', { reference_number: referenceNumber })
  },
}
