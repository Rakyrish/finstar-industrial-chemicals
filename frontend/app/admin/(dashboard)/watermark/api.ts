/**
 * Thin client for /api/admin/watermark/* — proxied 1:1 by
 * app/api/admin/watermark/[...path]/route.ts to the Django admin API.
 */

export interface WatermarkSettings {
  watermarkEnabled: boolean
  rightClickProtectionEnabled: boolean
  dragProtectionEnabled: boolean
  longPressProtectionEnabled: boolean
  seoMetadataProtectionEnabled: boolean
  watermarkText: string
  watermarkSecondaryText: string
  watermarkOpacity: number
  watermarkFontSize: number
  watermarkAngle: number
  watermarkPosition: 'center' | 'tiled'
  watermarkColor: string
  updatedAt: string
}

export interface WatermarkScope {
  categories: Array<{ id: number; name: string; slug: string; productCount: number }>
  tags: Array<{ id: number; name: string; slug: string; productCount: number }>
  allActiveCount: number
  neverProtectedCount: number
}

export type ScopeType = 'all' | 'category' | 'tag' | 'never_protected'
export type BatchAction = 'apply' | 'restore'

export interface BulkApplyResult {
  batchId: string | null
  queuedCount: number
  skippedCount: number
  totalMatched: number
  detail?: string
}

export interface BatchSummary {
  batchId: string
  scopeType: ScopeType
  scopeValue: string
  action: BatchAction
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  totalMatched: number
  queuedCount: number
  skippedCount: number
  createdAt: string
  updatedAt: string
}

export interface BatchStatus {
  batchId: string
  status: 'active' | 'paused' | 'cancelled' | 'completed'
  scopeType: ScopeType
  scopeValue: string
  action: BatchAction
  counts: {
    pending: number
    processing: number
    completed: number
    failed: number
    cancelled: number
    total: number
  }
  percentComplete: number
  etaSeconds: number
  recentResults: Array<{
    productId: number
    productName: string
    status: string
    attempts: number
    lastError: string
    finishedAt: string | null
  }>
}

class WatermarkApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/admin/watermark${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...init,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new WatermarkApiError(payload.detail ?? `Request failed (${response.status}).`, response.status)
  }
  return payload as T
}

export { WatermarkApiError }

export const watermarkApi = {
  getSettings: () => request<WatermarkSettings>('/settings/'),
  updateSettings: (patch: Partial<WatermarkSettings>) =>
    request<WatermarkSettings>('/settings/', { method: 'PATCH', body: JSON.stringify(patch) }),

  preview: (design: Partial<WatermarkSettings> & { productId?: number }) =>
    request<{ url: string; productId: number; productName: string }>('/preview/', {
      method: 'POST',
      body: JSON.stringify(design),
    }),

  getScopes: () => request<WatermarkScope>('/scopes/'),

  bulkApply: (scopeType: ScopeType, scopeValue: string, action: BatchAction) =>
    request<BulkApplyResult>('/bulk-apply/', {
      method: 'POST',
      body: JSON.stringify({ scopeType, scopeValue, action }),
    }),

  restoreAll: () => request<BulkApplyResult>('/restore-all/', { method: 'POST' }),

  listBatches: () => request<{ results: BatchSummary[] }>('/batches/'),

  getBatchStatus: (batchId: string) => request<BatchStatus>(`/batches/${batchId}/`),

  pauseBatch: (batchId: string) => request<{ detail: string }>(`/batches/${batchId}/pause/`, { method: 'POST' }),
  resumeBatch: (batchId: string) => request<{ detail: string }>(`/batches/${batchId}/resume/`, { method: 'POST' }),
  cancelBatch: (batchId: string) => request<{ detail: string }>(`/batches/${batchId}/cancel/`, { method: 'POST' }),

  applyProduct: (productId: number) =>
    request<{ detail: string; isWatermarkApplied: boolean }>(`/products/${productId}/apply/`, { method: 'POST' }),
  restoreProduct: (productId: number) =>
    request<{ detail: string; isWatermarkApplied: boolean }>(`/products/${productId}/restore/`, { method: 'POST' }),
}
