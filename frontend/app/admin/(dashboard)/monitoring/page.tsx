'use client'

import { useState } from 'react'
import {
  Activity, Users, Eye, TrendingUp, TrendingDown,
  Clock, MousePointerClick, Globe, RefreshCw,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring } from '@/lib/monitoring/client'

interface OverviewData {
  overview: {
    totalVisitors: number
    activeUsers: number
    visitorsToday: number
    visitorsThisWeek: number
    visitorsThisMonth: number
    returningVisitors: number
    newVisitors: number
    avgSessionDuration: number
    bounceRate: number
  }
  topLandingPages: Array<{ page: string; count: number }>
  topExitPages: Array<{ page: string; count: number }>
  mostViewedPages: Array<{ page: string; count: number }>
  userFlow: Array<{ source: string; target: string; value: number }>
  visitorsChart: Array<{ date: string; count: number }>
}

function StatCard({
  label, value, sub, icon: Icon, trend, color = 'amber'
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  trend?: 'up' | 'down' | 'neutral'
  color?: string
}) {
  const colorMap: Record<string, string> = {
    amber: 'bg-amber-500/10 text-amber-400',
    green: 'bg-emerald-500/10 text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
  }
  return (
    <div className="card p-5 flex items-start gap-4">
      <span className={`rounded-2xl p-3 ${colorMap[color] ?? colorMap.amber}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-secondary">{label}</p>
        <p className="mt-0.5 text-2xl font-bold text-text-primary">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>}
      </div>
      {trend && (
        <span className={trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-text-secondary'}>
          {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : trend === 'down' ? <ArrowDownRight className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
        </span>
      )}
    </div>
  )
}

function MiniChart({ points }: { points: Array<{ date: string; count: number }> }) {
  if (!points?.length) return <div className="h-32 flex items-center justify-center text-text-secondary text-sm">No Data Available</div>
  const max = Math.max(...points.map(p => p.count), 1)
  return (
    <div className="flex items-end gap-1 h-32">
      {points.slice(-30).map((p, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-amber-500/70 rounded-t transition-all hover:bg-amber-400"
            style={{ height: `${(p.count / max) * 100}%`, minHeight: p.count > 0 ? 4 : 0 }}
            title={`${p.date}: ${p.count} views`}
          />
        </div>
      ))}
    </div>
  )
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}m ${s}s`
}

export default function MonitoringPage() {
  const [days, setDays] = useState(30)
  const { data, loading, error, refetch } = useMonitoring<OverviewData>('overview', { days })

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Operations Center"
        description="Real-time website traffic, user behaviour, page performance, and conversion signals from actual visitor data."
        actions={[{ href: '#', label: 'Refresh', variant: 'secondary' }]}
      />

      {/* Period selector */}
      <div className="flex items-center gap-2 flex-wrap">
        {[7, 14, 30, 90].map(d => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${days === d ? 'bg-amber-500 text-white' : 'border border-surface-border text-text-secondary hover:bg-surface-muted'}`}
          >
            {d} days
          </button>
        ))}
        <button onClick={refetch} className="ml-auto flex items-center gap-1.5 text-sm text-text-secondary hover:text-amber-400 transition">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-28 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-400">{error}</div>
      ) : data ? (
        <>
          {/* KPI Grid */}
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Visitors" value={data.overview.totalVisitors.toLocaleString()} icon={Users} color="amber" />
            <StatCard label="Active Right Now" value={data.overview.activeUsers} sub="Last 5 minutes" icon={Activity} color="green" />
            <StatCard label="Visitors Today" value={data.overview.visitorsToday.toLocaleString()} icon={Eye} color="blue" />
            <StatCard label="This Week" value={data.overview.visitorsThisWeek.toLocaleString()} icon={Globe} color="purple" />
            <StatCard label="New Visitors" value={data.overview.newVisitors.toLocaleString()} icon={TrendingUp} color="green" />
            <StatCard label="Returning Visitors" value={data.overview.returningVisitors.toLocaleString()} icon={TrendingDown} color="blue" />
            <StatCard label="Avg Session Duration" value={formatDuration(data.overview.avgSessionDuration)} icon={Clock} color="amber" />
            <StatCard label="Bounce Rate" value={`${data.overview.bounceRate.toFixed(1)}%`} sub="Single-page sessions" icon={MousePointerClick} color={data.overview.bounceRate > 60 ? 'red' : 'amber'} />
          </section>

          {/* Visitor Traffic Chart */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Daily Page Views</h3>
                <p className="text-sm text-text-secondary">Page view count per day over the selected period</p>
              </div>
              <span className="badge-amber">{data.visitorsChart.reduce((a, b) => a + b.count, 0).toLocaleString()} total views</span>
            </div>
            <MiniChart points={data.visitorsChart} />
          </section>

          {/* Top Pages */}
          <section className="grid gap-6 xl:grid-cols-3">
            {/* Most Viewed */}
            <div className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary">Most Viewed Pages</h3>
              <div className="space-y-2">
                {data.mostViewedPages.length === 0
                  ? <p className="text-sm text-text-secondary">No Data Available</p>
                  : data.mostViewedPages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-text-secondary" title={p.page}>{p.page || '/'}</span>
                      <span className="font-semibold text-text-primary shrink-0">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Landing Pages */}
            <div className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary">Top Landing Pages</h3>
              <div className="space-y-2">
                {data.topLandingPages.length === 0
                  ? <p className="text-sm text-text-secondary">No Data Available</p>
                  : data.topLandingPages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-text-secondary" title={p.page}>{p.page || '/'}</span>
                      <span className="font-semibold text-text-primary shrink-0">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Exit Pages */}
            <div className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary">Top Exit Pages</h3>
              <div className="space-y-2">
                {data.topExitPages.length === 0
                  ? <p className="text-sm text-text-secondary">No Data Available</p>
                  : data.topExitPages.map((p, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 text-sm">
                      <span className="truncate text-text-secondary" title={p.page}>{p.page || '/'}</span>
                      <span className="font-semibold text-text-primary shrink-0">{p.count.toLocaleString()}</span>
                    </div>
                  ))}
              </div>
            </div>
          </section>

          {/* User Flow */}
          <section className="card p-5">
            <h3 className="mb-4 font-bold text-text-primary">User Navigation Flow</h3>
            <p className="mb-3 text-sm text-text-secondary">Most common page transitions from real sessions</p>
            {data.userFlow.length === 0 ? (
              <p className="text-sm text-text-secondary">No Data Available</p>
            ) : (
              <div className="space-y-2">
                {data.userFlow.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm rounded-xl border border-surface-border p-3">
                    <span className="truncate text-text-secondary flex-1" title={f.source}>{f.source || '/'}</span>
                    <span className="text-amber-400 font-bold shrink-0">→</span>
                    <span className="truncate text-text-secondary flex-1" title={f.target}>{f.target || '/'}</span>
                    <span className="shrink-0 badge-amber">{f.value}×</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
