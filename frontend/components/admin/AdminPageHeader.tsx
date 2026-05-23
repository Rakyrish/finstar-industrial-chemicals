import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string
  description?: string
  actions?: Array<{ href: string; label: string; variant?: 'primary' | 'secondary' }>
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Admin workspace</p>
        <h2 className="mt-2 text-3xl font-bold text-text-primary">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm text-text-secondary">{description}</p> : null}
      </div>

      {actions?.length ? (
        <div className="flex flex-wrap gap-3">
          {actions.map((action) => (
            <Link key={action.href} href={action.href} className={action.variant === 'secondary' ? 'btn-secondary' : 'btn-primary'}>
              {action.label}
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}