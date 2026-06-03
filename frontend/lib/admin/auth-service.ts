import type { AdminLoginPayload, AdminSession } from '@/types/admin'
import { getAdminSessionFromToken, ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from './auth'

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
  private getStoredTokens() {
    if (typeof window === 'undefined') return { access: null, refresh: null }
    return {
      access: localStorage.getItem(ADMIN_ACCESS_COOKIE),
      refresh: localStorage.getItem(ADMIN_REFRESH_COOKIE),
    }
  }

  private setStoredTokens(access: string, refresh: string) {
    if (typeof window === 'undefined') return
    localStorage.setItem(ADMIN_ACCESS_COOKIE, access)
    localStorage.setItem(ADMIN_REFRESH_COOKIE, refresh)
  }

  private clearStoredTokens() {
    if (typeof window === 'undefined') return
    localStorage.removeItem(ADMIN_ACCESS_COOKIE)
    localStorage.removeItem(ADMIN_REFRESH_COOKIE)
  }

  async login(payload: AdminLoginPayload): Promise<LoginResponse> {
    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail ?? 'Login failed')
      }

      const response = await res.json() as { accessToken: string; refreshToken: string; session: AdminSession }

      if (response.accessToken) {
        this.setStoredTokens(response.accessToken, response.refreshToken)
      }

      return {
        session: response.session,
        access: response.accessToken,
        refresh: response.refreshToken,
      }
    } catch (error) {
      this.clearStoredTokens()
      throw error
    }
  }

  async me(): Promise<MeResponse> {
    try {
      const { access } = this.getStoredTokens()
      if (!access) throw new Error('No access token')

      const session = getAdminSessionFromToken(access)
      if (!session) throw new Error('Invalid token')

      return { user: session }
    } catch (error) {
      this.clearStoredTokens()
      throw error
    }
  }

  async refresh(): Promise<RefreshResponse> {
    try {
      const res = await fetch('/api/admin/auth/refresh', {
        method: 'POST',
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => null)
        throw new Error(errorData?.detail ?? 'Refresh failed')
      }

      const response = await res.json() as any

      if (response.access) {
        this.setStoredTokens(response.access, response.refresh)
      }

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
      this.clearStoredTokens()
      throw error
    }
  }

  async logout(): Promise<void> {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST',
      }).catch(() => {
        // Continue logout even if API call fails
      })
    } finally {
      this.clearStoredTokens()
    }
  }
}

export const adminAuthService = new AdminAuthService()
