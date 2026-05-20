import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/** Convert string to URL-safe slug */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate text at word boundary */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, text.lastIndexOf(' ', maxLength)) + '...'
}

/** Format date to readable string */
export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  })
}

/** Format date to ISO (for schema.org) */
export function formatDateISO(dateStr: string): string {
  return new Date(dateStr).toISOString()
}

/** Estimate reading time in minutes */
export function estimateReadingTime(content: string): number {
  const WORDS_PER_MINUTE = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / WORDS_PER_MINUTE)
}

/** Format number with locale */
export function formatNumber(n: number, locale = 'en-US'): string {
  return new Intl.NumberFormat(locale).format(n)
}

/** Build an absolute URL from a path */
export function absoluteUrl(path: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://finstarindustrial.com'
  return `${base.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

/** Get first N words of a string */
export function firstWords(str: string, n: number): string {
  return str.split(/\s+/).slice(0, n).join(' ')
}

/** Capitalise first letter */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/** Deep clone a value */
export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value))
}

/** Check if running on server */
export const isServer = typeof window === 'undefined'

/** Check if running on client */
export const isClient = !isServer

/** Generate unique ID */
export function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

/** Debounce a function */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

/** Strip HTML tags from string */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

/** Get image placeholder blur data URL */
export function getBlurDataUrl(w = 8, h = 6): string {
  return `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}"><rect width="${w}" height="${h}" fill="#0d1526"/></svg>`
  ).toString('base64')}`
}
