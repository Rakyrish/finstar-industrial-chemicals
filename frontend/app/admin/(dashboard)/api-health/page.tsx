'use client'

import { Cable, CheckCircle, AlertTriangle, XCircle, RefreshCw, Clock, TrendingUp } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring } from '@/lib/monitoring/client'

interface ApiHealthItem {
  name: string
  status: 'Online' | 'Degraded' | 'Offline' | 'No Data'
  successRate: number | null
  avgResponseTime: number | null
  failureRate: number | null
  lastSuccess: string | null
  lastFailure: string | null
  uptime: number | null
  requests: number
}

const STATUS_CONFIG = {
  Online: { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', badge: 'badge-green' },
  Degraded: { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', badge: 'badge-amber' },
  Offline: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', badge: 'badge-red' },
  'No Data': { icon: Clock, color: 'text-text-secondary', bg: 'bg-surface-muted', badge: 'text-text-secondary border border-surface-border rounded-full px-2 py-0.5 text-xs' },
}

function UptimeBar({ value }: { value: number | null }) {
  if (value === null) return <div className="h-2 rounded-full bg-surface-muted" />
  const color = value >= 95 ? 'bg-emerald-500' : value >= 80 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="h-2 rounded-full bg-surface-muted overflow-hidden">
      <div className={`h-full ${color} transition-all`} style={{ width: `${value}%` }} />
    </div>
  )
}

export default function ApiHealthPage() {
  const { data, loading, error, refetch } = useMonitoring<ApiHealthItem[]>('api-health')

  const items = data ?? []
  const online = items.filter(i => i.status === 'Online').length
  const degraded = items.filter(i => i.status === 'Degraded').length
  const offline = items.filter(i => i.status === 'Offline').length

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="API Health Monitor"
        description="Real-time status, response times, and uptime metrics for every backend API service — sourced from actual request logs."
        actions={[{ href: '#', label: 'Refresh', variant: 'secondary' }]}
      />

      {/* Summary bar */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><CheckCircle className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Services Online</p>
            <p className="text-2xl font-bold text-text-primary">{online}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-amber-500/10 p-3 text-amber-400"><AlertTriangle className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Degraded</p>
            <p className="text-2xl font-bold text-text-primary">{degraded}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-red-500/10 p-3 text-red-400"><XCircle className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Offline</p>
            <p className="text-2xl font-bold text-text-primary">{offline}</p>
          </div>
        </div>
      </div>

      <button onClick={refetch} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-amber-400 transition">
        <RefreshCw className="h-4 w-4" /> Refresh status
      </button>

      {loading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}</div>
      ) : error ? (
        <div className="card p-6 text-center text-red-400">{error}</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map(api => {
            const cfg = STATUS_CONFIG[api.status] ?? STATUS_CONFIG['No Data']
            const Icon = cfg.icon
            return (
              <div key={api.name} className="card p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-2xl p-2.5 ${cfg.bg} ${cfg.color}`}>
                      <Cable className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-text-primary">{api.name}</p>
                      <p className="text-xs text-text-secondary">{api.requests.toLocaleString()} total requests</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-4 w-4 ${cfg.color}`} />
                    <span className={`text-xs font-medium ${cfg.color}`}>{api.status}</span>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-text-secondary">Success Rate</p>
                    <p className="text-sm font-bold text-text-primary">
                      {api.successRate !== null ? `${api.successRate.toFixed(1)}%` : 'No Data'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Avg Response</p>
                    <p className="text-sm font-bold text-text-primary">
                      {api.avgResponseTime !== null ? `${(api.avgResponseTime * 1000).toFixed(0)}ms` : 'No Data'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary">Failure Rate</p>
                    <p className={`text-sm font-bold ${(api.failureRate ?? 0) > 5 ? 'text-red-400' : 'text-text-primary'}`}>
                      {api.failureRate !== null ? `${api.failureRate.toFixed(1)}%` : 'No Data'}
                    </p>
                  </div>
                </div>

                {/* Uptime bar */}
                <div>
                  <div className="flex justify-between text-xs text-text-secondary mb-1">
                    <span>Uptime</span>
                    <span>{api.uptime !== null ? `${api.uptime.toFixed(1)}%` : '—'}</span>
                  </div>
                  <UptimeBar value={api.uptime} />
                </div>

                {/* Last events */}
                <div className="flex gap-4 text-xs text-text-secondary flex-wrap">
                  {api.lastSuccess && <span className="text-emerald-400">✓ Last success: {api.lastSuccess}</span>}
                  {api.lastFailure && <span className="text-red-400">✗ Last failure: {api.lastFailure}</span>}
                  {!api.lastSuccess && !api.lastFailure && <span>No Data Available</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
