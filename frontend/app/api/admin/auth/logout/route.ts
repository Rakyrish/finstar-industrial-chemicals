import { NextResponse } from 'next/server'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'

const backendBaseUrl = process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST() {
  await fetch(`${backendBaseUrl}/auth/logout/`, {
    method: 'POST',
    cache: 'no-store',
  }).catch(() => null)

  const response = NextResponse.json({ success: true, message: 'Logged out' })

  response.cookies.set(ADMIN_ACCESS_COOKIE, '', { path: '/', maxAge: 0 })
  response.cookies.set(ADMIN_REFRESH_COOKIE, '', { path: '/', maxAge: 0 })

  return response
}
