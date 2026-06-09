'use client'

import { ShieldAlert, ShieldCheck, LogIn, AlertOctagon, Ban, Activity, RefreshCw } from 'lucide-react'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import { useMonitoring } from '@/lib/monitoring/client'

interface SecurityLogItem {
  id: number
  eventType: string
  eventTypeDisplay: string
  ipAddress: string | null
  details: string | null
  userAgent: string | null
  timestamp: string
}

interface SecurityData {
  logs: SecurityLogItem[]
  counts: {
    failed_login: number
    admin_login: number
    suspicious_request: number
    blocked_ip: number
    rate_limit: number
    unauthorized_access: number
  }
  hasData: boolean
}

const EVENT_ICONS: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  failed_login: { icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10' },
  admin_login: { icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  suspicious_request: { icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  blocked_ip: { icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10' },
  rate_limit: { icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  unauthorized_access: { icon: AlertOctagon, color: 'text-orange-400', bg: 'bg-orange-500/10' },
}

export default function SecurityPage() {
  const { data, loading, error, refetch } = useMonitoring<SecurityData>('security')

  const counts = data?.counts ?? {
    failed_login: 0, admin_login: 0, suspicious_request: 0,
    blocked_ip: 0, rate_limit: 0, unauthorized_access: 0,
  }
  const logs = data?.logs ?? []
  const hasData = data?.hasData ?? false

  const threatScore = counts.failed_login + counts.suspicious_request + counts.blocked_ip + counts.unauthorized_access
  const threatLevel = !hasData ? 'No Data Available' : threatScore === 0 ? 'Secure' : threatScore < 5 ? 'Low' : threatScore < 20 ? 'Moderate' : 'High'
  const threatColor = threatLevel === 'Secure' ? 'text-emerald-400' : threatLevel === 'Low' ? 'text-blue-400' : threatLevel === 'Moderate' ? 'text-amber-400' : threatLevel === 'High' ? 'text-red-400' : 'text-text-secondary'

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Security Monitor"
        description="Threat detection, login audit trail, unauthorized access attempts, and suspicious activity — from real request data."
        actions={[{ href: '#', label: 'Refresh', variant: 'secondary' }]}
      />

      {/* Threat Level Banner */}
      <div className={`card p-5 border-l-4 ${threatLevel === 'Secure' ? 'border-emerald-500' : threatLevel === 'Low' ? 'border-blue-500' : threatLevel === 'Moderate' ? 'border-amber-500' : threatLevel === 'High' ? 'border-red-500' : 'border-surface-border'}`}>
        <div className="flex items-center gap-4">
          <ShieldCheck className={`h-8 w-8 ${threatColor}`} />
          <div>
            <p className="text-xs text-text-secondary uppercase tracking-wide">Current Threat Level</p>
            <p className={`text-2xl font-bold ${threatColor}`}>{threatLevel}</p>
            <p className="text-sm text-text-secondary mt-0.5">
              {!hasData ? 'No security events have been recorded yet.' : threatScore === 0 ? 'No threats detected in logged events.' : `${threatScore} threat-related events logged.`}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: 'Failed Logins', key: 'failed_login', icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Admin Logins', key: 'admin_login', icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Suspicious Requests', key: 'suspicious_request', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Blocked IPs', key: 'blocked_ip', icon: Ban, color: 'text-red-400', bg: 'bg-red-500/10' },
          { label: 'Rate Limited', key: 'rate_limit', icon: Activity, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Unauthorized Access', key: 'unauthorized_access', icon: AlertOctagon, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map(({ label, key, icon: Icon, color, bg }) => (
          <div key={key} className="card p-4 text-center">
            <span className={`inline-flex rounded-2xl p-2 mb-2 ${bg} ${color}`}>
              <Icon className="h-4 w-4" />
            </span>
            <p className={`text-xl font-bold ${counts[key as keyof typeof counts] > 0 ? color : 'text-text-primary'}`}>
              {counts[key as keyof typeof counts]}
            </p>
            <p className="text-xs text-text-secondary mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <button onClick={refetch} className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-amber-400 transition">
        <RefreshCw className="h-4 w-4" /> Refresh logs
      </button>

      {/* Event Log */}
      {loading ? (
        <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="card h-14 animate-pulse" />)}</div>
      ) : error ? (
        <div className="card p-6 text-center text-red-400">{error}</div>
      ) : logs.length === 0 ? (
        <div className="card p-12 text-center">
          <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto mb-3" />
          <p className="font-semibold text-text-primary">No security events logged</p>
          <p className="text-sm text-text-secondary mt-1">System is clean. Events will appear as they occur.</p>
        </div>
      ) : (
        <div className="card">
          <div className="border-b border-surface-border p-4">
            <h3 className="font-bold text-text-primary">Security Event Log</h3>
            <p className="text-xs text-text-secondary mt-0.5">Most recent 100 events — newest first</p>
          </div>
          <div className="divide-y divide-surface-border">
            {logs.map(log => {
              const cfg = EVENT_ICONS[log.eventType] ?? { icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-500/10' }
              const Icon = cfg.icon
              return (
                <div key={log.id} className="flex items-start gap-3 p-4">
                  <span className={`mt-0.5 shrink-0 rounded-xl p-2 ${cfg.bg} ${cfg.color}`}>
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold ${cfg.color}`}>{log.eventTypeDisplay}</span>
                      {log.ipAddress && (
                        <span className="text-xs text-text-secondary font-mono bg-surface-muted px-2 py-0.5 rounded">
                          {log.ipAddress}
                        </span>
                      )}
                      <span className="text-xs text-text-secondary ml-auto">{log.timestamp}</span>
                    </div>
                    {log.details && (
                      <p className="mt-1 text-sm text-text-secondary truncate" title={log.details}>{log.details}</p>
                    )}
                    {log.userAgent && (
                      <p className="mt-0.5 text-xs text-text-secondary/60 truncate">{log.userAgent}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
