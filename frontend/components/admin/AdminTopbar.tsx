"use client"

import { useState } from 'react'
import { Bell, Menu, Moon, RefreshCcw, Search, SunMedium, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from './AdminAuthProvider'
import { cn } from '@/utils'

export default function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const { session, logout, refreshSession } = useAdminAuth()
  const [theme, setTheme] = useState<'dark' | 'light'>((typeof document !== 'undefined' && (document.documentElement.dataset.theme as 'dark' | 'light')) || 'dark')

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = nextTheme
    setTheme(nextTheme)
    document.cookie = `finstar_admin_theme=${nextTheme}; path=/; max-age=${60 * 60 * 24 * 365}`
  }

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/90 backdrop-blur-xl">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <button type="button" onClick={onMenuClick} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-surface-card text-text-primary xl:hidden">
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden min-w-0 flex-1 md:block">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-400">Industrial chemicals admin</p>
          <h1 className="truncate text-lg font-bold text-text-primary">Welcome back{session ? `, ${session.displayName}` : ''}</h1>
        </div>

        <label className="hidden flex-1 items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 lg:flex lg:max-w-xl">
          <Search className="h-4 w-4 text-text-muted" />
          <input aria-label="Search admin" placeholder="Search products, posts, inquiries..." className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
        </label>

        <div className="ml-auto flex items-center gap-2">
          <button type="button" onClick={() => refreshSession().then(() => router.refresh())} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-surface-card text-text-secondary transition hover:text-text-primary">
            <RefreshCcw className="h-4 w-4" />
          </button>
          <button type="button" onClick={toggleTheme} className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-surface-card text-text-secondary transition hover:text-text-primary">
            {theme === 'dark' ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button type="button" className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-surface-border bg-surface-card text-text-secondary transition hover:text-text-primary">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-amber-400" />
          </button>
          <button type="button" onClick={logout} className={cn('inline-flex items-center gap-2 rounded-2xl border border-surface-border bg-surface-card px-4 py-3 text-sm font-semibold text-text-primary transition hover:border-amber-500/40 hover:text-amber-300')}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      <div className="border-t border-surface-border px-4 py-3 md:hidden">
        <label className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface-card px-4 py-3">
          <Search className="h-4 w-4 text-text-muted" />
          <input aria-label="Search admin" placeholder="Search everything..." className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
        </label>
      </div>
    </header>
  )
}