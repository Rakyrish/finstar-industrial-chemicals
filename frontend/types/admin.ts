import type { BlogStatus } from './blog'
import type { ProductStatus } from './product'

export type AdminRole = 'staff' | 'superuser'
export type AdminTheme = 'dark' | 'light'

export interface AdminPermission {
  codename: string
  name: string
}

export interface AdminUserGroup {
  id?: number
  name: string
}

export interface AdminProfile {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  displayName: string
  isStaff: boolean
  isSuperuser: boolean
  groups: AdminUserGroup[]
  permissions: AdminPermission[]
  accessLevel: AdminRole
}

export interface AdminUser {
  id: number
  username: string
  displayName: string
  email: string
  role: AdminRole
  avatar?: string
  status: 'active' | 'invited' | 'suspended'
  lastLoginAt: string
}

export interface AdminSession extends AdminProfile {
  avatar?: string
  exp?: number
  accessToken?: string
  refreshToken?: string
}

export interface AdminMetric {
  label: string
  value: string
  change: string
  trend: 'up' | 'down' | 'flat'
  helperText?: string
  icon?: string
}

export interface AdminChartPoint {
  label: string
  value: number
}

export interface AdminActivity {
  id: number
  title: string
  description: string
  timestamp: string
  severity: 'info' | 'success' | 'warning' | 'danger'
}

export interface AdminConversation {
  id: number
  customerName: string
  customerEmail?: string
  channel: 'web' | 'whatsapp' | 'email'
  question: string
  status: 'open' | 'resolved' | 'escalated'
  createdAt: string
  messageCount: number
  messages?: AdminChatMessage[]
}

export interface AdminChatMessage {
  id: number
  sender: 'customer' | 'bot' | 'agent'
  senderName: string
  content: string
  timestamp: string
  isRead: boolean
}

export interface AdminInventoryAlert {
  id: number
  productName: string
  sku: string
  stock: number
  threshold: number
  supplier: string
  severity: 'warning' | 'critical'
  lastRestocked?: string
  warehouseLocation?: string
}

export interface AdminInventoryLog {
  id: number
  productName: string
  sku: string
  action: 'restock' | 'sale' | 'damaged' | 'adjustment'
  quantity: number
  previousStock: number
  newStock: number
  performedBy: string
  timestamp: string
  notes?: string
}

export interface AdminSupplier {
  id: number
  name: string
  contact: string
  email: string
  phone: string
  country: string
  city: string
  products: string[]
  status: 'active' | 'inactive'
  lastOrderDate: string
  leadTimeDays: number
}

export interface AdminProductRow {
  id: number
  name: string
  slug: string
  category: string
  status: ProductStatus
  featured: boolean
  inventory: number
  packaging: string
  updatedAt: string
}

export interface AdminBlogRow {
  id: number
  title: string
  slug: string
  author: string
  status: BlogStatus
  tags: string[]
  publishedAt?: string
  updatedAt: string
}

export interface AdminInquiryRow {
  id: number
  name: string
  email: string
  company?: string
  subject: string
  status: 'pending' | 'resolved' | 'escalated'
  createdAt: string
  message?: string
  phone?: string
  adminReply?: string
}

export interface AdminQuoteRow {
  id: number
  name: string
  company: string
  product: string
  quantity: string
  status: 'pending' | 'reviewed' | 'approved' | 'rejected'
  createdAt: string
  email?: string
  phone?: string
  notes?: string
  quotedPrice?: string
  adminNotes?: string
  followUpDate?: string
}

export interface AdminSeoRow {
  id: number
  page: string
  path?: string
  metaTitle: string
  metaDescription: string
  keywords: string[]
  ogTitle?: string
  ogDescription?: string
  updatedAt: string
}

export interface AdminAnalyticsSummary {
  visitors: AdminChartPoint[]
  conversions: AdminChartPoint[]
  searchTerms: AdminChartPoint[]
  deviceMix: AdminChartPoint[]
}

export interface AdminOverview {
  metrics: AdminMetric[]
  activity: AdminActivity[]
  conversations: AdminConversation[]
  inventoryAlerts: AdminInventoryAlert[]
  recentProducts: AdminProductRow[]
  recentBlogPosts: AdminBlogRow[]
  analytics: AdminAnalyticsSummary
}

export interface AdminDashboardResponse extends AdminOverview {
  quoteRequests: AdminQuoteRow[]
  inquiries: AdminInquiryRow[]
}

export interface AdminListResponse<T> {
  results: T[]
  count: number
}

export interface AdminActionResult {
  success: boolean
  message: string
}

export interface AdminLoginPayload {
  username: string
  password: string
}

export interface AdminAuthResponse {
  access: string
  refresh: string
  user: AdminProfile
  token_type: 'Bearer'
  access_expires_in: number
  refresh_expires_in: number
}

export interface AdminLoginResponse {
  accessToken: string
  refreshToken: string
  session: AdminSession
}

export interface AdminProductDraft {
  name: string
  slug: string
  shortDescription?: string
  description?: string
  longDescription?: string
  category?: string
  tags?: string[]
  
  // Structured content
  applications?: string[]
  benefits?: string[]
  features?: string[]
  industriesServed?: string[]
  faqs?: Array<{ q: string; a: string }>
  
  // Technical specs
  specifications?: Array<{ key: string; value: string }>
  casNumber?: string
  chemicalFormula?: string
  purity?: string
  appearance?: string
  density?: string
  
  // Logistics
  packagingType?: string
  pricing?: string
  minOrderQuantity?: number
  unitOfMeasure?: string
  
  // Media
  cloudinaryUrl?: string
  cloudinaryPublicId?: string
  imageAlt?: string
  imageTitle?: string
  imageCaption?: string
  
  // SEO
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string
  ogTitle?: string
  ogDescription?: string
  twitterDescription?: string
  schemaMarkup?: Record<string, unknown>
  
  // Engagement
  whatsappTemplate?: string
  quotationTemplate?: string
  ctaContent?: string
  
  // Flags
  status?: ProductStatus
  isFeatured?: boolean
  isNew?: boolean
  publishAt?: string
  
  // Compliance
  hazardClassification?: string
}

export interface AdminBlogDraft {
  title: string
  slug: string
  excerpt: string
  content: string
  author: string
  featuredImage?: string
  tags: string[]
  status: BlogStatus
  publishDate: string
  seoTitle: string
  seoDescription: string
}

export interface AdminReplyDraft {
  message: string
  status: 'pending' | 'resolved' | 'escalated'
}

export interface AdminSeoDraft {
  page: string
  metaTitle: string
  metaDescription: string
  keywords: string
  ogTitle: string
  ogDescription: string
  structuredData: string
}

// Chatbot Analytics
export interface AdminChatbotDailyTrend {
  label: string
  value: number
}

export interface AdminTopQuestion {
  question: string
  count: number
}

export interface AdminMentionedProduct {
  name: string
  slug: string
  count: number
  image?: string
}

export interface AdminChatbotConversation {
  id: number
  sessionId: string
  customerName: string
  channel: string
  question: string
  messageCount: number
  status: 'open' | 'resolved'
  createdAt: string
}

export interface AdminChatbotAnalytics {
  totalSessions: number
  totalMessages: number
  avgMessagesPerSession: number
  dailyTrend: AdminChatbotDailyTrend[]
  topQuestions: AdminTopQuestion[]
  mentionedProducts: AdminMentionedProduct[]
  conversations: AdminChatbotConversation[]
  count: number
  results: AdminChatbotConversation[]
}
