import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'

const backendBaseUrl = process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export async function POST() {
  const refreshToken = (await cookies()).get(ADMIN_REFRESH_COOKIE)?.value

  if (!refreshToken) {
    return NextResponse.json({ detail: 'Refresh token required.' }, { status: 401 })
  }

  const response = await fetch(`${backendBaseUrl}/auth/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: 'no-store',
  })

  if (!response.ok) {
    return NextResponse.json(await response.json().catch(() => ({ detail: 'Token refresh failed.' })), { status: response.status })
  }

  const data = await response.json()
  const nextResponse = NextResponse.json(data)

  nextResponse.cookies.set(ADMIN_ACCESS_COOKIE, data.access, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.access_expires_in,
  })

  nextResponse.cookies.set(ADMIN_REFRESH_COOKIE, data.refresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: data.refresh_expires_in,
  })

  return nextResponse
}
