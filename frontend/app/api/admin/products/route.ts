import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { fetchAdminResource } from '@/lib/admin/server'
import { getBackendApiUrl } from '@/lib/config'

const API_BASE = getBackendApiUrl()

async function forwardToBackend(method: string, path: string, body?: any, token?: string) {
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

async function readBackendResponse(response: Response) {
  const contentType = response.headers.get('content-type') ?? ''
  const text = await response.text()

  if (contentType.includes('application/json')) {
    try {
      return text ? JSON.parse(text) : {}
    } catch {
      return { detail: text || 'Backend returned invalid JSON.' }
    }
  }

  return {
    detail: text || `Backend request failed with ${response.status}`,
  }
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
    const res = await forwardToBackend('POST', '/admin/products/', body, token)
    const data = await readBackendResponse(res)
    return NextResponse.json(data, { status: res.status })
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message ?? 'Unable to reach the backend product service.' },
      { status: 503 }
    )
  }
}
