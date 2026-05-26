"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Filter, Plus, Search, Download } from 'lucide-react'
import type { AdminListResponse } from '@/types/admin'
import { useAdminResource } from '@/lib/admin/client'
import { cn } from '@/utils'
import AdminPageHeader from '../AdminPageHeader'
import AdminDataTable, { type AdminTableColumn } from '../AdminDataTable'
import AdminEmptyState from '../AdminEmptyState'

type FilterField = { key: string; label: string; options: string[] }

export default function ResourceScreen<T extends object>({
  resource,
  title,
  description,
  fallback,
  columns,
  searchKeys,
  filters,
  newHref,
  exportHref,
  emptyTitle,
  emptyDescription,
}: {
  resource: string
  title: string
  description: string
  fallback: AdminListResponse<T>
  columns: Array<AdminTableColumn<T>>
  searchKeys: Array<keyof T & string>
  filters?: FilterField[]
  newHref?: string
  exportHref?: string
  emptyTitle: string
  emptyDescription: string
}) {
  const { data } = useAdminResource<AdminListResponse<T>>(resource, fallback)
  const [search, setSearch] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({})

  const rows = useMemo(() => {
    const source = data?.results ?? fallback.results
    const normalizedSearch = search.toLowerCase()

    return source.filter((row) => {
      const rowValues = row as Record<string, unknown>
      const matchesSearch = !normalizedSearch || searchKeys.some((key) => String(rowValues[key] ?? '').toLowerCase().includes(normalizedSearch))
      const matchesFilters = Object.entries(selectedFilters).every(([filterKey, filterValue]) => {
        if (!filterValue) return true
        const value = String(rowValues[filterKey] ?? '').toLowerCase()
        return value === filterValue.toLowerCase()
      })

      return matchesSearch && matchesFilters
    })
  }, [data?.results, fallback.results, search, searchKeys, selectedFilters])

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={title}
        description={description}
        actions={[
          ...(newHref ? [{ href: newHref, label: 'Create new' }] : []),
          ...(exportHref ? [{ href: exportHref, label: 'Export CSV', variant: 'secondary' as const }] : []),
        ]}
      />

      <section className="card flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-surface-border bg-surface/50 px-4 py-3">
          <Search className="h-4 w-4 text-text-muted" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}...`} className="w-full bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
        </label>

        <div className="flex flex-wrap items-center gap-3">
          {filters?.map((filter) => (
            <label key={filter.key} className="flex min-w-40 items-center gap-2 rounded-2xl border border-surface-border bg-surface/50 px-3 py-3 text-sm text-text-secondary">
              <Filter className="h-4 w-4 text-amber-400" />
              <select value={selectedFilters[filter.key] ?? ''} onChange={(event) => setSelectedFilters((current) => ({ ...current, [filter.key]: event.target.value }))} className="w-full bg-transparent outline-none">
                <option value="">{filter.label}</option>
                {filter.options.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          ))}
        </div>
      </section>

      <AdminDataTable rows={rows} columns={columns} emptyMessage="No rows match your filters" />

      {!rows.length ? (
        <AdminEmptyState title={emptyTitle} description={emptyDescription} actionHref={newHref} actionLabel="Create record" />
      ) : null}
    </div>
  )
}
