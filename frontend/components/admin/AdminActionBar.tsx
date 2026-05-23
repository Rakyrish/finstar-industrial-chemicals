import Link from 'next/link'

export default function AdminActionBar({ actions }: { actions: Array<{ href: string; label: string }> }) {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Link key={action.href} href={action.href} className="btn-secondary">
          {action.label}
        </Link>
      ))}
    </div>
  )
}