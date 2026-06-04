import { cookies } from 'next/headers'
import type { AdminSession, AdminDashboardResponse, AdminListResponse } from '@/types/admin'
import { getAdminSessionFromToken, ADMIN_ACCESS_COOKIE } from './auth'
import {
  adminOverview,
  adminProducts,
  adminBlogPosts,
  adminConversations,
  adminSeoPages,
  adminUsers,
  adminQuotes,
  adminAnalytics,
} from './mock-data'

/**
 * Get current admin session from cookies (server-side only)
 */
export async function getCurrentAdminSession(): Promise<AdminSession | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value

    if (!token) {
      return null
    }

    const session = getAdminSessionFromToken(token)
    return session
  } catch (error) {
    console.error('Error getting admin session:', error)
    return null
  }
}

/**
 * Fetch admin dashboard data from the server-side API (server-side only).
 * Falls back to mock data if the request fails or user is not authenticated.
 */
export async function fetchAdminDashboard(): Promise<AdminDashboardResponse> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value

    if (!token) {
      return adminOverview as AdminDashboardResponse
    }

    const apiUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000/api/v1'

    const response = await fetch(`${apiUrl}/admin/overview/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      return adminOverview as AdminDashboardResponse
    }

    const data = await response.json()
    return data as AdminDashboardResponse
  } catch (error) {
    console.error('Error fetching admin dashboard:', error)
    return adminOverview as AdminDashboardResponse
  }
}

/**
 * Get the stub/fallback mock data for any given admin resource
 */
export function getMockResource(resource: string): any {
  switch (resource) {
    case 'products':
      return { results: adminProducts, count: adminProducts.length }
    case 'blog':
      return { results: adminBlogPosts, count: adminBlogPosts.length }
    case 'chatbot':
      return { results: adminConversations, count: adminConversations.length }
    case 'seo':
      return { results: adminSeoPages, count: adminSeoPages.length }
    case 'users':
      return { results: adminUsers, count: adminUsers.length }
    case 'quotes':
      return { results: adminQuotes, count: adminQuotes.length }
    case 'analytics':
      return adminAnalytics
    case 'overview':
      return adminOverview
    default:
      return { results: [], count: 0 }
  }
}

/**
 * Fetch admin resource list from the server-side API (server-side only).
 */
export async function fetchAdminList<T>(resource: string): Promise<AdminListResponse<T>> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value

    if (!token) {
      return getMockResource(resource) as AdminListResponse<T>
    }

    const apiUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000/api/v1'

    const response = await fetch(`${apiUrl}/admin/${resource}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      return getMockResource(resource) as AdminListResponse<T>
    }

    const data = await response.json()
    if (Array.isArray(data)) {
      return { results: data, count: data.length }
    }
    if (data && typeof data === 'object' && Array.isArray(data.results)) {
      return data as AdminListResponse<T>
    }
    return getMockResource(resource) as AdminListResponse<T>
  } catch (error) {
    console.error(`Error fetching admin resource list ${resource}:`, error)
    return getMockResource(resource) as AdminListResponse<T>
  }
}

/**
 * Fetch a single admin resource by ID (server-side only).
 */
export async function fetchAdminDetail<T>(resource: string, id: string | number): Promise<T | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value

    if (!token) return null

    const apiUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000/api/v1'

    const response = await fetch(`${apiUrl}/admin/${resource}/${id}/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) return null
    return await response.json() as T
  } catch (error) {
    console.error(`Error fetching admin detail ${resource}/${id}:`, error)
    return null
  }
}

/**
 * Fetch a generic admin resource endpoint.
 */
export async function fetchAdminResource(resource: string, searchParams?: URLSearchParams): Promise<any> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(ADMIN_ACCESS_COOKIE)?.value

    if (!token) {
      return getMockResource(resource)
    }

    const apiUrl =
      process.env.API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:8000/api/v1'

    const query = searchParams ? `?${searchParams.toString()}` : ''
    const response = await fetch(`${apiUrl}/admin/${resource}/${query}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      cache: 'no-store',
    })

    if (!response.ok) {
      return getMockResource(resource)
    }

    return await response.json()
  } catch (error) {
    console.error(`Error fetching admin resource ${resource}:`, error)
    return getMockResource(resource)
  }
}

/**
 * Check if user has required permissions
 */
export function hasAdminPermission(
  session: AdminSession | null,
  requiredPermission: string
): boolean {
  if (!session) return false
  if (session.isSuperuser) return true
  return session.permissions.some((p) => p.codename === requiredPermission)
}

/**
 * Check if user has required role
 */
export function hasAdminRole(
  session: AdminSession | null,
  requiredRole: 'superuser' | 'staff'
): boolean {
  if (!session) return false
  if (requiredRole === 'superuser') return session.isSuperuser
  if (requiredRole === 'staff') return session.isStaff
  return false
}
