function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '')
}

function normalizeApiUrl(value: string) {
  const trimmed = trimTrailingSlash(value)
  if (!trimmed) return '/api/v1'
  if (trimmed === '/api/v1' || trimmed.endsWith('/api/v1')) return trimmed
  if (trimmed === '/api' || trimmed.endsWith('/api')) return `${trimmed}/v1`
  if (/^https?:\/\/[^/]+$/i.test(trimmed)) return `${trimmed}/api/v1`
  return trimmed
}

const API_URL = normalizeApiUrl(
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  '/api/v1'
)

const INTERNAL_API_URL = normalizeApiUrl(
  process.env.API_BASE_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.ADMIN_BACKEND_URL ||
  API_URL
)

const SERVER_API_URL =
  typeof window === 'undefined' && INTERNAL_API_URL.startsWith('/')
    ? normalizeApiUrl(process.env.DJANGO_API_URL || 'http://127.0.0.1:8000')
    : INTERNAL_API_URL

export const frontendConfig = {
  apiUrl: API_URL,
  internalApiUrl: INTERNAL_API_URL,
  siteUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || ''),
  companyEmail: process.env.NEXT_PUBLIC_COMPANY_EMAIL || process.env.NEXT_PUBLIC_EMAIL || '',
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER || '',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '',
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
}

export const getWhatsAppUrl = (message?: string) => {
  const number = frontendConfig.whatsappNumber.replace(/[^0-9]/g, '')
  const text = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${text}`
}

export const getBackendApiUrl = () => {
  const isServer = typeof window === 'undefined'
  return isServer ? SERVER_API_URL : API_URL
}
