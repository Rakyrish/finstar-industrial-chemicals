/**
 * Performance & Core Web Vitals Monitoring
 * Tracks LCP, CLS, INP and other performance metrics
 */

import { frontendConfig } from './config'

export interface PerformanceMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  timestamp: number
}

export interface CoreWebVitals {
  lcp: PerformanceMetric | null
  cls: PerformanceMetric | null
  inp: PerformanceMetric | null
  fcp: PerformanceMetric | null
  ttfb: PerformanceMetric | null
}

export interface PerformanceReport {
  timestamp: number
  url: string
  metrics: CoreWebVitals
  apiMetrics: {
    averageResponseTime: number
    slowRequests: number
    failedRequests: number
  }
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = []
  private apiMetrics: Array<{ duration: number; statusCode: number }> = []
  private reports: PerformanceReport[] = []

  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return

    // Only track if Web Vitals are available
    this.trackCoreWebVitals()
    this.trackResourceTiming()
  }

  /**
   * Track Core Web Vitals using PerformanceObserver
   */
  private trackCoreWebVitals() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      // LCP - Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]

        if (lastEntry.startTime) {
          const metric = this.createMetric('LCP', lastEntry.startTime)
          this.recordMetric(metric)
        }
      })

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // CLS - Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        let clsValue = 0
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value
          }
        }

        const metric = this.createMetric('CLS', clsValue * 100)
        this.recordMetric(metric)
      })

      clsObserver.observe({ type: 'layout-shift', buffered: true })

      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (entries.length > 0) {
          const metric = this.createMetric('FCP', entries[0].startTime)
          this.recordMetric(metric)
        }
      })

      fcpObserver.observe({ type: 'paint', buffered: true })
    } catch (e) {
      console.warn('Could not initialize Web Vitals tracking', e)
    }
  }

  /**
   * Track resource timing (images, scripts, API calls)
   */
  private trackResourceTiming() {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return

    try {
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resource = entry as PerformanceResourceTiming
          const duration = resource.responseEnd - resource.fetchStart

          // Alert on slow resources
          if (duration > 3000) {
            console.warn(`Slow resource: ${resource.name} (${duration}ms)`)
          }
        }
      })

      resourceObserver.observe({ type: 'resource' })
    } catch (e) {
      console.warn('Could not initialize resource timing tracking', e)
    }
  }

  /**
   * Create a performance metric with rating
   */
  private createMetric(name: string, value: number): PerformanceMetric {
    const thresholds = {
      LCP: { good: 2500, poor: 4000 },
      CLS: { good: 0.1, poor: 0.25 },
      INP: { good: 200, poor: 500 },
      FCP: { good: 1800, poor: 3000 },
      TTFB: { good: 600, poor: 1800 },
    }

    const threshold = thresholds[name as keyof typeof thresholds]
    let rating: 'good' | 'needs-improvement' | 'poor'

    if (value <= threshold.good) {
      rating = 'good'
    } else if (value <= threshold.poor) {
      rating = 'needs-improvement'
    } else {
      rating = 'poor'
    }

    return {
      name,
      value,
      rating,
      timestamp: Date.now(),
    }
  }

  /**
   * Record API performance metric
   */
  recordApiMetric(duration: number, statusCode: number) {
    this.apiMetrics.push({ duration, statusCode })

    // Keep only recent metrics
    if (this.apiMetrics.length > 1000) {
      this.apiMetrics = this.apiMetrics.slice(-1000)
    }
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  /**
   * Get current Core Web Vitals
   */
  getCoreWebVitals(): CoreWebVitals {
    const getLatest = (name: string) => {
      const entries = this.metrics
        .filter((m) => m.name === name)
        .sort((a, b) => b.timestamp - a.timestamp)
      return entries.length > 0 ? entries[0] : null
    }

    return {
      lcp: getLatest('LCP'),
      cls: getLatest('CLS'),
      inp: getLatest('INP'),
      fcp: getLatest('FCP'),
      ttfb: getLatest('TTFB'),
    }
  }

  /**
   * Get API performance summary
   */
  getApiPerformanceSummary() {
    if (this.apiMetrics.length === 0) {
      return {
        averageResponseTime: 0,
        slowRequests: 0,
        failedRequests: 0,
      }
    }

    const averageResponseTime =
      this.apiMetrics.reduce((sum, m) => sum + m.duration, 0) / this.apiMetrics.length
    const slowRequests = this.apiMetrics.filter((m) => m.duration > 3000).length
    const failedRequests = this.apiMetrics.filter((m) => m.statusCode >= 400).length

    return {
      averageResponseTime,
      slowRequests,
      failedRequests,
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      metrics: this.getCoreWebVitals(),
      apiMetrics: this.getApiPerformanceSummary(),
    }

    this.reports.push(report)

    // Keep only recent reports
    if (this.reports.length > 100) {
      this.reports = this.reports.slice(-100)
    }

    return report
  }

  /**
   * Get all performance metrics
   */
  getAllMetrics() {
    return {
      metrics: [...this.metrics],
      apiMetrics: [...this.apiMetrics],
      reports: [...this.reports],
    }
  }

  /**
   * Send performance report to backend
   */
  async sendReportToBackend(report?: PerformanceReport) {
    try {
      const payload = report || this.generateReport()

      const response = await fetch(`${frontendConfig.apiUrl}/analytics/performance/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        console.log('Performance report sent to backend')
      }
    } catch (e) {
      console.error('Failed to send performance report', e)
    }
  }

  /**
   * Get performance grade (A-F)
   */
  getPerformanceGrade(): string {
    const vitals = this.getCoreWebVitals()
    let goodCount = 0
    let totalCount = 0

    Object.values(vitals).forEach((metric) => {
      if (metric) {
        totalCount++
        if (metric.rating === 'good') {
          goodCount++
        }
      }
    })

    if (totalCount === 0) return 'N/A'

    const percentage = (goodCount / totalCount) * 100

    if (percentage >= 90) return 'A'
    if (percentage >= 80) return 'B'
    if (percentage >= 70) return 'C'
    if (percentage >= 60) return 'D'
    return 'F'
  }
}

/**
 * Global performance monitor instance
 */
export const performanceMonitor = new PerformanceMonitor()

/**
 * Auto-initialize on page load
 */
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      performanceMonitor.init()
    })
  } else {
    performanceMonitor.init()
  }
}
