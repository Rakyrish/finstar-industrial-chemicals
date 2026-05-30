import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

const API_BASE = getBackendApiUrl()

async function forward(method: string, pk: string, body?: any) {
  if (!API_BASE) {
    throw new Error('Backend API URL is not configured.')
  }

  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (body) headers['Content-Type'] = 'application/json'
  return fetch(`${API_BASE}/admin/products/${pk}/`, {
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

type RouteContext = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const res = await forward('GET', id)
  return NextResponse.json(await readBackendResponse(res), { status: res.status })
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const body = await request.json()
  try {
    const res = await forward('PATCH', id, body)
    return NextResponse.json(await readBackendResponse(res), { status: res.status })
  } catch (error: any) {
    return NextResponse.json(
      { detail: error?.message ?? 'Unable to reach the backend product service.' },
      { status: 503 }
    )
  }
}

export async function DELETE(_req: NextRequest, context: RouteContext) {
  const { id } = await context.params
  const res = await forward('DELETE', id)
  return NextResponse.json(await readBackendResponse(res), { status: res.status })
}
