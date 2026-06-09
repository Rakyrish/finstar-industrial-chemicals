'use client'

import { useState } from 'react'
import {
  Globe, Play, CheckCircle, XCircle, AlertTriangle,
  Link, Image, FileText, Code, Zap, Search,
  RefreshCw, Clock, ChevronDown, ChevronUp
} from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring, monitoringPost } from '@/lib/monitoring/client'

interface AuditIssue { page: string; [key: string]: string | number }
interface AuditReport {
  id: number
  createdAt: string
  score: number
  brokenLinks: AuditIssue[]
  missingImages: AuditIssue[]
  missingMetadata: AuditIssue[]
  missingSchema: AuditIssue[]
  slowPages: AuditIssue[]
  redirectIssues: AuditIssue[]
  duplicateContent: AuditIssue[]
  indexingProblems: AuditIssue[]
}

interface HistoryItem {
  id: number
  createdAt: string
  score: number
  brokenLinksCount: number
  missingImagesCount: number
  missingMetadataCount: number
  missingSchemaCount: number
  slowPagesCount: number
  duplicateContentCount: number
  indexingProblemsCount: number
}

function ScoreGauge({ score }: { score: number }) {
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  const label = score >= 80 ? 'Good' : score >= 60 ? 'Needs Work' : 'Poor'
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
          <circle
            cx="50" cy="50" r="40" fill="none"
            stroke={color} strokeWidth="12"
            strokeDasharray={`${(score / 100) * 251.2} 251.2`}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-text-primary">{score}</span>
          <span className="text-xs text-text-secondary">/100</span>
        </div>
      </div>
      <span style={{ color }} className="text-sm font-semibold">{label}</span>
    </div>
  )
}

