import { BadgeCheck, AlertTriangle, Clock3, CircleDashed } from 'lucide-react'
import type { AdminActivity } from '@/types/admin'

const iconMap = {
  info: Clock3,
  success: BadgeCheck,
  warning: AlertTriangle,
  danger: CircleDashed,
}

export default function AdminTimeline({ items }: { items: AdminActivity[] }) {
  return (
    <section className="card p-5">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-text-primary">Activity timeline</h3>
          <p className="text-sm text-text-secondary">Recent actions across the site</p>
        </div>
      </div>

      <ul className="space-y-4">
        {items.map((item) => {
          const Icon = iconMap[item.severity]

          return (
            <li key={item.id} className="flex gap-4 rounded-2xl border border-surface-border bg-surface/50 p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-surface-muted text-amber-400">
                <Icon className="h-4 w-4" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-text-primary">{item.title}</p>
                  <span className="text-xs text-text-muted">{item.timestamp}</span>
                </div>
                <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}