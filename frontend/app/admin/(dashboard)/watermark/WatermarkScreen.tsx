'use client'

import { useCallback, useEffect, useState } from 'react'
import { message } from 'antd'
import AdminPageHeader from '@/components/admin/AdminPageHeader'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog'
import AdminDataTable, { type AdminTableColumn } from '@/components/admin/AdminDataTable'
import { cn } from '@/utils'
import {
  watermarkApi,
  type WatermarkSettings,
  type WatermarkScope,
  type BatchSummary,
  type ScopeType,
  type BatchAction,
} from './api'
import { useBatchPolling } from './useBatchPolling'

const CHECKBOX_CLASS = 'h-4 w-4 rounded border-surface-border bg-surface/50 text-amber-500 focus:ring-amber-500'

interface ProductProtectionRow {
  id: number
  name: string
  primaryImage?: string | null
  isWatermarkApplied: boolean
}

const TOGGLE_FIELDS: Array<{ key: keyof WatermarkSettings; label: string; hint: string }> = [
  {
    key: 'watermarkEnabled',
    label: 'Watermark enabled (master switch)',
    hint: 'Whether the watermarked image is actually served to visitors. Everything else is staged until this is on.',
  },
  {
    key: 'rightClickProtectionEnabled',
    label: 'Right-click protection',
    hint: 'Disable the right-click / context menu on product images.',
  },
  {
    key: 'dragProtectionEnabled',
    label: 'Drag protection',
    hint: 'Disable dragging images out of the page.',
  },
  {
    key: 'longPressProtectionEnabled',
    label: 'Long-press protection',
    hint: 'Disable the mobile long-press "save image" menu.',
  },
  {
    key: 'seoMetadataProtectionEnabled',
    label: 'SEO metadata protection',
    hint: 'Strip descriptive alt-text/title on protected images to reduce reverse-image-search surface area.',
  },
]

function statusBadgeClass(status: string) {
  switch (status) {
    case 'completed':
      return 'badge-green'
    case 'failed':
    case 'cancelled':
      return 'badge-red'
    case 'active':
    case 'processing':
      return 'badge-amber bg-amber-500/10 text-amber-400'
    default:
      return 'badge-muted'
  }
}

function formatEta(seconds: number) {
  if (seconds <= 0) return 'moments'
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.round(seconds / 60)
  return `${minutes}m`
}

