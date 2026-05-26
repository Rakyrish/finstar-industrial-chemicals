'use client'

import { useAdminResource } from '@/lib/admin/client'
import { Card } from '@/components/ui/card' // We might need to write standard HTML if Card isn't there, let's use standard HTML
import { MessageSquare, Users, BarChart3, Search, Activity } from 'lucide-react'
import type { AdminChatbotAnalytics } from '@/types/admin'

export default function ChatbotAnalyticsScreen() {
  const { data, loading, error } = useAdminResource<AdminChatbotAnalytics>('chatbot/analytics', {
    totalSessions: 0,
    totalMessages: 0,
    avgMessagesPerSession: 0,
    dailyTrend: [],
    topQuestions: [],
    mentionedProducts: [],
    conversations: [],
    count: 0,
    results: []
  })

  if (loading) return <div className="p-8 text-center text-text-muted animate-pulse">Loading analytics...</div>
  if (error) return <div className="p-8 text-center text-red-500">Failed to load analytics: {error}</div>
  if (!data) return null

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Sessions</p>
            <p className="text-3xl font-display font-bold text-text-primary mt-1">{data.totalSessions}</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Total Messages</p>
            <p className="text-3xl font-display font-bold text-text-primary mt-1">{data.totalMessages}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-text-muted uppercase tracking-wider">Avg Messages / Session</p>
            <p className="text-3xl font-display font-bold text-text-primary mt-1">{data.avgMessagesPerSession}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Questions */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Search className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-text-primary">Most Asked Questions</h3>
          </div>
          <div className="space-y-4">
            {data.topQuestions.length > 0 ? data.topQuestions.map((q, i) => (
              <div key={i} className="flex items-start justify-between gap-4 p-3 rounded-lg bg-surface-muted/50">
                <p className="text-sm text-text-secondary">{q.question}</p>
                <span className="badge-amber shrink-0">{q.count}</span>
              </div>
            )) : <p className="text-sm text-text-muted text-center py-4">No data available</p>}
          </div>
        </div>

        {/* Mentioned Products */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-text-primary">Most Mentioned Products</h3>
          </div>
          <div className="space-y-4">
            {data.mentionedProducts.length > 0 ? data.mentionedProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-surface-muted/50">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded bg-surface border border-surface-border" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{p.name}</p>
                  <p className="text-xs text-text-muted">Slug: {p.slug}</p>
                </div>
                <span className="badge-amber shrink-0">{p.count} mentions</span>
              </div>
            )) : <p className="text-sm text-text-muted text-center py-4">No data available</p>}
          </div>
        </div>
      </div>

      {/* Recent Conversations */}
      <div className="card overflow-hidden">
        <div className="p-6 border-b border-surface-border">
          <h3 className="text-lg font-bold text-text-primary">Recent Conversations</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-surface-muted text-text-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Question</th>
                <th className="px-6 py-4 font-medium">Messages</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-text-secondary">
              {data.conversations.length > 0 ? data.conversations.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">{c.customerName}</td>
                  <td className="px-6 py-4 truncate max-w-xs">{c.question}</td>
                  <td className="px-6 py-4">{c.messageCount}</td>
                  <td className="px-6 py-4">
                    <span className={c.status === 'resolved' ? 'badge-green' : 'badge-amber'}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{c.createdAt}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-text-muted">No recent conversations</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
