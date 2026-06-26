'use client'

import { useState, useEffect } from 'react'
import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import type { AdminListResponse } from '@/types/admin'
import type { AdminTableColumn } from '@/components/admin/AdminDataTable'
import Link from 'next/link'
import { Pencil, FileText, Sparkles, Loader2 } from 'lucide-react'
import { message } from 'antd'
import { useRouter } from 'next/navigation'

export const techDocColumns: AdminTableColumn<any>[] = [
  {
    key: 'title',
    label: 'Document',
    render: (row) => (
      <div>
        <p className="font-semibold text-text-primary">{row.title}</p>
        <p className="text-xs text-text-muted">{row.slug} {row.standardCode ? `• ${row.standardCode}` : ''}</p>
      </div>
    ),
  },
  {
    key: 'docType',
    label: 'Type',
    render: (row) => {
      const labels: Record<string, string> = {
        datasheet: 'Product Data Sheet',
        iso_guide: 'ISO Guide',
        kebs_guide: 'KEBS Guide',
        iec_guide: 'IEC Guide',
        case_study: 'Case Study',
        whitepaper: 'Whitepaper',
      }
      return (
        <span className="badge-muted">
          {labels[row.docType] ?? row.docType}
        </span>
      )
    },
  },
  {
    key: 'isPublished',
    label: 'Status',
    render: (row) => (
      <span className={row.isPublished ? 'badge-green' : 'badge-muted'}>
        {row.isPublished ? 'Published' : 'Draft'}
      </span>
    ),
  },
  {
    key: 'viewCount',
    label: 'Views',
  },
  {
    key: 'updatedAt',
    label: 'Updated',
  },
  {
    key: 'id',
    label: 'Actions',
    render: (row) => (
      <Link
        href={`/admin/technical-docs/${row.id}/edit`}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary border border-surface-border hover:border-amber-500/40 hover:text-amber-400 transition-all duration-150"
      >
        <Pencil className="w-3 h-3" /> Edit
      </Link>
    ),
  },
]

export function TechnicalDocsResourceScreen({ fallback }: { fallback: AdminListResponse<any> }) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  // Load products list for dropdown
  useEffect(() => {
    fetch('/api/admin/products')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.results)) {
          setProducts(data.results)
        }
      })
      .catch((err) => console.error('Error loading products:', err))
  }, [])

  const handleGenerateDataSheet = async () => {
    if (!selectedProductId) {
      message.warning('Please select a product to generate a data sheet.')
      return
    }

    setIsGenerating(true)
    const hide = message.loading('Generating GHS SDS-compliant Product Data Sheet...', 0)

    try {
      const response = await fetch('/api/admin/ai/generate-datasheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProductId }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Data sheet generation failed.')
      }

      message.success(`Successfully generated and saved Data Sheet: "${data.title}"`)
      router.refresh()
    } catch (error: any) {
      message.error(error.message || 'Generation failed.')
    } finally {
      hide()
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1-Click AI Generation Widget */}
      <section className="card p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            AI Product Data Sheet Generator
          </h3>
          <p className="text-sm text-text-secondary mt-1">
            Generate and publish a compliant B2B Product Data Sheet in one click using GPT-4o-mini.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="input-base text-sm py-2 px-4 rounded-xl border border-surface-border bg-surface/50"
            disabled={isGenerating}
          >
            <option value="">-- Select Product --</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            onClick={handleGenerateDataSheet}
            disabled={isGenerating || !selectedProductId}
            className="btn-primary py-2 px-4 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-surface font-semibold shadow disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate
          </button>
        </div>
      </section>

      <ResourceScreen
        resource="technical-docs"
        title="Technical documents"
        description="Manage product safety data sheets, compliance regulations, ISO guides, and other engineering documentation."
        fallback={fallback}
        searchKeys={['title', 'slug', 'standardCode']}
        filters={[
          {
            key: 'docType',
            label: 'Type',
            options: ['datasheet', 'iso_guide', 'kebs_guide', 'iec_guide', 'whitepaper'],
          },
          {
            key: 'isPublished',
            label: 'Status',
            options: ['true', 'false'],
          },
        ]}
        newHref="/admin/technical-docs/new"
        emptyTitle="No technical documents yet"
        emptyDescription="Create static compliance guides or select a product above to generate a data sheet."
        columns={techDocColumns}
      />
    </div>
  )
}
