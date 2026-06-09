'use client'

import { useState } from 'react'
import { Bug, CheckCircle, XCircle, AlertTriangle, RefreshCw, Filter } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring, monitoringPatch } from '@/lib/monitoring/client'

interface ErrorItem {
  id: number
  errorType: string
  errorTypeDisplay: string
  message: string
  stackTrace: string | null
  affectedPage: string | null
  affectedApi: string | null
  affectedUser: string | null
  resolved: boolean
  resolutionNotes: string | null
  timestamp: string
}

interface ErrorData {
  errors: ErrorItem[]
  stats: Array<{ error_type: string; count: number }>
}

const ERROR_TYPE_COLORS: Record<string, string> = {
  '404': 'badge-amber',
  '500': 'badge-red',
  'openai': 'text-purple-400 bg-purple-500/10 rounded-full px-2 py-0.5 text-xs',
  'js': 'text-blue-400 bg-blue-500/10 rounded-full px-2 py-0.5 text-xs',
  'default': 'badge-amber',
}

export default function ErrorCenterPage() {
  const [filter, setFilter] = useState<string>('')
  const [resolvedFilter, setResolvedFilter] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [expanded, setExpanded] = useState<number | null>(null)
  const [resolving, setResolving] = useState<number | null>(null)

  const params: Record<string, string> = {}
  if (filter) params.type = filter
  if (resolvedFilter) params.resolved = resolvedFilter
  if (startDate) params.start = startDate
  if (endDate) params.end = endDate

  const { data, loading, error, refetch } = useMonitoring<ErrorData>('errors', params)

  async function handleResolve(id: number) {
    setResolving(id)
    try {
      await monitoringPatch(`errors/${id}`, { resolved: true, notes: 'Resolved via admin panel' })
      refetch()
    } catch (e) {
      console.error(e)
    } finally {
      setResolving(null)
    }
  }

  const errorTypes = data?.stats ?? []
  const errors = data?.errors ?? []
  const total = errors.length
  const unresolved = errors.filter(e => !e.resolved).length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Error Center"
        description="All backend exceptions, frontend JS errors, 404s, and OpenAI failures logged from real traffic."
        actions={[{ href: '#', label: 'Refresh', variant: 'secondary' }]}
      />

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-red-500/10 p-3 text-red-400"><Bug className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Total Errors</p>
            <p className="text-2xl font-bold text-text-primary">{total}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-amber-500/10 p-3 text-amber-400"><AlertTriangle className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Unresolved</p>
            <p className="text-2xl font-bold text-text-primary">{unresolved}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><CheckCircle className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Resolved</p>
            <p className="text-2xl font-bold text-text-primary">{total - unresolved}</p>
          </div>
        </div>
        <div className="card p-5">
          <p className="text-sm font-semibold text-text-primary mb-2">By Type</p>
          <div className="space-y-1">
            {errorTypes.slice(0, 4).map(s => (
              <div key={s.error_type} className="flex justify-between text-sm">
                <span className="text-text-secondary">{s.error_type}</span>
                <span className="font-semibold text-text-primary">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-secondary" />
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="input-field text-sm py-1.5 pr-8"
          >
            <option value="">All Types</option>
            <option value="500">500 Errors</option>
            <option value="404">404 Not Found</option>
            <option value="openai">OpenAI Errors</option>
            <option value="js">JavaScript Errors</option>
          </select>
        </div>
        <select
          value={resolvedFilter}
          onChange={e => setResolvedFilter(e.target.value)}
          className="input-field text-sm py-1.5 pr-8"
        >
          <option value="">All Status</option>
          <option value="false">Unresolved</option>
          <option value="true">Resolved</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          className="input-field text-sm py-1.5"
          aria-label="Start date"
        />
        <input
          type="date"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          className="input-field text-sm py-1.5"
          aria-label="End date"
        />
        <button onClick={refetch} className="ml-auto flex items-center gap-1.5 text-sm text-text-secondary hover:text-amber-400 transition">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {/* Error Log Table */}
      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="card h-16 animate-pulse" />)}</div>
      ) : error ? (
        <div className="card p-6 text-center text-red-400">{error}</div>
      ) : errors.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-text-primary font-semibold">No errors found</p>
          <p className="text-sm text-text-secondary mt-1">All systems operating normally.</p>
        </div>
      ) : (
        <div className="card divide-y divide-surface-border">
          {errors.map(err => (
            <div key={err.id} className="p-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex items-start gap-3 min-w-0">
                  <span className={err.resolved ? 'text-emerald-400 mt-0.5' : 'text-red-400 mt-0.5'}>
                    {err.resolved ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={ERROR_TYPE_COLORS[err.errorType] ?? ERROR_TYPE_COLORS.default}>
                        {err.errorTypeDisplay}
                      </span>
                      <span className="text-sm text-text-secondary">{err.timestamp}</span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-text-primary truncate">{err.message}</p>
                    <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-secondary">
                      {err.affectedPage && <span>Page: {err.affectedPage}</span>}
                      {err.affectedApi && <span>API: {err.affectedApi}</span>}
                      {err.affectedUser && <span>User: {err.affectedUser}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setExpanded(expanded === err.id ? null : err.id)}
                    className="text-xs text-text-secondary hover:text-amber-400 transition"
                  >
                    {expanded === err.id ? 'Hide trace' : 'View trace'}
                  </button>
                  {!err.resolved && (
                    <button
                      onClick={() => handleResolve(err.id)}
                      disabled={resolving === err.id}
                      className="text-xs rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-400 hover:bg-emerald-500/20 transition"
                    >
                      {resolving === err.id ? 'Resolving…' : 'Resolve'}
                    </button>
                  )}
                </div>
              </div>
              {expanded === err.id && err.stackTrace && (
                <pre className="mt-3 overflow-x-auto rounded-xl bg-surface-muted p-4 text-xs text-text-secondary">
                  {err.stackTrace}
                </pre>
              )}
              {err.resolved && err.resolutionNotes && (
                <p className="mt-2 text-xs text-emerald-400 italic">✓ {err.resolutionNotes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
