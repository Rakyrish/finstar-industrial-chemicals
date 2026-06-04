const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://127.0.0.1:8000'

const INTERNAL_API_URL =
  process.env.API_BASE_URL ||      // ← reads the existing production env var
  process.env.INTERNAL_API_URL ||
  API_URL

export const frontendConfig = {
  apiUrl: API_URL,
  companyEmail: process.env.NEXT_PUBLIC_EMAIL || 'info@finstarindustrial.com',
  phoneNumber: process.env.NEXT_PUBLIC_PHONE_NUMBER || '+254 712 345 678',
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+254712345678',
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
