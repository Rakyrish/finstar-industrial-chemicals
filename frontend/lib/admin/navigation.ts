/**
 * Admin navigation — quick action tiles shown on the dashboard.
 * Pulled out here so DashboardScreen stays lean.
 */

export interface AdminQuickAction {
  label: string
  description: string
  href: string
}

export const adminQuickActions: AdminQuickAction[] = [
  {
    label: 'Add product',
    description: 'Create a new chemical listing',
    href: '/admin/products/new',
  },
  {
    label: 'Write blog post',
    description: 'Draft a new article or guide',
    href: '/admin/blog/new',
  },
  {
    label: 'Review quotes',
    description: 'Manage pending quote requests',
    href: '/admin/quotes',
  },
  {
    label: 'View inquiries',
    description: 'Customer messages and contacts',
    href: '/admin/inquiries',
  },
  {
    label: 'Inventory status',
    description: 'Stock levels and low-stock alerts',
    href: '/admin/inventory',
  },
  {
    label: 'SEO management',
    description: 'Meta, schema, and page settings',
    href: '/admin/seo',
  },
]

export interface AdminNavItem {
  label: string
  href: string
  icon: string
  minAccess: 'staff' | 'superuser'
}

export const adminNavItems: AdminNavItem[] = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: 'layout-dashboard',
    minAccess: 'staff',
  },
  {
    label: 'Products',
    href: '/admin/products',
    icon: 'boxes',
    minAccess: 'staff',
  },
  {
    label: 'Inventory',
    href: '/admin/inventory',
    icon: 'warehouse',
    minAccess: 'staff',
  },
  {
    label: 'Quotes',
    href: '/admin/quotes',
    icon: 'file-text',
    minAccess: 'staff',
  },
  {
    label: 'Inquiries',
    href: '/admin/inquiries',
    icon: 'messages-square',
    minAccess: 'staff',
  },
  {
    label: 'Blog',
    href: '/admin/blog',
    icon: 'newspaper',
    minAccess: 'staff',
  },
  {
    label: 'Technical Docs',
    href: '/admin/technical-docs',
    icon: 'file-text',
    minAccess: 'staff',
  },
  {
    label: 'Chatbot',
    href: '/admin/chatbot',
    icon: 'bot',
    minAccess: 'staff',
  },
  {
    label: 'SEO',
    href: '/admin/seo',
    icon: 'search',
    minAccess: 'staff',
  },
  {
    label: 'Users',
    href: '/admin/users',
    icon: 'shield-user',
    minAccess: 'superuser',
  },
  {
    label: 'Analytics',
    href: '/admin/analytics',
    icon: 'chart-column',
    minAccess: 'staff',
  },
  // ── Monitoring Center ──────────────────────────────────────────────────
  {
    label: 'Operations Center',
    href: '/admin/monitoring',
    icon: 'activity',
    minAccess: 'superuser',
  },
  {
    label: 'Error Center',
    href: '/admin/errors',
    icon: 'bug',
    minAccess: 'superuser',
  },
  {
    label: 'API Health',
    href: '/admin/api-health',
    icon: 'cable',
    minAccess: 'superuser',
  },
  {
    label: 'AI Monitor',
    href: '/admin/ai-monitoring',
    icon: 'cpu',
    minAccess: 'superuser',
  },
  {
    label: 'Security',
    href: '/admin/security',
    icon: 'shield-alert',
    minAccess: 'superuser',
  },
  {
    label: 'Business Intel',
    href: '/admin/business-intelligence',
    icon: 'trending-up',
    minAccess: 'superuser',
  },
  {
    label: 'Site Auditor',
    href: '/admin/auditor',
    icon: 'scan-search',
    minAccess: 'superuser',
  },
]

export const adminRoleLabels: Record<string, string> = {
  staff: 'Staff',
  superuser: 'Superuser',
}
