'use client'

import { useState } from 'react'
import {
  TrendingUp, DollarSign, Users, Package,
  Download, RefreshCw, Search, BarChart3
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring } from '@/lib/monitoring/client'
import { frontendConfig } from '@/lib/config'

interface RevenueTrend { label: string; revenue: number; hasData?: boolean }
interface PipelineItem { status: string; count: number; value: number | null }
interface LeadsStats {
  totalLeads: number
  convertedLeads: number
  conversionRate: number | null
  sources: Array<{ source: string; count: number }>
}
interface WarehouseVal { warehouse: string; value: number | null }
interface BiData {
  revenueTrends: RevenueTrend[]
  totalRevenue: number | null
  hasRevenueData: boolean
  quotePipeline: PipelineItem[]
  leadsStats: LeadsStats
  inventoryValuation: { totalValue: number | null; hasValueData: boolean; warehouses: WarehouseVal[] }
  searchTrends: Array<{ query: string; count: number }>
}

const PIPELINE_STATUS_COLORS: Record<string, string> = {
  pending: 'text-amber-400',
  drafted: 'text-blue-400',
  sent: 'text-emerald-400',
  rejected: 'text-red-400',
}

function RevenueChart({ data }: { data: RevenueTrend[] }) {
  if (!data?.length || !data.some(d => d.hasData)) return (
    <div className="h-40 flex items-center justify-center text-text-secondary text-sm">
      No revenue data yet — create and price quote requests to see trends.
    </div>
  )
  const max = Math.max(...data.map(d => d.revenue), 1)
  return (
    <div className="flex items-end gap-1.5 h-40">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full bg-amber-500/70 rounded-t hover:bg-amber-400 transition-all cursor-default"
            style={{ height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue > 0 ? 4 : 0 }}
            title={`${d.label}: $${d.revenue.toLocaleString()}`}
          />
          {data.length <= 14 && (
            <span className="text-[9px] text-text-secondary truncate w-full text-center">{d.label}</span>
          )}
        </div>
      ))}
    </div>
  )
}

