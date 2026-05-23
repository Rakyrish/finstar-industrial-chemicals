import type { AdminChartPoint } from '@/types/admin'
import { cn } from '@/utils'

function maxValue(points: AdminChartPoint[]) {
  return Math.max(...points.map((point) => point.value), 1)
}

export default function AdminChartCard({
  title,
  subtitle,
  points,
  variant = 'bar',
}: {
  title: string
  subtitle?: string
  points: AdminChartPoint[]
  variant?: 'bar' | 'line' | 'donut'
}) {
  const max = maxValue(points)

  return (
    <section className="card p-5">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
        <span className="badge-muted uppercase tracking-[0.25em]">{variant}</span>
      </div>

      {variant === 'bar' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {points.map((point) => (
            <div key={point.label} className="space-y-2">
              <div className="flex h-40 items-end rounded-2xl bg-surface/60 p-3">
                <div className="w-full rounded-2xl bg-gradient-to-t from-amber-500 to-brand-500" style={{ height: `${Math.max((point.value / max) * 100, 10)}%` }} />
              </div>
              <div className="text-sm">
                <p className="font-semibold text-text-primary">{point.label}</p>
                <p className="text-text-secondary">{point.value}</p>
              </div>
            </div>
          ))}
        </div>
      ) : variant === 'line' ? (
        <div className="relative h-56 overflow-hidden rounded-3xl border border-surface-border bg-surface/50 p-4">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <polyline
              fill="none"
              stroke="url(#adminLineGradient)"
              strokeWidth="3"
              points={points.map((point, index) => `${(index / Math.max(points.length - 1, 1)) * 100},${100 - (point.value / max) * 85 - 5}`).join(' ')}
            />
            <defs>
              <linearGradient id="adminLineGradient" x1="0%" x2="100%" y1="0%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#0a5cf5" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-3">
          {points.map((point, index) => (
            <div key={point.label} className="rounded-3xl border border-surface-border bg-surface/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-text-primary">{point.label}</p>
                <span className={cn('text-sm font-bold', index % 2 === 0 ? 'text-amber-400' : 'text-brand-300')}>{point.value}%</span>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-brand-500" style={{ width: `${point.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}