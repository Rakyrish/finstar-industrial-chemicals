"use client"

import { useEffect, useState } from 'react'
import { message } from 'antd'
import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

type TechnicalDocFormProps = {
  docId?: string
  initialData?: any
}

export default function TechnicalDocForm({ docId, initialData }: TechnicalDocFormProps) {
  const router = useRouter()
  const [products, setProducts] = useState<any[]>([])

  // Watch fields
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<any>({
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      docType: initialData?.docType ?? 'datasheet',
      standardCode: initialData?.standardCode ?? '',
      excerpt: initialData?.excerpt ?? '',
      bodyHtml: initialData?.bodyHtml ?? '',
      pdfFileUrl: initialData?.pdfFile ?? '',
      isPublished: initialData?.isPublished ?? false,
      metaTitle: initialData?.metaTitle ?? '',
      metaDescription: initialData?.metaDescription ?? '',
      // Map related products to their IDs
      relatedProducts: initialData?.relatedProducts?.map((p: any) => p.id) ?? [],
    },
  })

  const titleVal = watch('title') || ''
  const excerptVal = watch('excerpt') || ''
  const metaTitleVal = watch('metaTitle') || ''
  const metaDescVal = watch('metaDescription') || ''
  const selectedProducts = watch('relatedProducts') || []

  // Load products list for multi-select
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

  const onSubmit = async (values: any) => {
    if (!values.title) {
      message.error('Title is required')
      return
    }

    const payload = {
      title: values.title,
      slug: values.slug || undefined,
      doc_type: values.docType,
      standard_code: values.standardCode,
      excerpt: values.excerpt,
      body_html: values.bodyHtml,
      meta_title: values.metaTitle,
      meta_description: values.metaDescription,
      is_published: values.isPublished,
      related_products: values.relatedProducts,
    }

    const endpoint = docId ? `/api/admin/technical-docs/${docId}` : '/api/admin/technical-docs'
    const method = docId ? 'PATCH' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.detail ?? result.message ?? 'Technical document save failed.')

      message.success(docId ? 'Technical document updated.' : 'Technical document created.')
      router.push('/admin/technical-docs')
      router.refresh()
    } catch (error: any) {
      message.error(error.message || 'Save failed.')
    }
  }

  const handleProductToggle = (productId: number) => {
    const isSelected = selectedProducts.includes(productId)
    const newSelection = isSelected
      ? selectedProducts.filter((id: number) => id !== productId)
      : [...selectedProducts, productId]
    setValue('relatedProducts', newSelection)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3">
      {/* Core editor fields */}
      <div className="lg:col-span-2 space-y-6">
        <section className="card space-y-4 p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary">Core Content</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">Title</span>
              <input {...register('title')} className="input-base w-full" placeholder="e.g. Sodium Hydroxide Technical Data Sheet" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Slug (optional)</span>
              <input {...register('slug')} className="input-base w-full" placeholder="url-friendly-slug" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Standard Reference Code (optional)</span>
              <input {...register('standardCode')} className="input-base w-full" placeholder="e.g. KS KS 04-136, ISO 9001" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Excerpt / Short Description</span>
                <span className={`text-xs ${excerptVal.length > 300 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {excerptVal.length}/300 chars
                </span>
              </div>
              <textarea {...register('excerpt')} rows={3} className="input-base w-full" placeholder="Brief technical abstract..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">Document Body (HTML/Markdown supported)</span>
              <textarea {...register('bodyHtml')} rows={15} className="input-base w-full font-mono text-sm" placeholder="Write document body content here..." />
            </div>
          </div>
        </section>

        {/* SEO Metas */}
        <section className="card space-y-4 p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary">SEO Optimization</h3>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Meta Title</span>
                <span className={`text-xs ${metaTitleVal.length > 70 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {metaTitleVal.length}/70 chars
                </span>
              </div>
              <input {...register('metaTitle')} className="input-base w-full" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Meta Description</span>
                <span className={`text-xs ${metaDescVal.length > 160 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {metaDescVal.length}/160 chars
                </span>
              </div>
              <textarea {...register('metaDescription')} rows={3} className="input-base w-full" />
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-surface font-semibold shadow disabled:opacity-50">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {docId ? 'Update Document' : 'Publish Document'}
          </button>

          <button type="button" onClick={() => router.push('/admin/technical-docs')} className="px-6 py-3 rounded-2xl border border-surface-border hover:bg-surface/20 text-text-secondary font-medium transition">
            Cancel
          </button>
        </div>
      </div>

      {/* Sidebar Controls */}
      <div className="space-y-6">
        <section className="card p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary mb-4">Document Setup</h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-medium text-text-secondary">Document Type</span>
              <select {...register('docType')} className="input-base w-full">
                <option value="datasheet">Product Data Sheet</option>
                <option value="iso_guide">ISO Standard Guide</option>
                <option value="kebs_guide">KEBS Compliance Guide</option>
                <option value="iec_guide">IEC Standard Guide</option>
                <option value="case_study">Case Study</option>
                <option value="whitepaper">Technical Whitepaper</option>
              </select>
            </div>

            <div className="pt-4 border-t border-surface-border flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isPublished')} className="rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface/50 h-4 w-4" />
                <span className="text-sm font-medium text-text-secondary">Mark as Publicly Visible</span>
              </label>
            </div>
          </div>
        </section>

        {/* Related Products Select Widget */}
        <section className="card p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary mb-2">Related Products</h3>
          <p className="text-xs text-text-muted mb-4">Select products related to this documentation sheet.</p>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-surface-border rounded-2xl p-3 bg-surface/30">
            {products.length === 0 ? (
              <span className="text-xs text-text-muted">No products available.</span>
            ) : (
              products.map((product) => {
                const isChecked = selectedProducts.includes(product.id)
                return (
                  <label key={product.id} className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer hover:text-text-primary">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleProductToggle(product.id)}
                      className="rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface/50 h-4 w-4"
                    />
                    <span>{product.name}</span>
                  </label>
                )
              })
            )}
          </div>
        </section>
      </div>
    </form>
  )
}
