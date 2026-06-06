/**
 * WhatsApp and Phone Integration Utilities
 * Provides methods to generate WhatsApp links, phone links, and track interactions
 */

import { frontendConfig } from './config'
import { errorTracker } from './error-handler'

export interface ContactAction {
  type: 'whatsapp' | 'phone' | 'email'
  timestamp: number
  page: string
  productId?: string
  productName?: string
  userId?: string
}

/**
 * WhatsApp Integration
 */
export const whatsappService = {
  /**
   * Get WhatsApp contact number (formatted for wa.me)
   */
  getContactNumber(): string {
    const raw = frontendConfig.whatsappNumber
    // Remove all non-numeric characters
    return raw.replace(/\D/g, '')
  },

  /**
   * Generate WhatsApp direct message link
   */
  generateLink(message?: string): string {
    const number = this.getContactNumber()
    if (!number) {
      console.error('WhatsApp number not configured')
      return 'https://wa.me'
    }

    const baseUrl = `https://wa.me/${number}`

    if (!message) {
      return baseUrl
    }

    const encodedMessage = encodeURIComponent(message)
    return `${baseUrl}?text=${encodedMessage}`
  },

  /**
   * Generate product inquiry message
   */
  generateProductInquiryMessage(
    productName: string,
    quantity?: string
  ): string {
    const qty = quantity || 'inquiry'
    return `Hello Finstar,\n\nI'm interested in ${productName} (${qty}).\n\nPlease send me pricing and availability.\n\nThank you.`
  },

  /**
   * Generate quote request message
   */
  generateQuoteMessage(products: Array<{ name: string; quantity: string }>): string {
    const list = products.map((p) => `• ${p.name}: ${p.quantity}`).join('\n')
    return `Hello Finstar,\n\nI would like to request a quotation for:\n\n${list}\n\nPlease send me pricing and delivery timeline.\n\nThank you.`
  },

  /**
   * Generate technical inquiry message
   */
  generateTechnicalInquiryMessage(
    subject: string,
    details: string
  ): string {
    return `Hello Finstar,\n\n${subject}\n\n${details}\n\nPlease advise.\n\nThank you.`
  },

  /**
   * Open WhatsApp link in new window
   */
  openChat(message?: string): void {
    try {
      const link = this.generateLink(message)
      window.open(link, 'whatsapp-chat', 'width=600,height=600')

      // Track the interaction
      trackContactAction('whatsapp')
    } catch (error) {
      errorTracker.log(
        'WHATSAPP_ERROR',
        'Failed to open WhatsApp',
        { error: String(error) },
        'error'
      )
    }
  },

  /**
   * Get WhatsApp button label
   */
  getButtonLabel(): string {
    return 'Chat on WhatsApp'
  },
}

/**
 * Phone Call Integration
 */
export const phoneService = {
  /**
   * Get phone number (formatted for tel:)
   */
  getPhoneNumber(): string {
    return frontendConfig.phoneNumber
  },

  /**
   * Generate phone call link
   */
  generateLink(): string {
    const number = this.getPhoneNumber()
    if (!number) {
      console.error('Phone number not configured')
      return 'tel:'
    }

    // Remove all non-numeric characters except + for international
    const cleaned = number.replace(/[^\d+]/g, '')
    return `tel:${cleaned}`
  },

  /**
   * Initiate phone call
   */
  call(): void {
    try {
      const link = this.generateLink()
      window.location.href = link

      // Track the interaction
      trackContactAction('phone')
    } catch (error) {
      errorTracker.log(
        'PHONE_ERROR',
        'Failed to initiate phone call',
        { error: String(error) },
        'error'
      )
    }
  },

  /**
   * Copy phone number to clipboard
   */
  async copyToClipboard(): Promise<boolean> {
    try {
      const number = this.getPhoneNumber()
      await navigator.clipboard.writeText(number)
      return true
    } catch (error) {
      errorTracker.log(
        'CLIPBOARD_ERROR',
        'Failed to copy phone number',
        { error: String(error) },
        'warning'
      )
      return false
    }
  },

  /**
   * Get phone button label
   */
  getButtonLabel(): string {
    return `Call: ${this.getPhoneNumber()}`
  },
}

/**
 * Email Integration
 */
export const emailService = {
  /**
   * Get company email
   */
  getEmail(): string {
    return frontendConfig.companyEmail
  },

  /**
   * Generate email link
   */
  generateLink(
    subject?: string,
    body?: string
  ): string {
    const email = this.getEmail()
    if (!email) {
      console.error('Email not configured')
      return 'mailto:'
    }

    const params = new URLSearchParams()
    if (subject) params.set('subject', subject)
    if (body) params.set('body', body)

    const query = params.toString()
    return query ? `mailto:${email}?${query}` : `mailto:${email}`
  },

  /**
   * Open email client
   */
  sendEmail(subject?: string, body?: string): void {
    try {
      const link = this.generateLink(subject, body)
      window.location.href = link

      // Track the interaction
      trackContactAction('email')
    } catch (error) {
      errorTracker.log(
        'EMAIL_ERROR',
        'Failed to open email client',
        { error: String(error) },
        'error'
      )
    }
  },

  /**
   * Get email button label
   */
  getButtonLabel(): string {
    return `Email: ${this.getEmail()}`
  },
}

/**
 * Track contact action (for analytics)
 */
async function trackContactAction(
  type: 'whatsapp' | 'phone' | 'email',
  productId?: string,
  productName?: string
): Promise<void> {
  try {
    const action: ContactAction = {
      type,
      timestamp: Date.now(),
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      productId,
      productName,
    }

    // Only send tracking if we have analytics endpoint
    if (type === 'whatsapp') {
      await fetch(`${frontendConfig.apiUrl}/analytics/whatsapp-click/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: action.page,
          product_id: productId,
          product_name: productName,
        }),
      }).catch((e) => console.warn('Failed to track WhatsApp click', e))
    } else if (type === 'phone') {
      await fetch(`${frontendConfig.apiUrl}/analytics/phone-click/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: action.page,
          product_id: productId,
          product_name: productName,
        }),
      }).catch((e) => console.warn('Failed to track phone click', e))
    }
  } catch (error) {
    console.warn('Failed to track contact action', error)
  }
}

/**
 * Export combined service
 */
export const contactService = {
  whatsapp: whatsappService,
  phone: phoneService,
  email: emailService,
  trackAction: trackContactAction,
}

export default contactService
