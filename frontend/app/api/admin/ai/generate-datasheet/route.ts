import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ADMIN_ACCESS_COOKIE } from '@/lib/admin/auth'
import { getBackendApiUrl } from '@/lib/config'

export async function POST(request: NextRequest) {
  const backendUrl = getBackendApiUrl()
  if (!backendUrl) {
    return NextResponse.json({ detail: 'Backend API URL is not configured.' }, { status: 503 })
  }

  const token = (await cookies()).get(ADMIN_ACCESS_COOKIE)?.value
  const body = await request.json().catch(() => ({}))
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(`${backendUrl}/admin/ai/generate-datasheet/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    })
    const payload = await response.json().catch(() => ({ detail: 'Data sheet generation failed.' }))
    return NextResponse.json(payload, { status: response.status })
  } catch (error) {
    return NextResponse.json({ detail: 'OpenAI data sheet generation service is unavailable.' }, { status: 503 })
  }
}
