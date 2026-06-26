"use client"

import { useEffect, useState } from 'react'
import { message } from 'antd'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Sparkles, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react'
import { adminBlogSchema } from '@/lib/admin/schemas'
import type { AdminBlogDraft } from '@/types/admin'
import { useRouter } from 'next/navigation'

type BlogFormProps = {
  blogId?: string
  initialData?: any
}

// Custom Zod resolver that is more relaxed for drafts but displays alerts
// We will use the schema, but make fields optional for saving drafts if the user chooses.
// However, the standard schema requires title, slug, excerpt, content, author, publishDate.
// We will follow the zod schema: title, slug, excerpt, content, author, status, publishDate, seoTitle, seoDescription

export default function BlogForm({ blogId, initialData }: BlogFormProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [qualityScore, setQualityScore] = useState<number>(initialData?.qualityScore ?? 0)
  const [qualityBreakdown, setQualityBreakdown] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])

  // AI input states
  const [aiTopic, setAiTopic] = useState('')
  const [aiKeywords, setAiKeywords] = useState('')
  const [aiProduct, setAiProduct] = useState('')
  const [aiStandard, setAiStandard] = useState('')
  const [aiImageUrl, setAiImageUrl] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<any>({
    defaultValues: {
      title: initialData?.title ?? '',
      slug: initialData?.slug ?? '',
      excerpt: initialData?.excerpt ?? '',
      content: initialData?.content ?? '',
      authorName: initialData?.authorName ?? 'Finstar Team',
      coverImageUrl: initialData?.coverImageUrl ?? '',
      coverImageAlt: initialData?.coverImageAlt ?? '',
      tags: initialData?.tags ?? [],
      status: initialData?.status ?? 'draft',
      scheduledAt: initialData?.scheduledAt ? initialData.scheduledAt.split('T')[0] : '',
      publishedAt: initialData?.publishedAt ? initialData.publishedAt.split('T')[0] : '',
      metaTitle: initialData?.metaTitle ?? '',
      metaDescription: initialData?.metaDescription ?? '',
      isFeatured: initialData?.isFeatured ?? false,
      category: initialData?.category ?? 'Technical Guide',
      faqJson: initialData?.faqJson ?? '[]',
    },
  })

  // Watch text values for SEO counters
  const titleVal = watch('title') || ''
  const excerptVal = watch('excerpt') || ''
  const metaTitleVal = watch('metaTitle') || ''
  const metaDescVal = watch('metaDescription') || ''
  const tagsVal = watch('tags') || []

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

  // Call OpenAI backend service to generate post
  const handleAiGenerate = async () => {
    if (!aiTopic && !aiProduct && !aiStandard && !aiKeywords) {
      message.warning('Please enter a topic, select a product, standard code, or enter keywords to guide generation.')
      return
    }

    setIsGenerating(true)
    const hide = message.loading('Generating comprehensive technical article (this may take up to 2 minutes)...', 0)

    try {
      const response = await fetch('/api/admin/ai/generate-blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: aiTopic,
          keywords: aiKeywords,
          productName: aiProduct,
          standardCode: aiStandard,
          imageUrl: aiImageUrl,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to generate content.')
      }

      // Populate form fields with generated data
      setValue('title', data.seo_title || '')
      setValue('slug', data.slug || '')
      setValue('excerpt', data.excerpt || '')
      setValue('content', data.body_html || '')
      setValue('metaTitle', data.seo_title || '')
      setValue('metaDescription', data.meta_description || '')
      setValue('coverImageAlt', data.cover_image_alt || '')
      setValue('category', data.category || 'Technical Guide')
      if (data.tags) {
        setValue('tags', data.tags)
      }
      if (data.faq) {
        setValue('faqJson', JSON.stringify(data.faq))
      }

      setQualityScore(data.qualityScore || 0)
      setQualityBreakdown(data.qualityBreakdown || null)

      message.success(`Generated successfully! Quality Score: ${data.qualityScore}/100`)
    } catch (error: any) {
      message.error(error.message || 'Generation failed. Please try again.')
    } finally {
      hide()
      setIsGenerating(false)
    }
  }

  // Handle standard manual/generated save
  const onSubmit = async (values: any) => {
    // Basic frontend checks
    if (!values.title) {
      message.error('Title is required')
      return
    }
    if (!values.slug) {
      message.error('Slug is required')
      return
    }

    // Convert date fields back to ISO date-time if filled
    const payload = {
      ...values,
      scheduledAt: values.scheduledAt ? `${values.scheduledAt}T09:00:00Z` : null,
      publishedAt: values.publishedAt ? `${values.publishedAt}T09:00:00Z` : (values.status === 'published' ? new Date().toISOString() : null),
      qualityScore: qualityScore,
    }

    const endpoint = blogId ? `/api/admin/blog/${blogId}` : '/api/admin/blog'
    const method = blogId ? 'PATCH' : 'POST'

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.detail ?? result.message ?? 'Blog post save failed.')
      
      message.success(blogId ? 'Blog post updated successfully.' : 'Blog post created successfully.')
      router.push('/admin/blog')
      router.refresh()
    } catch (error: any) {
      message.error(error.message || 'Blog post save failed.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Main Form Fields */}
      <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-2 space-y-6">
        <section className="card space-y-4 p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary">Core Content</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Title</span>
                <span className={`text-xs ${titleVal.length > 70 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {titleVal.length}/70 chars (Target: &le; 70)
                </span>
              </div>
              <input {...register('title')} className="input-base w-full" placeholder="Enter post title" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">Slug</span>
              <input {...register('slug')} className="input-base w-full" placeholder="url-friendly-slug" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Excerpt / Summary</span>
                <span className={`text-xs ${excerptVal.length > 300 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {excerptVal.length}/300 chars (Target: &le; 300)
                </span>
              </div>
              <textarea {...register('excerpt')} rows={3} className="input-base w-full" placeholder="Brief summary shown on blog cards..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">HTML Content Body</span>
              <textarea {...register('content')} rows={15} className="input-base w-full font-mono text-sm" placeholder="Write full article here. HTML tags allowed." />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Author Display Name</span>
              <input {...register('authorName')} className="input-base w-full" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Category</span>
              <input {...register('category')} className="input-base w-full" />
            </div>
          </div>
        </section>

        {/* Media & Tags */}
        <section className="card space-y-4 p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary">Media & Classification</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">Cover Image URL</span>
              <input {...register('coverImageUrl')} className="input-base w-full" placeholder="https://res.cloudinary.com/..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">Cover Image Alt Text</span>
              <input {...register('coverImageAlt')} className="input-base w-full" placeholder="Engineering view of industrial plant..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">Tags (comma-separated)</span>
              <input
                defaultValue={tagsVal.join(', ')}
                onChange={(e) => setValue('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))}
                className="input-base w-full"
                placeholder="compliance, safety, chemicals"
              />
            </div>
          </div>
        </section>

        {/* SEO Metadata */}
        <section className="card space-y-4 p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary">SEO & Social Meta</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Meta Title</span>
                <span className={`text-xs ${metaTitleVal.length > 70 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {metaTitleVal.length}/70 chars
                </span>
              </div>
              <input {...register('metaTitle')} className="input-base w-full" placeholder="Search engine title card" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-text-secondary">Meta Description</span>
                <span className={`text-xs ${metaDescVal.length > 160 ? 'text-red-400 font-bold' : 'text-text-muted'}`}>
                  {metaDescVal.length}/160 chars
                </span>
              </div>
              <textarea {...register('metaDescription')} rows={3} className="input-base w-full" placeholder="Search engine results snippet..." />
            </div>

            <div className="space-y-2 md:col-span-2">
              <span className="text-sm font-medium text-text-secondary">FAQ JSON List</span>
              <textarea {...register('faqJson')} rows={4} className="input-base w-full font-mono text-sm" placeholder='[{"question":"...", "answer":"..."}]' />
            </div>
          </div>
        </section>

        {/* Publishing Status & Scheduling */}
        <section className="card space-y-4 p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary">Publish Settings</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Publish Status</span>
              <select {...register('status')} className="input-base w-full">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 flex items-center pt-8 pl-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...register('isFeatured')} className="rounded border-surface-border text-amber-500 focus:ring-amber-500 bg-surface/50 h-4 w-4" />
                <span className="text-sm font-medium text-text-secondary">Pin to homepage Hero</span>
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Scheduled Date (UTC)</span>
              <input {...register('scheduledAt')} type="date" className="input-base w-full" />
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-text-secondary">Manual Published Date (Optional)</span>
              <input {...register('publishedAt')} type="date" className="input-base w-full" />
            </div>
          </div>
        </section>

        <div className="flex gap-4">
          <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-surface font-semibold shadow-md transition disabled:opacity-50">
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            {blogId ? 'Update Article' : 'Create Article'}
          </button>
          
          <button type="button" onClick={() => router.push('/admin/blog')} className="px-6 py-3 rounded-2xl border border-surface-border hover:bg-surface/20 text-text-secondary font-medium transition">
            Cancel
          </button>
        </div>
      </form>

      {/* AI Assistant Sidebar & Quality Engine */}
      <div className="space-y-6">
        {/* Content Quality Audit widget */}
        <section className="card p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card">
          <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-amber-400" />
            Content Audit Engine
          </h3>

          <div className="text-center py-6 border-b border-surface-border mb-4">
            <span className="text-xs text-text-muted uppercase tracking-wider block mb-1">Quality Score</span>
            <div className={`text-5xl font-black ${qualityScore >= 80 ? 'text-emerald-400' : qualityScore >= 65 ? 'text-amber-400' : 'text-red-400'}`}>
              {qualityScore}
              <span className="text-lg text-text-muted font-normal">/100</span>
            </div>
            
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface/50">
              {qualityScore >= 80 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400">Ready to Publish</span>
                </>
              ) : qualityScore >= 65 ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="text-amber-400">Draft Compliant (Min 65)</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-red-400">Needs Attention</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-3 text-sm text-text-secondary">
            <div className="flex justify-between">
              <span>Word Count Target:</span>
              <span className="font-medium text-text-primary">1500 - 2800</span>
            </div>
            <div className="flex justify-between">
              <span>Headings Structure:</span>
              <span className="font-medium text-text-primary">Min 4 H2, 2 H3</span>
            </div>
            <div className="flex justify-between">
              <span>Internal Links (Products):</span>
              <span className="font-medium text-text-primary">Min 3 links</span>
            </div>
            <div className="flex justify-between">
              <span>Authority Standards Refs:</span>
              <span className="font-medium text-text-primary">KEBS, GHS, ISO</span>
            </div>
          </div>

          {qualityBreakdown && (
            <div className="mt-4 pt-4 border-t border-surface-border space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">Dimension Scores</h4>
              {Object.entries(qualityBreakdown).map(([key, val]: any) => (
                <div key={key} className="flex justify-between text-xs">
                  <span className="capitalize text-text-muted">{key.replace('_', ' ')}:</span>
                  <span className="font-medium text-text-primary">{val} pts</span>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* AI Co-Pilot / Generator Panel */}
        <section className="card p-6 bg-surface-card border border-surface-border rounded-3xl shadow-card relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Sparkles className="h-24 w-24 text-amber-400" />
          </div>

          <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-400" />
            AI Content Co-Pilot
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Leverage OpenAI to auto-generate engineering articles fully compliant with GHS, ISO, and KEBS guidelines.
          </p>

          <div className="space-y-4 relative">
            <div className="space-y-1">
              <span className="text-xs font-medium text-text-secondary">Topic Prompt / Subject</span>
              <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} className="input-base w-full text-xs" placeholder="e.g. Sodium Hypochlorite safety standards" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-text-secondary">Keywords (comma-separated)</span>
              <input value={aiKeywords} onChange={(e) => setAiKeywords(e.target.value)} className="input-base w-full text-xs" placeholder="e.g. water purification, dosing, KEBS" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-text-secondary">Target Product Link</span>
              <select value={aiProduct} onChange={(e) => setAiProduct(e.target.value)} className="input-base w-full text-xs">
                <option value="">-- Optional Product Focus --</option>
                {products.map((p) => (
                  <option key={p.id} value={p.name}>{p.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-text-secondary">Target Compliance Standard</span>
              <input value={aiStandard} onChange={(e) => setAiStandard(e.target.value)} className="input-base w-full text-xs" placeholder="e.g. ISO 9001:2015, KS 04-136" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-text-secondary">Reference Context Image URL</span>
              <input value={aiImageUrl} onChange={(e) => setAiImageUrl(e.target.value)} className="input-base w-full text-xs" placeholder="https://cloudinary.com/... (optional)" />
            </div>

            <button
              type="button"
              onClick={handleAiGenerate}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-600 text-surface font-semibold text-sm shadow-md hover:shadow-lg transition-all duration-150 disabled:opacity-60"
            >
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {isGenerating ? 'Generating Post...' : 'Generate with OpenAI'}
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
