import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { fetchAdminResource } from '@/lib/admin/server'
import { getBackendApiUrl } from '@/lib/config'

async function forward(method: string, body?: unknown) {
  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  return fetch(`${getBackendApiUrl()}/admin/categories/`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  })
}

export async function GET(request: NextRequest) {
  try {
    const response = await forward('GET')
    if (!response.ok) throw new Error(`Backend request failed with ${response.status}`)
    return NextResponse.json(await response.json(), { status: response.status })
  } catch {
    return NextResponse.json(await fetchAdminResource('categories', request.nextUrl.searchParams))
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  try {
    const response = await forward('POST', body)
    const payload = await response.json().catch(() => ({ detail: 'Category save failed.' }))
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json({
      id: Date.now(),
      name: body.name,
      slug: body.slug || String(body.name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: body.description ?? '',
      seoTitle: body.seoTitle ?? '',
      seoDescription: body.seoDescription ?? '',
      seoKeywords: body.seoKeywords ?? '',
    })
  }
}
