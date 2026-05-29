import { NextResponse } from 'next/server'
import { fetchAdminResource } from '@/lib/admin/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

type RouteContext = {
  params: Promise<{ resource: string }>
}

const adminResourcePaths: Record<string, string> = {
  overview: '/admin/overview/',
  analytics: '/admin/analytics/',
  products: '/admin/products/',
  categories: '/admin/categories/',
  chatbot: '/admin/chatbot/',
  users: '/admin/users/',
  blog: '/admin/blog/',
  seo: '/admin/seo/',
  inquiries: '/inquiries/contact/',
  quotes: '/inquiries/quotes/',
  inventory: '/inventory/stocks/',
}

async function forwardResource(resource: string, method: string, payload?: unknown) {
  const baseUrl = getBackendApiUrl()
  const path = adminResourcePaths[resource]
  if (!baseUrl || !path) {
    return NextResponse.json({ detail: `No backend endpoint configured for ${resource}.` }, { status: 501 })
  }

  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value
  const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: payload ? JSON.stringify(payload) : undefined,
    cache: 'no-store',
  })
  const body = await response.json().catch(() => ({ detail: `Backend request failed with ${response.status}.` }))
  return NextResponse.json(body, { status: response.status })
}

export async function GET(request: Request, context: RouteContext) {
  const { resource } = await context.params
  const searchParams = new URL(request.url).searchParams
  const data = await fetchAdminResource(resource, searchParams)
  return NextResponse.json(data)
}

export async function POST(request: Request, context: RouteContext) {
  const { resource } = await context.params
  const payload = await request.json().catch(() => ({}))
  return forwardResource(resource, 'POST', payload)
}

export async function PUT(request: Request, context: RouteContext) {
  const { resource } = await context.params
  const payload = await request.json().catch(() => ({}))
  return forwardResource(resource, 'PUT', payload)
}

export async function PATCH(request: Request, context: RouteContext) {
  const { resource } = await context.params
  const payload = await request.json().catch(() => ({}))
  return forwardResource(resource, 'PATCH', payload)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { resource } = await context.params
  return forwardResource(resource, 'DELETE')
}
