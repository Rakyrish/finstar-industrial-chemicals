'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an analytics or error tracking service
    console.error('NextJS Error Boundary caught error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-surface px-4 py-20">
      <div className="text-center max-w-md glass-card p-8 border border-red-500/20 shadow-glow-blue">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mx-auto mb-6 flex items-center justify-center text-red-400">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="font-display font-bold text-2xl text-text-primary mb-3">
          System Anomaly Detected
        </h1>
        <p className="text-sm text-text-secondary mb-8 leading-relaxed">
          An unexpected error occurred while loading this page. The details have been logged and our engineering team is on it.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-center gap-3">
          <button
            onClick={() => reset()}
            className="btn-primary w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Formula
          </button>
          <Link href="/" className="btn-secondary w-full sm:w-auto">
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
