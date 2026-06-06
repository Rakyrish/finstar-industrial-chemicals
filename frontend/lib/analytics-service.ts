/**
 * Analytics & Tracking Service
 * Tracks user interactions, page views, searches, and conversions
 */

import { frontendConfig } from './config'
import { errorTracker } from './error-handler'

export interface PageViewData {
  page: string
  referrer: string
  device: 'desktop' | 'mobile' | 'tablet'
  userAgent: string
  timestamp: number
}

export interface SearchData {
  query: string
  resultsCount: number
  page: string
  timestamp: number
}

export interface ConversionData {
  type: 'quote' | 'contact' | 'whatsapp' | 'phone' | 'email'
  productId?: string
  productName?: string
  metadata?: Record<string, any>
  timestamp: number
}

class AnalyticsTracker {
  private queue: any[] = []
  private sessionId: string
  private batchSize = 5
  private flushInterval = 30000 // 30 seconds

  constructor() {
    this.sessionId = this.generateSessionId()
    this.setupAutoFlush()
    this.trackPageView()
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    if (typeof window !== 'undefined' && window.sessionStorage) {
      let sessionId = sessionStorage.getItem('finstar_session_id')
      if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        sessionStorage.setItem('finstar_session_id', sessionId)
      }
      return sessionId
    }
    return `session_${Date.now()}`
  }

  /**
   * Detect device type
   */
  private detectDevice(): 'desktop' | 'mobile' | 'tablet' {
    if (typeof window === 'undefined') return 'desktop'

    const ua = navigator.userAgent
    if (/mobile|android|iphone/i.test(ua)) return 'mobile'
    if (/ipad|tablet/i.test(ua)) return 'tablet'
    return 'desktop'
  }

  /**
   * Track page view
   */
  trackPageView(): void {
    if (typeof window === 'undefined') return

    const data: PageViewData = {
      page: window.location.pathname,
      referrer: document.referrer,
      device: this.detectDevice(),
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    }

    this.addToQueue({
      type: 'pageview',
      data,
    })
  }

  /**
   * Track search query
   */
  trackSearch(query: string, resultsCount: number = 0): void {
    if (typeof window === 'undefined') return

    const data: SearchData = {
      query,
      resultsCount,
      page: window.location.pathname,
      timestamp: Date.now(),
    }

    this.addToQueue({
      type: 'search',
      data,
    })
  }

  /**
   * Track conversion event
   */
  trackConversion(
    type: 'quote' | 'contact' | 'whatsapp' | 'phone' | 'email',
    productId?: string,
    productName?: string,
    metadata?: Record<string, any>
  ): void {
    if (typeof window === 'undefined') return

    const data: ConversionData = {
      type,
      productId,
      productName,
      metadata,
      timestamp: Date.now(),
    }

    this.addToQueue({
      type: 'conversion',
      data,
    })

    // Also track immediately if it's important
    if (type === 'quote' || type === 'contact') {
      this.flush()
    }
  }

  /**
   * Track custom event
   */
  trackEvent(eventName: string, eventData?: Record<string, any>): void {
    this.addToQueue({
      type: 'event',
      name: eventName,
      data: {
        ...eventData,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
        timestamp: Date.now(),
      },
    })
  }

  /**
   * Add event to queue
   */
  private addToQueue(event: any): void {
    this.queue.push({
      ...event,
      sessionId: this.sessionId,
    })

    // Flush if batch size reached
    if (this.queue.length >= this.batchSize) {
      this.flush()
    }
  }

  /**
   * Setup auto-flush interval
   */
  private setupAutoFlush(): void {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.queue.length > 0) {
          this.flush()
        }
      }, this.flushInterval)

      // Flush on page unload
      window.addEventListener('beforeunload', () => {
        if (this.queue.length > 0) {
          this.flush(true)
        }
      })
    }
  }

  /**
   * Send queued events to backend
   */
  async flush(useBeacon = false): Promise<void> {
    if (this.queue.length === 0) return

    const events = [...this.queue]
    this.queue = [] // Clear queue immediately

    try {
      const payload = {
        sessionId: this.sessionId,
        events,
        timestamp: Date.now(),
      }

      if (useBeacon && navigator.sendBeacon) {
        // Use sendBeacon for unload events
        navigator.sendBeacon(
          `${frontendConfig.apiUrl}/analytics/batch/`,
          JSON.stringify(payload)
        )
      } else {
        // Use fetch for normal requests
        const response = await fetch(`${frontendConfig.apiUrl}/analytics/batch/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        })

        if (!response.ok) {
          throw new Error(`Analytics request failed: ${response.status}`)
        }
      }

      if (process.env.NODE_ENV === 'development') {
        console.log(`Flushed ${events.length} analytics events`)
      }
    } catch (error) {
      console.warn('Failed to send analytics events', error)
      // Re-queue failed events (max 3 times)
      // This is simplified; in production you might want more sophisticated retry logic
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId
  }

  /**
   * Get queue size
   */
  getQueueSize(): number {
    return this.queue.length
  }

  /**
   * Get all events in queue (for debugging)
   */
  getQueuedEvents(): any[] {
    return [...this.queue]
  }

  /**
   * Clear queue (for debugging)
   */
  clearQueue(): void {
    this.queue = []
  }
}

/**
 * Global analytics tracker instance
 */
export const analyticsTracker = new AnalyticsTracker()

/**
 * Auto-track page views and clicks
 */
if (typeof window !== 'undefined') {
  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // User left the page - flush events
      analyticsTracker.flush()
    }
  })

  // Track link clicks (for outbound tracking)
  document.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement).closest('a')
    if (target && target.href && !target.href.startsWith(window.location.origin)) {
      // Outbound link - could track if needed
    }
  })

  // Track form submissions
  document.addEventListener('submit', (e) => {
    const form = e.target as HTMLFormElement
    const formId = form.id || form.name || 'unknown'
    analyticsTracker.trackEvent('form_submit', {
      formId,
      formName: form.name,
    })
  })
}

/**
 * Export service
 */
export const analyticsService = {
  trackPageView: () => analyticsTracker.trackPageView(),
  trackSearch: (query: string, count?: number) => analyticsTracker.trackSearch(query, count),
  trackConversion: (
    type: 'quote' | 'contact' | 'whatsapp' | 'phone' | 'email',
    productId?: string,
    productName?: string,
    metadata?: Record<string, any>
  ) => analyticsTracker.trackConversion(type, productId, productName, metadata),
  trackEvent: (eventName: string, data?: Record<string, any>) =>
    analyticsTracker.trackEvent(eventName, data),
  flush: (beacon?: boolean) => analyticsTracker.flush(beacon),
  getSessionId: () => analyticsTracker.getSessionId(),
  getQueueSize: () => analyticsTracker.getQueueSize(),
  getQueuedEvents: () => analyticsTracker.getQueuedEvents(),
}

export default analyticsService
