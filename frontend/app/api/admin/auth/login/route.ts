import { NextResponse } from 'next/server'
import type { AdminLoginPayload, AdminAuthResponse } from '@/types/admin'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'

const backendBaseUrl = process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function loginWithBackend(payload: AdminLoginPayload): Promise<AdminAuthResponse> {
  const response = await fetch(`${backendBaseUrl}/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  if (!response.ok) {
    const detail = await response.json().catch(() => null)
    throw new Error(detail?.detail ?? detail?.non_field_errors?.[0] ?? 'Unable to authenticate with Django backend.')
  }

  return (await response.json()) as AdminAuthResponse
}

export async function POST(request: Request) {
  const payload = (await request.json()) as AdminLoginPayload
  const result = await loginWithBackend(payload)
  const response = NextResponse.json({
    accessToken: result.access,
    refreshToken: result.refresh,
    session: {
      ...result.user,
      accessToken: result.access,
      refreshToken: result.refresh,
      exp: Math.floor(Date.now() / 1000) + result.access_expires_in,
    },
  })

  response.cookies.set(ADMIN_ACCESS_COOKIE, result.access, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: result.access_expires_in,
  })

  response.cookies.set(ADMIN_REFRESH_COOKIE, result.refresh, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: result.refresh_expires_in,
  })

  return response
}
