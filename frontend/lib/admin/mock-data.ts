/**
 * Typed fallback stubs for admin dashboard pages.
 * These are used as `fallback` props while the real API data loads,
 * or when the backend is unavailable.
 * 
 * DO NOT add real data here — keep these as empty/minimal stubs.
 * The ResourceScreen and DashboardScreen components will replace this
 * with live data from the admin API once it is available.
 */

import type {
  AdminDashboardResponse,
  AdminProductRow,
  AdminBlogRow,
  AdminConversation,
  AdminInventoryAlert,
  AdminSeoRow,
  AdminUser,
  AdminQuoteRow,
  AdminAnalyticsSummary,
} from '@/types/admin'

// ── Products ──────────────────────────────────────────────────────────────────
export const adminProducts: AdminProductRow[] = []

// ── Blog Posts ────────────────────────────────────────────────────────────────
export const adminBlogPosts: AdminBlogRow[] = []

// ── Chatbot Conversations ─────────────────────────────────────────────────────
export const adminConversations: AdminConversation[] = []

// ── Inventory Alerts ──────────────────────────────────────────────────────────
export const adminInventoryAlerts: AdminInventoryAlert[] = []

// ── SEO Pages ─────────────────────────────────────────────────────────────────
export const adminSeoPages: AdminSeoRow[] = []

// ── Users ─────────────────────────────────────────────────────────────────────
export const adminUsers: AdminUser[] = []

// ── Quotes ────────────────────────────────────────────────────────────────────
export const adminQuotes: AdminQuoteRow[] = []

// ── Analytics ─────────────────────────────────────────────────────────────────
export const adminAnalytics: AdminAnalyticsSummary = {
  visitors: [],
  conversions: [],
  searchTerms: [],
  deviceMix: [],
}

// ── Full Dashboard Overview Stub ──────────────────────────────────────────────
export const adminOverview: AdminDashboardResponse = {
  metrics: [
    { label: 'Products', value: '—', change: '—', trend: 'flat' },
    { label: 'Inquiries', value: '—', change: '—', trend: 'flat' },
    { label: 'Quotes', value: '—', change: '—', trend: 'flat' },
    { label: 'Chat Sessions', value: '—', change: '—', trend: 'flat' },
  ],
  activity: [],
  conversations: [],
  inventoryAlerts: [],
  recentProducts: [],
  recentBlogPosts: [],
  analytics: adminAnalytics,
  quoteRequests: [],
  inquiries: [],
}
