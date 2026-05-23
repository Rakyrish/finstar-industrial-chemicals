import { NextResponse } from 'next/server'
import { fetchAdminResource, getMockResource } from '@/lib/admin/server'

type RouteContext = {
  params: { resource: string }
}

export async function GET(request: Request, context: RouteContext) {
  const { resource } = context.params
  const searchParams = new URL(request.url).searchParams
  const data = await fetchAdminResource(resource, searchParams)
  return NextResponse.json(data)
}

export async function POST(request: Request, context: RouteContext) {
  const { resource } = context.params
  const payload = await request.json().catch(() => ({}))
  return NextResponse.json({
    success: true,
    message: `${resource} saved successfully`,
    payload,
    defaults: getMockResource(resource),
  })
}

export async function PUT(request: Request, context: RouteContext) {
  return POST(request, context)
}

export async function PATCH(request: Request, context: RouteContext) {
  return POST(request, context)
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { resource } = context.params
  return NextResponse.json({ success: true, message: `${resource} deleted successfully` })
}
