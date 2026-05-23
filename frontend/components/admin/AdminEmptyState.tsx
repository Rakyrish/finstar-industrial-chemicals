import Link from 'next/link'
import { Plus } from 'lucide-react'

export default function AdminEmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref?: string
  actionLabel?: string
}) {
  return (
    <div className="card flex flex-col items-center justify-center rounded-3xl px-6 py-16 text-center">
      <h3 className="text-xl font-bold text-text-primary">{title}</h3>
      <p className="mt-3 max-w-xl text-sm text-text-secondary">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  )
}