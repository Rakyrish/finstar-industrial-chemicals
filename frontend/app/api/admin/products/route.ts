import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { fetchAdminResource } from '@/lib/admin/server'
import { getBackendApiUrl } from '@/lib/config'

const API_BASE = getBackendApiUrl()

async function forwardToBackend(method: string, path: string, body?: any, token?: string) {
  if (!API_BASE) {
    throw new Error('Backend API URL is not configured.')
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  return fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
}

async function readBackendResponse(response: Response, path: string) {
  const contentType = response.headers.get('content-type') ?? ''
  const text = await response.text()

  if (contentType.includes('application/json')) {
    try {
      const payload = text ? JSON.parse(text) : {}
      if (!response.ok) {
        console.error('Admin products backend error', {
          status: response.status,
          path,
          payload,
        })
      }
      return payload
    } catch {
      const payload = { detail: text || 'Backend returned invalid JSON.' }
      console.error('Admin products backend JSON parse error', {
        status: response.status,
        path,
        payload,
      })
      return payload
    }
  }

  const payload = {
    detail: text || `Backend request failed with ${response.status}`,
  }
  if (!response.ok) {
    console.error('Admin products backend non-JSON error', {
      status: response.status,
      path,
      detail: payload.detail.slice(0, 1000),
    })
  }
  return payload
}

// GET /api/admin/products  → list
// POST /api/admin/products → create
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value
  const status = request.nextUrl.searchParams.get('status')
  const path = `/admin/products/${status ? `?status=${status}` : ''}`
  try {
    const res = await forwardToBackend('GET', path, undefined, token)
    if (!res.ok) throw new Error(`Backend request failed with ${res.status}`)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    const data = await fetchAdminResource('products', request.nextUrl.searchParams)
    return NextResponse.json(data)
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value
  const body = await request.json()
  try {
    const backendPath = '/admin/products/'
    const res = await forwardToBackend('POST', backendPath, body, token)
    const data = await readBackendResponse(res, backendPath)
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message ?? 'Unable to reach the backend product service.' },
      { status: 503 }
    )
  }
}