function IssueSection({
  title, icon: Icon, items, color, fieldKey
}: {
  title: string
  icon: React.ElementType
  items: AuditIssue[]
  color: string
  fieldKey?: string
}) {
  const [open, setOpen] = useState(false)
  if (items.length === 0) return null
  return (
    <div className="rounded-2xl border border-surface-border overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 p-4 hover:bg-surface-muted transition"
      >
        <div className="flex items-center gap-3">
          <span className={`rounded-xl p-2 ${color}`}><Icon className="h-4 w-4" /></span>
          <span className="font-semibold text-text-primary">{title}</span>
          <span className="rounded-full bg-red-500/10 text-red-400 text-xs px-2 py-0.5">{items.length}</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-text-secondary" /> : <ChevronDown className="h-4 w-4 text-text-secondary" />}
      </button>
      {open && (
        <div className="divide-y divide-surface-border border-t border-surface-border">
          {items.map((item, i) => (
            <div key={i} className="px-4 py-3 text-sm">
              <p className="font-mono text-amber-400 text-xs">{item.page}</p>
              {fieldKey && item[fieldKey] && (
                <p className="mt-1 text-text-secondary">{String(item[fieldKey])}</p>
              )}
              {!fieldKey && Object.entries(item)
                .filter(([k]) => k !== 'page')
                .map(([k, v]) => (
                  <p key={k} className="mt-0.5 text-text-secondary">
                    <span className="text-text-secondary/60">{k}: </span>{String(v)}
                  </p>
                ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function WebsiteAuditorPage() {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<AuditReport | null>(null)
  const [runError, setRunError] = useState<string | null>(null)

  const { data: history, loading: histLoading, refetch: refetchHistory } =
    useMonitoring<HistoryItem[]>('auditor')

  async function runAudit() {
    setRunning(true)
    setRunError(null)
    setResult(null)
    try {
      const report = await monitoringPost<AuditReport>('auditor')
      setResult(report)
      refetchHistory()
    } catch (e) {
      setRunError(e instanceof Error ? e.message : 'Audit failed')
    } finally {
      setRunning(false)
    }
  }

  const totalIssues = result
    ? result.brokenLinks.length +
      result.missingImages.length +
      result.missingMetadata.length +
      result.missingSchema.length +
      result.slowPages.length +
      result.duplicateContent.length +
      result.indexingProblems.length
    : 0

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Website Auditor"
        description="On-demand crawler that checks every public page for broken links, missing metadata, slow load times, duplicate content, and schema issues."
        actions={[]}
      />

      {/* Launch card */}
      <div className="card p-8 text-center space-y-4">
        <div className="inline-flex rounded-full bg-amber-500/10 p-5 text-amber-400 mb-2">
          <Globe className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Run Full Site Audit</h2>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Crawls all public pages, checks SEO metadata from the database, identifies performance bottlenecks,
          and generates a scored health report. Results are saved for history comparison.
        </p>
        <button
          onClick={runAudit}
          disabled={running}
          className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base"
        >
          {running ? (
            <><RefreshCw className="h-5 w-5 animate-spin" /> Running Audit…</>
          ) : (
            <><Play className="h-5 w-5" /> Run Audit Now</>
          )}
        </button>
        {runError && <p className="text-red-400 text-sm mt-2">{runError}</p>}
      </div>

      {/* Current Result */}
      {result && (
        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-start gap-8 flex-wrap">
              <ScoreGauge score={result.score} />
              <div className="flex-1 space-y-3 min-w-0">
                <div>
                  <h3 className="text-lg font-bold text-text-primary">Audit Complete</h3>
                  <p className="text-sm text-text-secondary mt-0.5">{result.createdAt} · {totalIssues} issues found</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Broken Links', count: result.brokenLinks.length, icon: Link, color: result.brokenLinks.length > 0 ? 'text-red-400' : 'text-emerald-400' },
                    { label: 'Missing Meta', count: result.missingMetadata.length, icon: FileText, color: result.missingMetadata.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Missing Schema', count: result.missingSchema.length, icon: Code, color: result.missingSchema.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Slow Pages', count: result.slowPages.length, icon: Zap, color: result.slowPages.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Image Alts', count: result.missingImages.length, icon: Image, color: result.missingImages.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Dup Content', count: result.duplicateContent.length, icon: Search, color: result.duplicateContent.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Indexing Issues', count: result.indexingProblems.length, icon: Globe, color: result.indexingProblems.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                    { label: 'Redirects', count: result.redirectIssues.length, icon: AlertTriangle, color: result.redirectIssues.length > 0 ? 'text-amber-400' : 'text-emerald-400' },
                  ].map(m => (
                    <div key={m.label} className="rounded-xl bg-surface-muted p-3 text-center">
                      <m.icon className={`h-4 w-4 mx-auto mb-1 ${m.color}`} />
                      <p className={`text-lg font-bold ${m.color}`}>{m.count}</p>
                      <p className="text-[10px] text-text-secondary">{m.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Issue Accordions */}
          <div className="space-y-3">
            <IssueSection title="Broken Links" icon={XCircle} items={result.brokenLinks} color="bg-red-500/10 text-red-400" fieldKey="status_code" />
            <IssueSection title="Missing SEO Metadata" icon={FileText} items={result.missingMetadata} color="bg-amber-500/10 text-amber-400" fieldKey="field_missing" />
            <IssueSection title="Missing JSON-LD Schema" icon={Code} items={result.missingSchema} color="bg-blue-500/10 text-blue-400" />
            <IssueSection title="Missing Image Alt Text" icon={Image} items={result.missingImages} color="bg-amber-500/10 text-amber-400" fieldKey="img_src" />
            <IssueSection title="Slow Pages (>1.5s)" icon={Zap} items={result.slowPages} color="bg-amber-500/10 text-amber-400" fieldKey="response_time" />
            <IssueSection title="Duplicate Content" icon={Search} items={result.duplicateContent} color="bg-purple-500/10 text-purple-400" fieldKey="duplicate_value" />
            <IssueSection title="Indexing Problems" icon={Globe} items={result.indexingProblems} color="bg-orange-500/10 text-orange-400" fieldKey="reason" />
          </div>
        </div>
      )}

      {/* Audit History */}
      <section className="card p-5">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h3 className="font-bold text-text-primary">Audit History</h3>
          <button onClick={refetchHistory} className="flex items-center gap-1 text-xs text-text-secondary hover:text-amber-400 transition">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>
        {histLoading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-xl bg-surface-muted animate-pulse" />)}</div>
        ) : !history?.length ? (
          <p className="text-sm text-text-secondary">No audits run yet. Click "Run Audit Now" to start.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {history.map(h => (
              <div key={h.id} className="flex items-center gap-4 py-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-text-secondary" />
                  <span className="text-sm text-text-secondary">{h.createdAt}</span>
                </div>
                <div className={`font-bold text-sm ${h.score >= 80 ? 'text-emerald-400' : h.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>
                  Score: {h.score}/100
                </div>
                <div className="ml-auto flex flex-wrap gap-3 text-xs text-text-secondary">
                  {h.brokenLinksCount > 0 && <span className="text-red-400">🔗 {h.brokenLinksCount} broken</span>}
                  {h.missingMetadataCount > 0 && <span className="text-amber-400">📄 {h.missingMetadataCount} meta</span>}
                  {h.missingSchemaCount > 0 && <span className="text-blue-400">🔧 {h.missingSchemaCount} schema</span>}
                  {h.slowPagesCount > 0 && <span className="text-amber-400">⚡ {h.slowPagesCount} slow</span>}
                  {h.brokenLinksCount === 0 && h.missingMetadataCount === 0 && h.missingSchemaCount === 0 && (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Clean</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
