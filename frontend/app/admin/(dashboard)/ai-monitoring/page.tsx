'use client'

import { Cpu, Bot, MessageSquare, TrendingUp, AlertCircle, DollarSign, RefreshCw, Zap } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring } from '@/lib/monitoring/client'

interface AgentStats {
  agent: string
  name: string
  requests: number
  requestsToday: number
  tokens: number | null
  cost: number | null
  avgResponseTime: number | null
  failedRequests: number
}

interface ChatbotStats {
  sessionsCount: number
  csatAverage: number | null
  escalatedCount: number
  failedResponsesCount: number
}

interface AiData {
  agents: AgentStats[]
  chatbotStats: ChatbotStats
  topQuestions: Array<{ question: string; count: number }>
}

function AgentCard({ agent }: { agent: AgentStats }) {
  const failureRate = agent.requests > 0 ? (agent.failedRequests / agent.requests) * 100 : 0
  const healthColor = failureRate > 10 ? 'text-red-400' : failureRate > 5 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-2xl bg-purple-500/10 p-3 text-purple-400">
            <Cpu className="h-5 w-5" />
          </span>
          <div>
            <p className="font-semibold text-text-primary">{agent.name}</p>
            <p className="text-xs text-text-secondary">{agent.requests.toLocaleString()} total calls</p>
          </div>
        </div>
        <span className={`text-xs font-medium ${healthColor}`}>
          {failureRate.toFixed(1)}% failures
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-surface-muted p-3">
          <p className="text-xs text-text-secondary">Calls Today</p>
          <p className="text-lg font-bold text-text-primary">{agent.requestsToday}</p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3">
          <p className="text-xs text-text-secondary">Avg Response</p>
          <p className="text-lg font-bold text-text-primary">
            {agent.avgResponseTime != null ? `${agent.avgResponseTime.toFixed(1)}s` : 'No Data'}
          </p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3">
          <p className="text-xs text-text-secondary">Total Tokens</p>
          <p className="text-lg font-bold text-text-primary">
            {agent.tokens != null ? (agent.tokens > 1000 ? `${(agent.tokens / 1000).toFixed(1)}K` : agent.tokens) : 'No Data'}
          </p>
        </div>
        <div className="rounded-xl bg-surface-muted p-3">
          <p className="text-xs text-text-secondary">Estimated Cost</p>
          <p className="text-lg font-bold text-amber-400">
            {agent.cost != null ? `$${agent.cost.toFixed(4)}` : 'No Data'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function AiMonitoringPage() {
  const { data, loading, error, refetch } = useMonitoring<AiData>('ai-usage')

  const agents = data?.agents ?? []
  const chatbot = data?.chatbotStats
  const topQ = data?.topQuestions ?? []

  const totalCost = agents.reduce((sum, a) => sum + (a.cost ?? 0), 0)
  const totalTokens = agents.reduce((sum, a) => sum + (a.tokens ?? 0), 0)
  const totalCalls = agents.reduce((sum, a) => sum + a.requests, 0)
  const hasAiUsage = totalCalls > 0

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="AI Monitor"
        description="Real AI usage analytics: token consumption, estimated costs, response times, and chatbot CSAT from actual API calls."
        actions={[{ href: '#', label: 'Refresh', variant: 'secondary' }]}
      />

      {/* Top KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-purple-500/10 p-3 text-purple-400"><Zap className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Total AI Calls</p>
            <p className="text-2xl font-bold text-text-primary">{totalCalls.toLocaleString()}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-blue-500/10 p-3 text-blue-400"><TrendingUp className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Total Tokens</p>
            <p className="text-2xl font-bold text-text-primary">
              {hasAiUsage ? (totalTokens > 1000 ? `${(totalTokens / 1000).toFixed(1)}K` : totalTokens) : 'No Data'}
            </p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-amber-500/10 p-3 text-amber-400"><DollarSign className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">Total Cost (USD)</p>
            <p className="text-2xl font-bold text-amber-400">{hasAiUsage ? `$${totalCost.toFixed(4)}` : 'No Data'}</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <span className="rounded-2xl bg-emerald-500/10 p-3 text-emerald-400"><Bot className="h-5 w-5" /></span>
          <div>
            <p className="text-sm text-text-secondary">CSAT Score</p>
            <p className="text-2xl font-bold text-text-primary">
              {chatbot?.csatAverage != null ? `${chatbot.csatAverage.toFixed(1)}/5` : 'No Data'}
            </p>
          </div>
        </div>
      </div>

      <button onClick={refetch} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-amber-400 transition">
        <RefreshCw className="h-4 w-4" /> Refresh
      </button>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">{[...Array(4)].map((_, i) => <div key={i} className="card h-52 animate-pulse" />)}</div>
      ) : error ? (
        <div className="card p-6 text-center text-red-400">{error}</div>
      ) : (
        <>
          {/* Agent Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {agents.map(a => <AgentCard key={a.agent} agent={a} />)}
          </div>

          {/* Chatbot Deep Stats */}
          {chatbot && (
            <section className="card p-5">
              <h3 className="mb-4 font-bold text-text-primary flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-400" /> Chatbot Session Analytics
              </h3>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-xs text-text-secondary">Total Sessions</p>
                  <p className="text-xl font-bold text-text-primary">{chatbot.sessionsCount.toLocaleString()}</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-xs text-text-secondary">CSAT Average</p>
                  <p className="text-xl font-bold text-text-primary">
                    {chatbot.csatAverage != null ? `${chatbot.csatAverage.toFixed(1)} / 5` : 'No Data Available'}
                  </p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-xs text-text-secondary">Escalated</p>
                  <p className="text-xl font-bold text-amber-400">{chatbot.escalatedCount}</p>
                </div>
                <div className="rounded-xl bg-surface-muted p-3 text-center">
                  <p className="text-xs text-text-secondary">Failed Responses</p>
                  <p className="text-xl font-bold text-red-400">{chatbot.failedResponsesCount}</p>
                </div>
              </div>
            </section>
          )}

          {/* Top Questions */}
          <section className="card p-5">
            <h3 className="mb-4 font-bold text-text-primary">Most Asked Questions</h3>
            {topQ.length === 0 ? (
              <p className="text-sm text-text-secondary">No Data Available</p>
            ) : (
              <div className="space-y-2">
                {topQ.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-surface-border p-3">
                    <span className="mt-0.5 shrink-0 text-xs font-bold text-amber-400">#{i + 1}</span>
                    <p className="flex-1 text-sm text-text-primary">{q.question}</p>
                    <span className="shrink-0 text-xs text-text-secondary">{q.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
