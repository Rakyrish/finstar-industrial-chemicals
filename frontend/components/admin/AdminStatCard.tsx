import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { AdminMetric } from '@/types/admin'

export default function AdminStatCard({ metric }: { metric: AdminMetric }) {
  const trendIcon = metric.trend === 'up' ? <ArrowUpRight className="h-4 w-4 text-emerald-400" /> : metric.trend === 'down' ? <ArrowDownRight className="h-4 w-4 text-red-400" /> : <Minus className="h-4 w-4 text-text-muted" />

  return (
    <article className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-text-secondary">{metric.label}</p>
          <h3 className="mt-2 text-3xl font-bold text-text-primary">{metric.value}</h3>
        </div>
        <span className="rounded-2xl bg-surface-muted p-3">{trendIcon}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-amber-400">{metric.change}</p>
      {metric.helperText ? <p className="mt-1 text-sm text-text-secondary">{metric.helperText}</p> : null}
    </article>
  )
}