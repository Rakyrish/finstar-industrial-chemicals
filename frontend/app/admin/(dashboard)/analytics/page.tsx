'use client'

import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminChartCard from '@/components/admin/AdminChartCard'
import AdminDataTable from '@/components/admin/AdminDataTable'
import { useAdminResource } from '@/lib/admin/client'
import type { AdminAnalyticsSummary, AdminQuoteRow } from '@/types/admin'

type AnalyticsPayload = AdminAnalyticsSummary & {
  topViewedProducts?: Array<{ id: number; name: string; category: string; views: number }>
  topViewedBlogPosts?: Array<{ id: number; title: string; status: string; author: string; views: number }>
  quoteRequests?: AdminQuoteRow[]
}

const emptyAnalytics: AnalyticsPayload = {
  visitors: [],
  conversions: [],
  searchTerms: [],
  deviceMix: [],
  topViewedProducts: [],
  topViewedBlogPosts: [],
  quoteRequests: [],
}

export default function AnalyticsPage() {
  const { data: analytics, loading } = useAdminResource<AnalyticsPayload>('analytics', emptyAnalytics)

  if (loading) {
    return (
      <div className="space-y-6">
        <AdminPageHeader title="Analytics" description="Loading analytics data..." />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Analytics" description="Traffic, conversion, product, blog, and search reports for decision-making." />

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminChartCard title="Visitor traffic" subtitle="Weekly visitor trend" points={analytics?.visitors || []} variant="line" />
        <AdminChartCard title="Device mix" subtitle="Desktop vs mobile audience split" points={analytics?.deviceMix || []} variant="donut" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminChartCard title="Search analytics" subtitle="Most searched terms" points={analytics?.searchTerms || []} variant="bar" />
        <AdminChartCard title="Quote conversion" subtitle="Pipeline actions by conversion stage" points={analytics?.conversions || []} variant="donut" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Most viewed products</h3>
          <div className="mt-4 space-y-3">
            {(analytics?.topViewedProducts ?? []).map((product) => (
              <div key={product.id} className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{product.name}</p>
                    <p className="text-sm text-text-secondary">{product.category}</p>
                  </div>
                  <span className="badge-muted">{product.views} views</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Most viewed blog posts</h3>
          <div className="mt-4 space-y-3">
            {(analytics?.topViewedBlogPosts ?? []).map((post) => (
              <div key={post.id} className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                <p className="font-semibold text-text-primary">{post.title}</p>
                <p className="text-sm text-text-secondary">{post.status} · {post.author} · {post.views} views</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Conversion report</h3>
          <AdminDataTable
            rows={analytics?.quoteRequests ?? []}
            columns={[
              { key: 'company', label: 'Company' },
              { key: 'product', label: 'Product' },
              { key: 'status', label: 'Status' },
            ]}
          />
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Search-to-action insights</h3>
          <p className="mt-3 text-sm text-text-secondary">Track which search terms lead to product views, quote requests, and chatbot engagement.</p>
        </div>
      </section>
    </div>
  )
}
