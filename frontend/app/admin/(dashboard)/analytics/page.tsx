import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminChartCard from '@/components/admin/AdminChartCard'
import AdminDataTable from '@/components/admin/AdminDataTable'
import { adminAnalytics, adminProducts, adminBlogPosts, adminQuotes } from '@/lib/admin/mock-data'

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Analytics" description="Traffic, conversion, product, blog, and search reports for decision-making." />

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminChartCard title="Visitor traffic" subtitle="Weekly visitor trend" points={adminAnalytics.visitors} variant="line" />
        <AdminChartCard title="Device mix" subtitle="Desktop vs mobile audience split" points={adminAnalytics.deviceMix} variant="donut" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminChartCard title="Search analytics" subtitle="Most searched terms" points={adminAnalytics.searchTerms} variant="bar" />
        <AdminChartCard title="Quote conversion" subtitle="Pipeline actions by conversion stage" points={adminAnalytics.conversions} variant="donut" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Most viewed products</h3>
          <div className="mt-4 space-y-3">
            {adminProducts.map((product) => (
              <div key={product.id} className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{product.name}</p>
                    <p className="text-sm text-text-secondary">{product.category}</p>
                  </div>
                  <span className="badge-muted">{product.inventory} stock</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Most viewed blog posts</h3>
          <div className="mt-4 space-y-3">
            {adminBlogPosts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                <p className="font-semibold text-text-primary">{post.title}</p>
                <p className="text-sm text-text-secondary">{post.status} · {post.author}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h3 className="text-lg font-bold text-text-primary">Conversion report</h3>
          <AdminDataTable
            rows={adminQuotes}
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