export default function WatermarkScreen() {
  const [settings, setSettings] = useState<WatermarkSettings | null>(null)
  const [savingSettings, setSavingSettings] = useState(false)
  const [loadingSettings, setLoadingSettings] = useState(true)

  const [scopes, setScopes] = useState<WatermarkScope | null>(null)
  const [scopeType, setScopeType] = useState<ScopeType>('never_protected')
  const [scopeValue, setScopeValue] = useState('')
  const [action, setAction] = useState<BatchAction>('apply')
  const [starting, setStarting] = useState(false)
  const [noEligibleMessage, setNoEligibleMessage] = useState<string | null>(null)

  const [activeBatchId, setActiveBatchId] = useState<string | null>(null)
  const { status: batchStatus, error: pollError, isPolling } = useBatchPolling(activeBatchId)

  const [batches, setBatches] = useState<BatchSummary[]>([])
  const [confirmRestoreAll, setConfirmRestoreAll] = useState(false)

  const [products, setProducts] = useState<ProductProtectionRow[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productActionId, setProductActionId] = useState<number | null>(null)

  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)

  const loadSettings = useCallback(() => {
    setLoadingSettings(true)
    watermarkApi
      .getSettings()
      .then(setSettings)
      .catch(() => message.error('Could not load watermark settings.'))
      .finally(() => setLoadingSettings(false))
  }, [])

  const loadScopes = useCallback(() => {
    watermarkApi.getScopes().then(setScopes).catch(() => {})
  }, [])

  const loadBatches = useCallback(() => {
    watermarkApi
      .listBatches()
      .then((res) => setBatches(res.results))
      .catch(() => {})
  }, [])

  const loadProducts = useCallback(() => {
    setProductsLoading(true)
    fetch('/api/admin/products', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data?.results) ? data.results : []))
      .catch(() => {})
      .finally(() => setProductsLoading(false))
  }, [])

  useEffect(() => {
    loadSettings()
    loadScopes()
    loadBatches()
    loadProducts()
  }, [loadSettings, loadScopes, loadBatches, loadProducts])

  // Refresh history + per-item statuses once a batch we were watching finishes.
  useEffect(() => {
    if (activeBatchId && !isPolling) {
      loadBatches()
      loadProducts()
    }
  }, [activeBatchId, isPolling, loadBatches, loadProducts])

  function patchLocalSettings(patch: Partial<WatermarkSettings>) {
    setSettings((prev) => (prev ? { ...prev, ...patch } : prev))
  }

  async function handleSaveSettings() {
    if (!settings) return
    setSavingSettings(true)
    try {
      const saved = await watermarkApi.updateSettings(settings)
      setSettings(saved)
      message.success('Watermark settings saved.')
    } catch (err: any) {
      message.error(err.message ?? 'Failed to save settings.')
    } finally {
      setSavingSettings(false)
    }
  }

  async function handlePreview() {
    if (!settings) return
    setPreviewLoading(true)
    setPreviewUrl(null)
    try {
      const result = await watermarkApi.preview(settings)
      setPreviewUrl(result.url)
    } catch (err: any) {
      message.error(err.message ?? 'Preview failed — is there a product with a Cloudinary image yet?')
    } finally {
      setPreviewLoading(false)
    }
  }

  async function handleStartBulk() {
    setStarting(true)
    setNoEligibleMessage(null)
    try {
      const result = await watermarkApi.bulkApply(scopeType, scopeValue, action)
      if (!result.batchId || result.queuedCount === 0) {
        setNoEligibleMessage(
          result.detail ?? `No items were eligible for this scope (${result.skippedCount} already queued, ${result.totalMatched} matched).`
        )
        return
      }
      message.success(`Queued ${result.queuedCount} item(s) for ${action === 'apply' ? 'watermark protection' : 'restore'}.`)
      setActiveBatchId(result.batchId)
      loadBatches()
    } catch (err: any) {
      message.error(err.message ?? 'Failed to start batch.')
    } finally {
      setStarting(false)
    }
  }

  async function handlePauseResume() {
    if (!activeBatchId || !batchStatus) return
    try {
      if (batchStatus.status === 'paused') {
        await watermarkApi.resumeBatch(activeBatchId)
      } else {
        await watermarkApi.pauseBatch(activeBatchId)
      }
    } catch (err: any) {
      message.error(err.message ?? 'Action failed.')
    }
  }

  async function handleCancelBatch() {
    if (!activeBatchId) return
    try {
      await watermarkApi.cancelBatch(activeBatchId)
      message.info('Batch cancelled.')
    } catch (err: any) {
      message.error(err.message ?? 'Cancel failed.')
    }
  }

  async function handleProductAction(product: ProductProtectionRow) {
    setProductActionId(product.id)
    try {
      const result = product.isWatermarkApplied
        ? await watermarkApi.restoreProduct(product.id)
        : await watermarkApi.applyProduct(product.id)
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, isWatermarkApplied: result.isWatermarkApplied } : p))
      )
      message.success(result.detail)
    } catch (err: any) {
      message.error(err.message ?? 'Action failed.')
    } finally {
      setProductActionId(null)
    }
  }

  async function handleRestoreAll() {
    setConfirmRestoreAll(false)
    try {
      const result = await watermarkApi.restoreAll()
      if (!result.batchId || result.queuedCount === 0) {
        message.info('No protected items to restore.')
        return
      }
      message.success(`Restoring ${result.queuedCount} item(s).`)
      setActiveBatchId(result.batchId)
      loadBatches()
    } catch (err: any) {
      message.error(err.message ?? 'Restore all failed.')
    }
  }

  const batchColumns: AdminTableColumn<BatchSummary>[] = [
    { key: 'action', label: 'Action', render: (row) => (row.action === 'apply' ? 'Apply' : 'Restore') },
    {
      key: 'scopeType',
      label: 'Scope',
      render: (row) => (row.scopeType === 'all' ? 'All active' : row.scopeType.replace('_', ' ')),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <span className={statusBadgeClass(row.status)}>{row.status}</span>,
    },
    { key: 'queuedCount', label: 'Queued' },
    { key: 'skippedCount', label: 'Skipped' },
    { key: 'createdAt', label: 'Started', render: (row) => new Date(row.createdAt).toLocaleString() },
  ]

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Image protection & watermarking"
        description="Control the site-wide watermark design, right-click/drag/long-press guards, and run bulk protection jobs. Every toggle below defaults off — nothing changes on the live site until you save it."
      />

      {/* ── Global toggles ─────────────────────────────────────────────── */}
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-bold text-text-primary">Protection toggles</h3>
        {loadingSettings || !settings ? (
          <p className="text-sm text-text-secondary">Loading…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {TOGGLE_FIELDS.map((field) => (
              <label key={field.key} className="flex items-start gap-3 rounded-2xl border border-surface-border p-4">
                <input
                  type="checkbox"
                  className={cn(CHECKBOX_CLASS, 'mt-0.5')}
                  checked={Boolean(settings[field.key])}
                  onChange={(e) => patchLocalSettings({ [field.key]: e.target.checked } as Partial<WatermarkSettings>)}
                />
                <span>
                  <span className="block text-sm font-semibold text-text-primary">{field.label}</span>
                  <span className="mt-1 block text-xs text-text-secondary">{field.hint}</span>
                </span>
              </label>
            ))}
          </div>
        )}
      </section>

      {/* ── Watermark design ───────────────────────────────────────────── */}
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-bold text-text-primary">Watermark design</h3>
        {settings ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Primary text</label>
              <input
                className="input-base w-full"
                value={settings.watermarkText}
                onChange={(e) => patchLocalSettings({ watermarkText: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Secondary text (optional)</label>
              <input
                className="input-base w-full"
                value={settings.watermarkSecondaryText}
                onChange={(e) => patchLocalSettings({ watermarkSecondaryText: e.target.value })}
                placeholder="e.g. finstarchemicals.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Opacity ({settings.watermarkOpacity}%)
              </label>
              <input
                type="range"
                min={1}
                max={100}
                className="w-full"
                value={settings.watermarkOpacity}
                onChange={(e) => patchLocalSettings({ watermarkOpacity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">
                Angle ({settings.watermarkAngle}°)
              </label>
              <input
                type="range"
                min={-90}
                max={90}
                className="w-full"
                value={settings.watermarkAngle}
                onChange={(e) => patchLocalSettings({ watermarkAngle: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Font size</label>
              <input
                type="number"
                min={8}
                max={200}
                className="input-base w-full"
                value={settings.watermarkFontSize}
                onChange={(e) => patchLocalSettings({ watermarkFontSize: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Position</label>
              <select
                className="input-base w-full"
                value={settings.watermarkPosition}
                onChange={(e) => patchLocalSettings({ watermarkPosition: e.target.value as WatermarkSettings['watermarkPosition'] })}
              >
                <option value="tiled">Tiled (repeated diagonal pattern)</option>
                <option value="center">Center (single stamp)</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-14 rounded border border-surface-border bg-transparent"
                  value={settings.watermarkColor}
                  onChange={(e) => patchLocalSettings({ watermarkColor: e.target.value })}
                />
                <input
                  className="input-base w-full"
                  value={settings.watermarkColor}
                  onChange={(e) => patchLocalSettings({ watermarkColor: e.target.value })}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-text-secondary">Loading…</p>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button type="button" className="btn-secondary" onClick={handlePreview} disabled={previewLoading || !settings}>
            {previewLoading ? 'Rendering preview…' : 'Preview'}
          </button>
          <button type="button" className="btn-primary" onClick={handleSaveSettings} disabled={savingSettings || !settings}>
            {savingSettings ? 'Saving…' : 'Save settings'}
          </button>
        </div>

        {previewUrl ? (
          <div className="mt-4 max-w-sm overflow-hidden rounded-2xl border border-surface-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewUrl} alt="Watermark preview" className="w-full" />
          </div>
        ) : null}
      </section>

      {/* ── Bulk apply ──────────────────────────────────────────────────── */}
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-bold text-text-primary">Bulk apply</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Scope</label>
            <select
              className="input-base w-full"
              value={scopeType}
              onChange={(e) => {
                setScopeType(e.target.value as ScopeType)
                setScopeValue('')
              }}
            >
              <option value="never_protected">Never protected yet ({scopes?.neverProtectedCount ?? '…'})</option>
              <option value="all">All active products ({scopes?.allActiveCount ?? '…'})</option>
              <option value="category">By category</option>
              <option value="tag">By tag</option>
            </select>
          </div>

          {scopeType === 'category' ? (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Category</label>
              <select className="input-base w-full" value={scopeValue} onChange={(e) => setScopeValue(e.target.value)}>
                <option value="">Select a category…</option>
                {scopes?.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.productCount})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          {scopeType === 'tag' ? (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Tag</label>
              <select className="input-base w-full" value={scopeValue} onChange={(e) => setScopeValue(e.target.value)}>
                <option value="">Select a tag…</option>
                {scopes?.tags.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.productCount})
                  </option>
                ))}
              </select>
            </div>
          ) : null}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-text-muted">Action</label>
            <select className="input-base w-full" value={action} onChange={(e) => setAction(e.target.value as BatchAction)}>
              <option value="apply">Apply watermark</option>
              <option value="restore">Restore original</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              className="btn-primary w-full"
              onClick={handleStartBulk}
              disabled={starting || (scopeType === 'category' && !scopeValue) || (scopeType === 'tag' && !scopeValue)}
            >
              {starting ? 'Starting…' : 'Start batch'}
            </button>
          </div>
        </div>

        {noEligibleMessage ? (
          <p className="rounded-2xl border border-surface-border bg-surface/40 p-4 text-sm text-text-secondary">
            {noEligibleMessage}
          </p>
        ) : null}

        {activeBatchId && pollError ? (
          <p className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">{pollError}</p>
        ) : null}

        {activeBatchId && batchStatus && !pollError ? (
          <div className="space-y-3 rounded-2xl border border-surface-border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className={statusBadgeClass(batchStatus.status)}>{batchStatus.status}</span>
              <span className="text-xs text-text-muted">
                {batchStatus.counts.completed + batchStatus.counts.failed + batchStatus.counts.cancelled} / {batchStatus.counts.total} done
                {batchStatus.counts.pending + batchStatus.counts.processing > 0 ? ` — ETA ${formatEta(batchStatus.etaSeconds)}` : ''}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
              <div className="h-full bg-amber-500 transition-all" style={{ width: `${batchStatus.percentComplete}%` }} />
            </div>
            {isPolling ? (
              <div className="flex gap-2">
                <button type="button" className="btn-secondary" onClick={handlePauseResume}>
                  {batchStatus.status === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <button type="button" className="btn-secondary" onClick={handleCancelBatch}>
                  Cancel
                </button>
              </div>
            ) : null}
            {batchStatus.recentResults.length ? (
              <ul className="space-y-1 text-xs text-text-secondary">
                {batchStatus.recentResults.slice(0, 5).map((r) => (
                  <li key={`${r.productId}-${r.finishedAt ?? 'pending'}`} className="flex justify-between gap-2">
                    <span className="truncate">{r.productName}</span>
                    <span className={statusBadgeClass(r.status)}>{r.status}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </section>

      {/* ── Per-item protection ─────────────────────────────────────────── */}
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-bold text-text-primary">Per-item protection</h3>
        <p className="text-sm text-text-secondary">
          Instant — flipping a single item's protection is a one-row update, not CDN reprocessing.
        </p>
        <AdminDataTable
          columns={[
            { key: 'name', label: 'Product' },
            {
              key: 'isWatermarkApplied',
              label: 'Status',
              render: (row) => (
                <span className={row.isWatermarkApplied ? 'badge-green' : 'badge-muted'}>
                  {row.isWatermarkApplied ? 'Protected' : 'Unprotected'}
                </span>
              ),
            },
            {
              key: 'id',
              label: 'Action',
              render: (row) => (
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={productActionId === row.id}
                  onClick={() => handleProductAction(row)}
                >
                  {productActionId === row.id ? 'Working…' : row.isWatermarkApplied ? 'Restore' : 'Apply'}
                </button>
              ),
            },
          ]}
          rows={products}
          emptyMessage={productsLoading ? 'Loading products…' : 'No products found.'}
        />
      </section>

      {/* ── History + restore all ──────────────────────────────────────── */}
      <section className="card space-y-4 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-text-primary">Batch history</h3>
          <button type="button" className="btn-secondary" onClick={() => setConfirmRestoreAll(true)}>
            Restore all
          </button>
        </div>
        <AdminDataTable columns={batchColumns} rows={batches} emptyMessage="No batches have been run yet." />
      </section>

      <AdminConfirmDialog
        open={confirmRestoreAll}
        onOpenChange={setConfirmRestoreAll}
        title="Restore all protected images?"
        description="Every product currently showing a watermark will revert to its original image. This is instant — no CDN reprocessing is required."
        confirmLabel="Restore all"
        onConfirm={handleRestoreAll}
      />
    </div>
  )
}
