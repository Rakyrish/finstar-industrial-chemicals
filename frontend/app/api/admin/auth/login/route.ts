import { NextResponse } from 'next/server'
import type { AdminLoginPayload, AdminAuthResponse } from '@/types/admin'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

const backendBaseUrl = getBackendApiUrl()

async function loginWithBackend(payload: AdminLoginPayload): Promise<AdminAuthResponse> {
  if (!backendBaseUrl) {
    throw new Error('Backend API URL is not configured.')
  }

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
  let result: AdminAuthResponse

  try {
    result = await loginWithBackend(payload)
  } catch (error: any) {
    const message = error?.message ?? 'Unable to authenticate with Django backend.'
    return NextResponse.json(
      { detail: message },
      { status: message.includes('not configured') ? 503 : 401 }
    )
  }

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
