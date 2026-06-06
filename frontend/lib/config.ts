function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, '')
}

const API_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  '/api/v1'
)

const INTERNAL_API_URL = trimTrailingSlash(
  process.env.API_BASE_URL ||
  process.env.INTERNAL_API_URL ||
  process.env.ADMIN_BACKEND_URL ||
  API_URL
)

export const frontendConfig = {
  apiUrl: API_URL,
  internalApiUrl: INTERNAL_API_URL,
  siteUrl: trimTrailingSlash(process.env.NEXT_PUBLIC_SITE_URL || ''),
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
  return isServer ? INTERNAL_API_URL : API_URL
}
