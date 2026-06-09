'use client'

/**
 * Monitoring API client hooks.
 * Fetches from /api/v1/monitoring/* with admin JWT credentials.
 */

import { useState, useEffect, useCallback } from 'react'
import { getBackendApiUrl } from '@/lib/config'

const MONITORING_BASE =
  typeof window !== 'undefined'
    ? '/api/v1/monitoring'
    : `${getBackendApiUrl()}/monitoring`

function monitoringUrl(path: string, params?: Record<string, string | number>) {
  const cleanPath = path.replace(/^\/+|\/+$/g, '')
  const qs = params
    ? new URLSearchParams(Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))).toString()
    : ''
  return `${MONITORING_BASE}/${cleanPath}/${qs ? `?${qs}` : ''}`
}

interface UseMonitoringResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useMonitoring<T>(
  path: string,
  params?: Record<string, string | number>
): UseMonitoringResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = monitoringUrl(path, params)
      const res = await fetch(url, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) throw new Error(`Monitoring API error: ${res.status}`)
      setData(await res.json() as T)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load')
    } finally {
      setLoading(false)
    }
  }, [path, JSON.stringify(params)]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export async function monitoringPost<T = unknown>(path: string, body?: unknown): Promise<T> {
  const url = monitoringUrl(path)
  const res = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail ?? err?.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

export async function monitoringPatch<T = unknown>(path: string, body?: unknown): Promise<T> {
  const url = monitoringUrl(path)
  const res = await fetch(url, {
    method: 'PATCH',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => null)
    throw new Error(err?.detail ?? err?.error ?? `Request failed: ${res.status}`)
  }
  return res.json() as Promise<T>
}

/** Report a Core Web Vitals metric to the backend */
export async function reportVital(
  metricName: string,
  value: number,
  pageUrl: string,
  device: 'desktop' | 'mobile' | 'tablet' = 'desktop'
): Promise<void> {
  try {
    await fetch(`${MONITORING_BASE}/vitals/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ metric_name: metricName, value, page_url: pageUrl, device }),
    })
  } catch {
    // Silently fail — vitals must not break UX
  }
}
