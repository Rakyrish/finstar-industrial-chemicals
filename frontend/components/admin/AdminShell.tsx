"use client"

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminTopbar from './AdminTopbar'
import { useAdminAuth } from './AdminAuthProvider'

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { isLoading } = useAdminAuth()

  return (
    <div className="min-h-screen bg-surface text-text-primary xl:grid xl:grid-cols-[300px_1fr]">
      <div className={`fixed inset-0 z-40 bg-slate-950/70 transition xl:hidden ${menuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`} onClick={() => setMenuOpen(false)} />
      <div className={`fixed inset-y-0 left-0 z-50 w-[300px] transform transition xl:static xl:translate-x-0 ${menuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'}`}>
        <AdminSidebar onNavigate={() => setMenuOpen(false)} />
      </div>

      <div className="flex min-h-screen flex-col">
        <AdminTopbar onMenuClick={() => setMenuOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 xl:px-10">{isLoading ? <div className="card h-96 animate-pulse" /> : children}</main>
      </div>
    </div>
  )
}