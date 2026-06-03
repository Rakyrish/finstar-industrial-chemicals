import type { AdminSession } from '@/types/admin'

export const ADMIN_ACCESS_COOKIE = 'finstar_admin_access'
export const ADMIN_REFRESH_COOKIE = 'finstar_admin_refresh'
export const ADMIN_THEME_COOKIE = 'finstar_admin_theme'

interface JwtPayload {
  token_type: string
  iat: number
  exp: number
  sub: string
  user_id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_superuser: boolean
  groups: string[]
  permissions: string[]
}

export function getAdminSessionFromToken(token: string | undefined): AdminSession | null {
  if (!token) return null

  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    // Base64url decode the payload part
    const payloadPart = parts[1]
    const base64 = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    
    // Edge-safe base64 decoding
    const rawPayload = typeof atob === 'function'
      ? atob(base64)
      : Buffer.from(base64, 'base64').toString('utf-8')
      
    const decodedPayload = JSON.parse(rawPayload) as JwtPayload

    // Validate expiration
    const now = Math.floor(Date.now() / 1000)
    if (decodedPayload.exp && decodedPayload.exp <= now) {
      return null
    }

    return {
      id: decodedPayload.user_id,
      username: decodedPayload.username,
      email: decodedPayload.email,
      firstName: decodedPayload.first_name || '',
      lastName: decodedPayload.last_name || '',
      displayName: `${decodedPayload.first_name || ''} ${decodedPayload.last_name || ''}`.trim() || decodedPayload.username,
      isStaff: decodedPayload.is_staff,
      isSuperuser: decodedPayload.is_superuser,
      groups: (decodedPayload.groups || []).map(name => ({ name })),
      permissions: (decodedPayload.permissions || []).map(codename => ({ codename, name: codename })),
      accessLevel: decodedPayload.is_superuser ? 'superuser' : 'staff',
      exp: decodedPayload.exp,
      accessToken: token
    }
  } catch (error) {
    console.error('Error decoding admin session token:', error)
    return null
  }
}

export function canAccessRoute(session: AdminSession, pathname: string): boolean {
  if (!session.isStaff && !session.isSuperuser) {
    return false
  }

  // Superuser has unlimited access
  if (session.isSuperuser) {
    return true
  }

  // Restrict standard staff from sensitive routes (e.g. user management and settings)
  const superuserOnlyPaths = ['/admin/users', '/admin/settings', '/api/admin/users', '/api/admin/settings']
  if (superuserOnlyPaths.some(path => pathname.startsWith(path))) {
    return false
  }

  return true
}
