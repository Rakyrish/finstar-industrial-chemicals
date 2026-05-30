import { NextResponse } from 'next/server'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

const backendBaseUrl = getBackendApiUrl()

export async function POST() {
  if (backendBaseUrl) {
    await fetch(`${backendBaseUrl}/auth/logout/`, {
      method: 'POST',
      cache: 'no-store',
    }).catch(() => null)
  }

  const response = NextResponse.json({ success: true, message: 'Logged out' })

  response.cookies.set(ADMIN_ACCESS_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(ADMIN_REFRESH_COOKIE, '', { path: '/', maxAge: 0 })

  return response
}
