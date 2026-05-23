"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Boxes, Newspaper, MessagesSquare, FileText, Bot, Warehouse, ChartColumn, Search, Settings, ShieldUser, ChevronRight } from 'lucide-react'
import { adminNavItems, adminRoleLabels } from '@/lib/admin/navigation'
import { useAdminAuth } from './AdminAuthProvider'
import { cn } from '@/utils'

const iconMap = {
  'layout-dashboard': LayoutDashboard,
  boxes: Boxes,
  newspaper: Newspaper,
  'messages-square': MessagesSquare,
  'file-text': FileText,
  bot: Bot,
  warehouse: Warehouse,
  'chart-column': ChartColumn,
  search: Search,
  settings: Settings,
  'shield-user': ShieldUser,
}

export default function AdminSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { session } = useAdminAuth()
  const role = session?.accessLevel ?? 'staff'

  return (
    <aside className="flex h-full flex-col border-r border-surface-border bg-surface-card/95 px-4 py-5 backdrop-blur xl:px-5">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">Admin Panel</p>
          <h2 className="mt-1 text-lg font-bold text-text-primary">FINSTAR Control</h2>
        </div>
        <span className="badge-muted">{adminRoleLabels[role]}</span>
      </div>

      <nav className="space-y-1 overflow-y-auto pr-1">
        {adminNavItems.filter((item) => item.minAccess === 'staff' || role === 'superuser').map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap] ?? LayoutDashboard
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`)

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center justify-between rounded-2xl px-3 py-3 text-sm font-medium transition',
                active ? 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/20' : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
              )}
            >
              <span className="flex items-center gap-3">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              <ChevronRight className={cn('h-4 w-4 transition', active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')} />
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-surface-border bg-gradient-to-br from-brand-900/60 to-surface-card p-4 shadow-card">
        <p className="text-xs uppercase tracking-[0.24em] text-amber-300/80">System status</p>
        <p className="mt-2 text-sm font-semibold text-text-primary">All services monitored</p>
        <p className="mt-1 text-sm text-text-secondary">JWT sessions, role-based access, and API fallbacks are enabled.</p>
      </div>
    </aside>
  )
}