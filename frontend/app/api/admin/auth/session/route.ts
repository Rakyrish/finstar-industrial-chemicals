import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE, ADMIN_REFRESH_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

const backendBaseUrl = getBackendApiUrl()

async function fetchMe(accessToken: string) {
  if (!backendBaseUrl) {
    throw new Error('Backend API URL is not configured.')
  }

  return fetch(`${backendBaseUrl}/auth/me/`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })
}

async function refreshAccessToken(refreshToken: string) {
  if (!backendBaseUrl) {
    throw new Error('Backend API URL is not configured.')
  }

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
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value ?? request.headers.get('cookie')?.match(/finstar_admin_access=([^;]+)/)?.[1]
  const refreshToken = cookieStore.get(ADMIN_REFRESH_COOKIE)?.value ?? request.headers.get('cookie')?.match(/finstar_admin_refresh=([^;]+)/)?.[1]

  if (!accessToken) {
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 })
  }

  let response: Response
  try {
    response = await fetchMe(accessToken)
  } catch {
    return NextResponse.json({ authenticated: false, user: null, detail: 'Backend API URL is not configured.' }, { status: 503 })
  }

  if (response.status === 401 && refreshToken) {
    const refreshResponse = await refreshAccessToken(refreshToken).catch(() => null)
    if (!refreshResponse) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 503 })
    }
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
