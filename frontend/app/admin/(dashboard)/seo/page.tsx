import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { adminSeoPages } from '@/lib/admin/mock-data'

export default function SeoPage() {
  return (
    <ResourceScreen
      resource="seo"
      title="SEO management"
      description="Control meta titles, descriptions, keywords, and structured data across important pages."
      fallback={{ results: adminSeoPages, count: adminSeoPages.length }}
      searchKeys={['page', 'metaTitle', 'metaDescription']}
      filters={[]}
      exportHref="#"
      emptyTitle="No SEO records"
      emptyDescription="Page-level metadata records will appear here as they are created."
      columns={[
        { key: 'page', label: 'Page' },
        { key: 'metaTitle', label: 'Meta title' },
        { key: 'metaDescription', label: 'Meta description' },
        { key: 'keywords', label: 'Keywords', render: (row) => <div className="flex flex-wrap gap-2">{row.keywords.map((keyword: string) => <span key={keyword} className="badge-muted">{keyword}</span>)}</div> },
        { key: 'updatedAt', label: 'Updated' },
      ]}
    />
  )
}