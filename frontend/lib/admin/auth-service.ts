import type { AdminLoginPayload, AdminSession } from '@/types/admin'
import { getAdminSessionFromToken } from './auth'

interface LoginResponse {
  session: AdminSession
  access: string
  refresh: string
}

interface MeResponse {
  user: AdminSession
}

interface RefreshResponse {
  access: string
  refresh: string
  user: AdminSession
  access_expires_in: number
}

class AdminAuthService {
  async login(payload: AdminLoginPayload): Promise<LoginResponse> {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail ?? 'Login failed')
      }

      const response = await res.json() as { accessToken: string; refreshToken: string; session: AdminSession }

      if (!response.session) {
        throw new Error('Invalid response: missing session data')
      }

      return {
        session: response.session,
        access: response.accessToken,
        refresh: response.refreshToken,
      }
    } catch (error) {
      throw error
    }
  }

  async me(): Promise<MeResponse> {
    try {
      const res = await fetch('/api/admin/auth/session', {
        method: 'GET',
        credentials: 'same-origin',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail ?? 'No active admin session')
      }

      const response = await res.json() as { authenticated?: boolean; user: AdminSession | null }
      if (!response.user) {
        throw new Error('No active admin session')
      }

      return { user: response.user }
    } catch (error) {
      throw error
    }
  }

  async refresh(): Promise<RefreshResponse> {
    try {
      const res = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
        credentials: 'same-origin',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail ?? 'Refresh failed')
      }

      const response = await res.json() as any

      const session = getAdminSessionFromToken(response.access)
      if (!session) {
        throw new Error('Failed to decode session token')
      }

      return {
        access: response.access,
        refresh: response.refresh,
        user: session,
        access_expires_in: response.access_expires_in ?? 3600,
      }
    } catch (error) {
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
        credentials: 'same-origin',
      }).catch(() => {
        // Continue logout even if API call fails
      })
    } catch {}
  }
}

export const adminAuthService = new AdminAuthService()
