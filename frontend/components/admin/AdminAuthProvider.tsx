"use client"

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { adminAuthService } from '@/lib/admin/auth-service'
import type { AdminLoginPayload, AdminSession } from '@/types/admin'

interface AdminAuthContextValue {
  session: AdminSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (payload: AdminLoginPayload) => Promise<AdminSession>
  refreshSession: () => Promise<AdminSession | null>
  logout: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }

  return context
}

export default function AdminAuthProvider({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession: AdminSession | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [session, setSession] = useState<AdminSession | null>(initialSession)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    const bootstrap = async () => {
      try {
        const profileResponse = await adminAuthService.me()
        if (!active) return
        setSession(profileResponse.user)
      } catch {
        try {
          const refreshed = await adminAuthService.refresh()
          if (!active) return
          setSession({
            ...refreshed.user,
            accessToken: refreshed.access,
            refreshToken: refreshed.refresh,
            exp: Math.floor(Date.now() / 1000) + refreshed.access_expires_in,
          })
        } catch {
          if (!active) return
          setSession(null)
        }
      } finally {
        if (active) setIsLoading(false)
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isLoading && !session && pathname.startsWith('/admin') && pathname !== '/admin/login' && pathname !== '/admin/unauthorized') {
      router.replace('/admin/login?next=' + encodeURIComponent(pathname))
    }

    if (!isLoading && session && pathname === '/admin/login') {
      router.replace('/admin')
    }
  }, [isLoading, pathname, router, session])

  const value = useMemo<AdminAuthContextValue>(() => ({
    session,
    isLoading,
    isAuthenticated: Boolean(session),
    login: async (payload) => {
      const response = await adminAuthService.login(payload)
      setSession(response.session)
      return response.session
    },
    refreshSession: async () => {
      try {
        const refreshed = await adminAuthService.refresh()
        const nextSession = {
          ...refreshed.user,
          accessToken: refreshed.access,
          refreshToken: refreshed.refresh,
          exp: Math.floor(Date.now() / 1000) + refreshed.access_expires_in,
        }
        setSession(nextSession)
        return nextSession
      } catch {
        setSession(null)
        return null
      }
    },
    logout: async () => {
      await adminAuthService.logout()
      setSession(null)
      router.replace('/admin/login')
      router.refresh()
    },
  }), [isLoading, router, session])

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}