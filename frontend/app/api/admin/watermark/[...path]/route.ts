import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

type RouteContext = {
  params: Promise<{ path: string[] }>
}

/**
 * Thin catch-all proxy for the watermark admin API. The nested batch/action
 * paths (e.g. /watermark/batches/{id}/pause/) don't fit the fixed
 * resource-name map in app/api/admin/[resource]/route.ts, so this forwards
 * everything under /api/admin/watermark/* 1:1 to
 * {backend}/admin/watermark/* on Django.
 */
async function forward(request: Request, context: RouteContext, method: string) {
  const { path } = await context.params
  const baseUrl = getBackendApiUrl()
  if (!baseUrl) {
    return NextResponse.json({ detail: 'Backend API URL is not configured.' }, { status: 501 })
  }

  const search = new URL(request.url).search
  const targetPath = `/admin/watermark/${path.join('/')}/`.replace(/\/+/g, '/').replace(/^\//, '/')

  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  let body: string | undefined
  if (method !== 'GET' && method !== 'DELETE') {
    headers['Content-Type'] = 'application/json'
    const payload = await request.json().catch(() => ({}))
    body = JSON.stringify(payload)
  }

  const response = await fetch(`${baseUrl}${targetPath}${search}`, {
    method,
    headers,
    body,
    cache: 'no-store',
  })

  const responseBody = await response.json().catch(() => ({ detail: `Backend request failed with ${response.status}.` }))
  return NextResponse.json(responseBody, { status: response.status })
}

export async function GET(request: Request, context: RouteContext) {
  return forward(request, context, 'GET')
}

export async function POST(request: Request, context: RouteContext) {
  return forward(request, context, 'POST')
}

export async function PATCH(request: Request, context: RouteContext) {
  return forward(request, context, 'PATCH')
}
