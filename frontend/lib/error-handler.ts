/**
 * Centralized Error Handling System
 * Logs errors, tracks them, and provides user-friendly messages
 */

import { frontendConfig } from './config'

export interface ErrorLog {
  id: string
  timestamp: number
  level: 'error' | 'warning' | 'info'
  type: string
  message: string
  context?: Record<string, any>
  stack?: string
  userId?: string
  url?: string
}

class ErrorTracker {
  private errors: ErrorLog[] = []
  private maxErrors = 100
  private subscribers: ((error: ErrorLog) => void)[] = []

  /**
   * Log an error
   */
  log(
    type: string,
    message: string,
    context?: Record<string, any>,
    level: 'error' | 'warning' | 'info' = 'error'
  ) {
    const error: ErrorLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      type,
      message,
      context,
      stack: new Error().stack,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }

    this.errors.push(error)

    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Notify subscribers
    this.subscribers.forEach((cb) => cb(error))

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      const log = level === 'warning' ? console.warn : console[level]
      log(
        `[${type}] ${message}`,
        context || '',
        error.stack || ''
      )
    }

    return error.id
  }

  /**
   * API Error Handler
   */
  logApiError(
    path: string,
    method: string,
    statusCode: number,
    error: any,
    context?: Record<string, any>
  ) {
    return this.log(
      'API_ERROR',
      `${method} ${path} failed with status ${statusCode}`,
      {
        method,
        path,
        statusCode,
        errorMessage: error?.message,
        ...context,
      },
      statusCode >= 500 ? 'error' : 'warning'
    )
  }

  /**
   * Track API performance
   */
  logApiPerformance(
    path: string,
    method: string,
    duration: number,
    statusCode: number
  ) {
    // Log slow requests (> 3 seconds)
    if (duration > 3000) {
      this.log(
        'SLOW_API',
        `${method} ${path} took ${duration}ms`,
        {
          method,
          path,
          duration,
          statusCode,
        },
        'warning'
      )
    }
  }

  /**
   * Subscribe to error events
   */
  subscribe(callback: (error: ErrorLog) => void) {
    this.subscribers.push(callback)
    return () => {
      this.subscribers = this.subscribers.filter((cb) => cb !== callback)
    }
  }

  /**
   * Get recent errors
   */
  getRecent(count = 10): ErrorLog[] {
    return this.errors.slice(-count)
  }

  /**
   * Get errors by type
   */
  getByType(type: string): ErrorLog[] {
    return this.errors.filter((e) => e.type === type)
  }

  /**
   * Clear error logs
   */
  clear() {
    this.errors = []
  }

  /**
   * Get all errors
   */
  getAll(): ErrorLog[] {
    return [...this.errors]
  }

  /**
   * Send error report to backend (optional)
   */
  async sendToBackend(errorIds?: string[]) {
    try {
      const toSend = errorIds
        ? this.errors.filter((e) => errorIds.includes(e.id))
        : this.errors

      if (toSend.length === 0) return

      const response = await fetch(`${frontendConfig.apiUrl}/admin/errors/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ errors: toSend }),
      })

      if (response.ok) {
        console.log(`Sent ${toSend.length} errors to backend`)
      }
    } catch (e) {
      console.error('Failed to send errors to backend', e)
    }
  }
}

/**
 * Global error tracker instance
 */
export const errorTracker = new ErrorTracker()

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(statusCode: number, originalMessage: string): string {
  const messages: Record<number, string> = {
    400: 'Invalid request. Please check your input.',
    401: 'Your session has expired. Please log in again.',
    403: 'You do not have permission to perform this action.',
    404: 'The requested resource was not found.',
    429: 'Too many requests. Please try again later.',
    500: 'Server error. Please try again later.',
    502: 'Service temporarily unavailable. Please try again.',
    503: 'Service maintenance in progress. Please try again later.',
    504: 'Request timeout. Please try again.',
  }

  return messages[statusCode] || 'An unexpected error occurred. Please try again.'
}

/**
 * Global error handler for unhandled rejections
 */
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.log(
      'UNHANDLED_REJECTION',
      event.reason?.message || String(event.reason),
      {
        reason: event.reason,
      },
      'error'
    )
  })

  window.addEventListener('error', (event) => {
    errorTracker.log(
      'UNCAUGHT_ERROR',
      event.message,
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      'error'
    )
  })
}
