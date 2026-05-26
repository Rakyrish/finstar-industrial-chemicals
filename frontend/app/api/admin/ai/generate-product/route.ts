import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value
  const body = await request.json().catch(() => ({}))
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(`${getBackendApiUrl()}/admin/ai/generate-product/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => ({ detail: 'Product generation failed.' }))
    return NextResponse.json(payload, { status: response.status })
  } catch {
    return NextResponse.json({ detail: 'OpenAI product generation service is unavailable.' }, { status: 503 })
  }
}
