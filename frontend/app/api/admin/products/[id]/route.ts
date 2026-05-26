import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

async function forward(method: string, pk: string, body?: any) {
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

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await forward('GET', params.id)
  return NextResponse.json(await res.json(), { status: res.status })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json()
  const res = await forward('PATCH', params.id, body)
  return NextResponse.json(await res.json(), { status: res.status })
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const res = await forward('DELETE', params.id)
  return NextResponse.json({ success: true }, { status: res.status })
}
