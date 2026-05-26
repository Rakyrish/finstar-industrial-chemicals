'use client'

import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminSeoRow, AdminListResponse } from '@/types/admin'
import { seoColumns } from './columns'

export function SeoResourceScreen({ fallback }: { fallback: AdminListResponse<AdminSeoRow> }) {
  return (
    <ResourceScreen
      resource="seo"
      title="SEO management"
      description="Control meta titles, descriptions, keywords, and structured data across important pages."
      fallback={fallback}
      searchKeys={['page', 'metaTitle', 'metaDescription']}
      filters={[]}
      exportHref="#"
      emptyTitle="No SEO records"
      emptyDescription="Page-level metadata records will appear here as they are created."
      columns={seoColumns}
    />
  )
}
