// Barrel export for all types
export * from './product'
export * from './blog'
export * from './quote'
export * from './seo'
export * from './nav'
export * from './chat'
export * from './admin'

// Common utility types
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  field?: string
  details?: Record<string, string[]>
}

export interface PaginationMeta {
  count: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}
