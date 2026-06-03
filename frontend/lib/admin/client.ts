'use client'

/**
 * Admin API client hooks.
 * 
 * useAdminResource<T>(resource, fallback)
 *  - Fetches `/api/v1/admin/{resource}/` with the admin JWT cookie
 *  - Returns { data, loading, error }
 *  - Falls back to `fallback` when the API is unavailable
 */

import { useState, useEffect, useCallback } from 'react'

const ADMIN_API_BASE =
  (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) ||
  'http://localhost:8000/api/v1'

interface UseAdminResourceResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => void
}

export function useAdminResource<T>(
  resource: string,
  fallback: T
): UseAdminResourceResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`${ADMIN_API_BASE}/admin/${resource}/`, {
        credentials: 'include',           // sends httpOnly JWT cookies
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        cache: 'no-store',
      })

      if (response.status === 401 || response.status === 403) {
        // Not authenticated or not admin — use fallback silently
        setData(fallback)
        return
      }

      if (!response.ok) {
        throw new Error(`Admin API error: ${response.status}`)
      }

      const json = await response.json()
      setData(json as T)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load data'
      setError(message)
      // Fall back to stub data so the page still renders
      setData(fallback)
    } finally {
      setLoading(false)
    }
  }, [resource]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

/** Perform a POST/PATCH/DELETE to an admin resource endpoint */
export async function adminApiRequest<T = unknown>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  body?: unknown
): Promise<T> {
  const response = await fetch(`${ADMIN_API_BASE}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => null)
    const message =
      errorData?.detail ?? errorData?.message ?? `Request failed: ${response.status}`
    throw new Error(message)
  }

  // 204 No Content
  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}
