import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'

const backendBaseUrl = process.env.ADMIN_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function fetchMe(accessToken: string) {
  return fetch(`${backendBaseUrl}/auth/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })
}

async function refreshAccessToken(refreshToken: string) {
  return fetch(`${backendBaseUrl}/auth/refresh/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh: refreshToken }),
    cache: 'no-store',
  })
}

export async function GET(request: Request) {
  const accessToken = cookies().get(ADMIN_ACCESS_COOKIE)?.value ?? request.headers.get('cookie')?.match(/finstar_admin_access=([^;]+)/)?.[1]
  const refreshToken = cookies().get(ADMIN_REFRESH_COOKIE)?.value ?? request.headers.get('cookie')?.match(/finstar_admin_refresh=([^;]+)/)?.[1]

  if (!accessToken) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
  }

  let response = await fetchMe(accessToken)

  if (response.status === 401 && refreshToken) {
    const refreshResponse = await refreshAccessToken(refreshToken)
    if (refreshResponse.ok) {
      const refreshed = await refreshResponse.json()
      response = await fetchMe(refreshed.access)

      if (response.ok) {
        const payload = await response.json()
        const nextResponse = NextResponse.json(payload)
        nextResponse.cookies.set(ADMIN_ACCESS_COOKIE, refreshed.access, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: refreshed.access_expires_in,
        })
        nextResponse.cookies.set(ADMIN_REFRESH_COOKIE, refreshed.refresh, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: refreshed.refresh_expires_in,
        })
        return nextResponse
      }
    }
  }

  if (!response.ok) {
    return NextResponse.json({ authenticated: false, user: null }, { status: response.status })
  }

  return NextResponse.json(await response.json())
}
