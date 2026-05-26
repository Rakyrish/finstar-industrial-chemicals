import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

// POST /api/admin/upload — handles both file uploads and URL uploads
export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value
  const contentType = request.headers.get('content-type') ?? ''

  const authHeader = token ? { Authorization: `Bearer ${token}` } : {}

  if (contentType.includes('multipart/form-data')) {
    // File upload — forward FormData directly to Django
    const formData = await request.formData()
    const res = await fetch(`${API_BASE}/admin/upload-image/`, {
      method: 'POST',
      headers: { Accept: 'application/json', ...authHeader },
      body: formData,
      cache: 'no-store',
    })
    return NextResponse.json(await res.json(), { status: res.status })
  }

  // URL upload — forward JSON body to Django
  const body = await request.json()
  const res = await fetch(`${API_BASE}/admin/upload-image-url/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...authHeader },
    body: JSON.stringify(body),
    cache: 'no-store',
  })
  return NextResponse.json(await res.json(), { status: res.status })
}
