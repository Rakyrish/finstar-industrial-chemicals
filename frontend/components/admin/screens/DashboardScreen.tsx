"use client"

import Link from 'next/link'
import { Plus, ArrowRight, Bot, AlertTriangle, PackageSearch, PencilLine } from 'lucide-react'
import { adminQuickActions } from '@/lib/admin/navigation'
import { adminOverview } from '@/lib/admin/mock-data'
import { useAdminResource } from '@/lib/admin/client'
import AdminStatCard from '../AdminStatCard'
import AdminChartCard from '../AdminChartCard'
import AdminTimeline from '../AdminTimeline'
import AdminDataTable from '../AdminDataTable'
import AdminPageHeader from '../AdminPageHeader'
import type { AdminDashboardResponse } from '@/types/admin'

export default function DashboardScreen({ fallback }: { fallback: AdminDashboardResponse }) {
  const { data } = useAdminResource<AdminDashboardResponse>('overview', fallback ?? adminOverview)
  const overview = data ?? fallback ?? adminOverview

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard overview"
        description="Monitor products, content, inquiries, quote requests, chatbot activity, inventory, and SEO health from one secure workspace."
        actions={[
          { href: '/admin/products/new', label: 'New Product' },
          { href: '/admin/blog/new', label: 'New Blog Post', variant: 'secondary' },
        ]}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overview.metrics.map((metric) => (
          <AdminStatCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <AdminChartCard title="Website traffic" subtitle="Visitors over the last 7 days" points={overview.analytics.visitors} variant="line" />
        <AdminChartCard title="Conversion mix" subtitle="Lead distribution across channels" points={overview.analytics.conversions} variant="donut" />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <AdminTimeline items={overview.activity} />

        <div className="space-y-6">
          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Quick actions</h3>
                <p className="text-sm text-text-secondary">Common admin tasks</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {adminQuickActions.map((action) => (
                <Link key={action.href} href={action.href} className="group rounded-2xl border border-surface-border bg-surface/50 p-4 transition hover:border-amber-500/40 hover:bg-surface-muted">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-text-primary">{action.label}</p>
                      <p className="mt-1 text-sm text-text-secondary">{action.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-amber-400 transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <h3 className="text-lg font-bold text-text-primary">Operational alerts</h3>
            <div className="mt-4 space-y-3">
              {overview.inventoryAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 rounded-2xl border border-surface-border bg-surface/50 p-4">
                  <span className="rounded-2xl bg-amber-500/10 p-3 text-amber-400">
                    {alert.severity === 'critical' ? <AlertTriangle className="h-4 w-4" /> : <PackageSearch className="h-4 w-4" />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-text-primary">{alert.productName}</p>
                      <span className={alert.severity === 'critical' ? 'badge-red' : 'badge-amber'}>{alert.stock} in stock</span>
                    </div>
                    <p className="mt-1 text-sm text-text-secondary">SKU {alert.sku} · Supplier {alert.supplier}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-text-primary">Latest chatbot conversations</h3>
                <p className="text-sm text-text-secondary">Track unresolved support questions</p>
              </div>
              <Link href="/admin/chatbot" className="text-sm font-semibold text-amber-400">View all</Link>
            </div>
            <div className="mt-4 space-y-3">
              {overview.conversations.map((conversation) => (
                <div key={conversation.id} className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-text-primary">{conversation.customerName}</p>
                    <span className="badge-muted">{conversation.channel}</span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{conversation.question}</p>
                  <p className="mt-3 text-xs text-text-muted">{conversation.messageCount} messages · {conversation.status}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Recent product additions</h3>
              <p className="text-sm text-text-secondary">Newest catalog entries</p>
            </div>
            <Link href="/admin/products" className="text-sm font-semibold text-amber-400">Manage</Link>
          </div>
          <AdminDataTable
            rows={overview.recentProducts}
            columns={[
              { key: 'name', label: 'Product', render: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs text-text-muted">{row.slug}</p></div> },
              { key: 'category', label: 'Category' },
              { key: 'inventory', label: 'Stock' },
              { key: 'updatedAt', label: 'Updated' },
            ]}
          />
        </section>

        <section className="card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-text-primary">Recent blog posts</h3>
              <p className="text-sm text-text-secondary">Content pipeline health</p>
            </div>
            <Link href="/admin/blog" className="text-sm font-semibold text-amber-400">Manage</Link>
          </div>
          <div className="space-y-3">
            {overview.recentBlogPosts.map((post) => (
              <div key={post.id} className="rounded-2xl border border-surface-border bg-surface/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-text-primary">{post.title}</p>
                    <p className="mt-1 text-sm text-text-secondary">By {post.author}</p>
                  </div>
                  <span className={post.status === 'published' ? 'badge-green' : 'badge-muted'}>{post.status}</span>
                </div>
                <p className="mt-3 text-xs text-text-muted">Updated {post.updatedAt}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}