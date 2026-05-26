import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

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

// GET /api/admin/products  → list
// POST /api/admin/products → create
export async function GET(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value
  const status = request.nextUrl.searchParams.get('status')
  const path = `/admin/products/${status ? `?status=${status}` : ''}`
  const res = await forwardToBackend('GET', path, undefined, token)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value
  const body = await request.json()
  const res = await forwardToBackend('POST', '/admin/products/', body, token)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