export default function BusinessIntelligencePage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const { data, loading, error, refetch } = useMonitoring<BiData>('bi', { period })

  const BACKEND = frontendConfig.apiUrl

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Business Intelligence"
        description="Revenue trends, quote pipeline, CRM conversion rates, inventory valuation, and search trends — all from real transactional data."
        actions={[
          {
            href: `${BACKEND}/monitoring/bi/export/?format=csv`,
            label: 'Export CSV',
            variant: 'secondary',
          },
        ]}
      />

      {/* Period Toggle */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['daily', 'weekly', 'monthly'] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition ${period === p ? 'bg-amber-500 text-white' : 'border border-surface-border text-text-secondary hover:bg-surface-muted'}`}
          >
            {p}
          </button>
        ))}
        <button onClick={refetch} className="ml-auto flex items-center gap-1.5 text-sm text-text-secondary hover:text-amber-400 transition">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => <div key={i} className="card h-32 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="card p-6 text-center text-red-400">{error}</div>
      ) : data ? (
        <>
          {/* KPIs */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="card p-5 flex items-center gap-4">
              <span className="rounded-2xl bg-amber-500/10 p-3 text-amber-400"><DollarSign className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-text-secondary">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-amber-400">
                  {data.totalRevenue != null ? `$${data.totalRevenue.toLocaleString()}` : 'No Data'}
                </p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <span className="rounded-2xl bg-blue-500/10 p-3 text-blue-400"><Users className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-text-secondary">Total Leads</p>
                <p className="text-2xl font-bold text-text-primary">{data.leadsStats.totalLeads.toLocaleString()}</p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <span className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><TrendingUp className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-text-secondary">Conversion Rate</p>
                <p className="text-2xl font-bold text-text-primary">
                  {data.leadsStats.conversionRate != null ? `${data.leadsStats.conversionRate.toFixed(1)}%` : 'No Data'}
                </p>
              </div>
            </div>
            <div className="card p-5 flex items-center gap-4">
              <span className="rounded-2xl bg-purple-500/10 p-3 text-purple-400"><Package className="h-5 w-5" /></span>
              <div>
                <p className="text-sm text-text-secondary">Inventory Value</p>
                <p className="text-2xl font-bold text-text-primary">
                  {data.inventoryValuation.totalValue != null
                    ? `$${data.inventoryValuation.totalValue.toLocaleString()}`
                    : 'No Data'}
                </p>
              </div>
            </div>
          </div>

          {/* Revenue Chart */}
          <section className="card p-6">
            <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Revenue Trend ({period})</h3>
                <p className="text-sm text-text-secondary">Quoted deal value from closed / sent quote requests</p>
              </div>
              <BarChart3 className="h-5 w-5 text-text-secondary" />
            </div>
            <RevenueChart data={data.revenueTrends} />
          </section>

          {/* Quote Pipeline + Lead Sources */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Pipeline */}
            <section className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary">Quote Pipeline</h3>
              {data.quotePipeline.length === 0 ? (
                <p className="text-sm text-text-secondary">No quote data available.</p>
              ) : (
                <div className="space-y-3">
                  {data.quotePipeline.map(p => (
                    <div key={p.status} className="flex items-center justify-between gap-4 rounded-xl border border-surface-border p-3">
                      <div>
                        <p className={`font-semibold capitalize ${PIPELINE_STATUS_COLORS[p.status] ?? 'text-text-primary'}`}>
                          {p.status}
                        </p>
                        <p className="text-xs text-text-secondary">{p.count} quotes</p>
                      </div>
                      <p className="font-bold text-text-primary">
                        {p.value != null ? `$${p.value.toLocaleString()}` : 'No Data'}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Lead Sources */}
            <section className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary">Leads by Source</h3>
              {data.leadsStats.sources.length === 0 ? (
                <p className="text-sm text-text-secondary">No lead data available.</p>
              ) : (
                <div className="space-y-3">
                  {data.leadsStats.sources.map(s => {
                    const total = data.leadsStats.totalLeads
                    const pct = total > 0 ? (s.count / total) * 100 : 0
                    return (
                      <div key={s.source} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-text-secondary capitalize">{s.source.replace('_', ' ')}</span>
                          <span className="font-semibold text-text-primary">{s.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          </div>

          {/* Inventory + Search Trends */}
          <div className="grid gap-6 xl:grid-cols-2">
            {/* Warehouse Breakdown */}
            <section className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary">Inventory Value by Warehouse</h3>
              {data.inventoryValuation.warehouses.length === 0 || !data.inventoryValuation.hasValueData ? (
                <p className="text-sm text-text-secondary">
                  No inventory valuation data — set cost prices on products to enable this metric.
                </p>
              ) : (
                <div className="space-y-3">
                  {data.inventoryValuation.warehouses.map(w => (
                    <div key={w.warehouse} className="flex items-center justify-between gap-3 rounded-xl border border-surface-border p-3">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-amber-400" />
                        <span className="text-sm text-text-primary">{w.warehouse}</span>
                      </div>
                      <span className="font-bold text-text-primary">
                        {w.value != null ? `$${w.value.toLocaleString()}` : 'No Data'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Top Search Queries */}
            <section className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary flex items-center gap-2">
                <Search className="h-4 w-4 text-amber-400" /> Top Search Queries
              </h3>
              {data.searchTrends.length === 0 ? (
                <p className="text-sm text-text-secondary">No search data recorded yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.searchTrends.map((s, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-surface-border p-3 text-sm">
                      <span className="text-text-secondary flex-1 truncate">{s.query}</span>
                      <span className="badge-amber shrink-0">{s.count}×</span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* CSV Download */}
          <div className="card p-5 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h3 className="font-bold text-text-primary">Export Report</h3>
              <p className="text-sm text-text-secondary mt-0.5">Download full quote & revenue data as CSV</p>
            </div>
            <a
              href={`${BACKEND}/monitoring/bi/export/?format=csv`}
              className="btn-primary flex items-center gap-2"
              download
            >
              <Download className="h-4 w-4" /> Download CSV
            </a>
          </div>
        </>
      ) : null}
    </div>
  )
}
