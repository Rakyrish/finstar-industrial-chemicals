'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { watermarkApi, WatermarkApiError, type BatchStatus } from './api'

const POLL_INTERVAL_MS = 3000

/**
 * Polls a batch's status every few seconds while it's in flight. Stops
 * immediately (and surfaces a terminal message) on a 404 — the batch is
 * gone — or a 401/403 — the admin session expired — instead of silently
 * retrying forever. Also stops once no jobs remain pending/processing.
 */
export function useBatchPolling(batchId: string | null) {
  const [status, setStatus] = useState<BatchStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPolling(false)
  }, [])

  useEffect(() => {
    stop()
    setStatus(null)
    setError(null)
    if (!batchId) return

    let cancelled = false

    const poll = async () => {
      try {
        const result = await watermarkApi.getBatchStatus(batchId)
        if (cancelled) return
        setStatus(result)
        if (result.counts.pending === 0 && result.counts.processing === 0) {
          stop()
        }
      } catch (err) {
        if (cancelled) return
        if (err instanceof WatermarkApiError && [404, 401, 403].includes(err.status)) {
          stop()
          setError(
            err.status === 404
              ? 'This batch could not be found anymore — it may have been cleared.'
              : 'Your admin session has expired. Please sign in again to keep watching progress.'
          )
          return
        }
        // Transient network/server error — keep polling, next tick may recover.
      }
    }

    setIsPolling(true)
    poll()
    intervalRef.current = setInterval(poll, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      stop()
    }
  }, [batchId, stop])

  return { status, error, isPolling }
}
