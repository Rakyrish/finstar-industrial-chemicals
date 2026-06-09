'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { usePathname } from 'next/navigation'
import { reportVital } from '@/lib/monitoring/client'

export default function WebVitalsReporter() {
  const pathname = usePathname()

  useReportWebVitals((metric) => {
    const device: 'desktop' | 'mobile' | 'tablet' =
      typeof window !== 'undefined' && window.innerWidth < 768
        ? 'mobile'
        : window.innerWidth < 1024
        ? 'tablet'
        : 'desktop'

    reportVital(metric.name, metric.value, pathname ?? '/', device)
  })

  return null
}
