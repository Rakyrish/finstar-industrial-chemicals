import { cn } from '@/utils'

export interface AdminTableColumn<T extends Record<string, unknown>> {
  key: keyof T | string
  label: string
  className?: string
  render?: (row: T) => React.ReactNode
}

export default function AdminDataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  emptyMessage = 'No records found',
}: {
  columns: Array<AdminTableColumn<T>>
  rows: T[]
  emptyMessage?: string
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-surface-border bg-surface-card shadow-card">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-border text-left text-sm">
          <thead className="bg-surface/40 text-xs uppercase tracking-[0.2em] text-text-muted">
            <tr>
              {columns.map((column) => (
                <th key={column.label} className={cn('px-5 py-4 font-semibold', column.className)}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {rows.length ? rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="transition hover:bg-surface/30">
                {columns.map((column) => (
                  <td key={column.label} className={cn('px-5 py-4 align-top text-text-secondary', column.className)}>
                    {column.render ? column.render(row) : String(row[column.key as keyof T] ?? '—')}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-5 py-10 text-center text-text-secondary" colSpan={columns.length}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}