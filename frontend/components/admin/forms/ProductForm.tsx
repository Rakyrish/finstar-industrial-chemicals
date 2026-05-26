'use client'

import { useState, useMemo } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2, Wand2, Upload, Link as LinkIcon, ChevronDown } from 'lucide-react'
import { z } from 'zod'
import type { AdminProductDraft } from '@/types/admin'
import { useAdminToast } from '../AdminToastProvider'
import { adminApiRequest, useAdminResource } from '@/lib/admin/client'
import { cn } from '@/utils'

type ProductFormValues = AdminProductDraft & {
  specifications?: Array<{ key: string; value: string }>
  applications?: string[]
  benefits?: string[]
  features?: string[]
  industriesServed?: string[]
  faqs?: Array<{ q: string; a: string }>
}

const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  shortDescription: z.string().max(200).optional(),
  description: z.string().optional(),
  longDescription: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  applications: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  industriesServed: z.array(z.string()).optional(),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })).optional(),
  casNumber: z.string().optional(),
  chemicalFormula: z.string().optional(),
  purity: z.string().optional(),
  appearance: z.string().optional(),
  density: z.string().optional(),
  packagingType: z.string().optional(),
  pricing: z.string().optional(),
  minOrderQuantity: z.coerce.number().optional(),
  unitOfMeasure: z.string().optional(),
  cloudinaryUrl: z.string().optional(),
  cloudinaryPublicId: z.string().optional(),
  imageAlt: z.string().max(125).optional(),
  imageTitle: z.string().max(125).optional(),
  imageCaption: z.string().max(255).optional(),
  seoTitle: z.string().max(70).optional(),
  seoDescription: z.string().max(160).optional(),
  seoKeywords: z.string().optional(),
  ogTitle: z.string().max(95).optional(),
  ogDescription: z.string().max(200).optional(),
  twitterDescription: z.string().max(200).optional(),
  whatsappTemplate: z.string().optional(),
  quotationTemplate: z.string().optional(),
  ctaContent: z.string().optional(),
  status: z.enum(['draft', 'active', 'scheduled', 'out_of_stock', 'discontinued']).optional(),
  isFeatured: z.boolean().optional(),
  isNew: z.boolean().optional(),
  publishAt: z.string().optional(),
  hazardClassification: z.string().optional(),
})

const defaultValues: ProductFormValues = {
  name: '',
  slug: '',
  status: 'draft',
  isFeatured: false,
  isNew: true,
  applications: [],
  benefits: [],
  features: [],
  industriesServed: [],
  faqs: [{ q: '', a: '' }],
  specifications: [{ key: '', value: '' }],
  tags: [],
  unitOfMeasure: 'KG',
}

type ImageUploadMode = 'file' | 'url'

export default function ProductForm({ productId }: { productId?: string } = {}) {
  const [imageUploadMode, setImageUploadMode] = useState<ImageUploadMode>('file')
  const [imageUrl, setImageUrl] = useState('')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiGenerationStep, setAiGenerationStep] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    content: true,
    seo: false,
    ai: false,
  })
  
  const { toast } = useAdminToast()
  const { data: categoriesData } = useAdminResource<any>('categories', { results: [], count: 0 })
  const { register, control, handleSubmit, setValue, getValues, watch, formState: { errors, isSubmitting } } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  const applicationsFields = useFieldArray({ control, name: 'applications' })
  const benefitsFields = useFieldArray({ control, name: 'benefits' })
  const featuresFields = useFieldArray({ control, name: 'features' })
  const industriesFields = useFieldArray({ control, name: 'industriesServed' })
  const faqsFields = useFieldArray({ control, name: 'faqs' })
  const specsFields = useFieldArray({ control, name: 'specifications' })

  const watchedValues = watch()

  // Calculate SEO score
  const { seoScore, seoIssues } = useMemo(() => {
    let score = 0
    const issues: string[] = []
    const seoTitle = watchedValues.seoTitle || ''
    const seoDesc = watchedValues.seoDescription || ''
    const keywords = watchedValues.seoKeywords || ''
    const hasImage = !!watchedValues.cloudinaryUrl
    const hasAlt = !!watchedValues.imageAlt
    const hasFaqs = (watchedValues.faqs?.length || 0) > 0

    if (seoTitle.length >= 50 && seoTitle.length <= 70) score += 20
    else if (seoTitle.length < 50) issues.push('Meta title too short')
    else issues.push('Meta title too long')

    if (seoDesc.length >= 120 && seoDesc.length <= 160) score += 20
    else if (seoDesc.length < 120) issues.push('Meta description too short')
    else issues.push('Meta description too long')

    if (keywords) score += 15
    else issues.push('Add SEO keywords')

    if (hasImage && hasAlt) score += 25
    else if (hasImage && !hasAlt) { score += 10; issues.push('Missing image alt text') }
    else issues.push('No image uploaded')

    if (hasFaqs) score += 20
    else issues.push('Add FAQs for better ranking')

    return {
      seoScore: Math.min(100, score),
      seoIssues: issues
    }
  }, [
    watchedValues.seoTitle,
    watchedValues.seoDescription,
    watchedValues.seoKeywords,
    watchedValues.cloudinaryUrl,
    watchedValues.imageAlt,
    watchedValues.faqs?.length
  ])

  const handleImageUpload = async (file: File) => {
    setIsUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const response = await fetch('/api/admin/upload-image', { method: 'POST', body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      setValue('cloudinaryUrl', data.url)
      setValue('cloudinaryPublicId', data.public_id)
      setImagePreview(data.url)
      setImageUrl('')
      toast({ title: 'Image uploaded', description: 'Image is ready.', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'error' })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleImageUrlUpload = async () => {
    if (!imageUrl.startsWith('http')) {
      toast({ title: 'Invalid URL', description: 'Please enter a valid image URL', variant: 'error' })
      return
    }
    setIsUploadingImage(true)
    try {
      const response = await fetch('/api/admin/upload-image-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      setValue('cloudinaryUrl', data.url)
      setValue('cloudinaryPublicId', data.public_id)
      setImagePreview(data.url)
      toast({ title: 'Image uploaded', description: 'Image is ready.', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Upload failed', description: err.message, variant: 'error' })
    } finally {
      setIsUploadingImage(false)
    }
  }

  const handleGenerateContent = async () => {
    const productName = getValues('name')
    if (!productName) {
      toast({ title: 'Name required', description: 'Enter a product name first', variant: 'error' })
      return
    }
    const cloudinaryUrl = getValues('cloudinaryUrl')
    if (!cloudinaryUrl) {
      toast({ title: 'Image required', description: 'Upload an image first', variant: 'error' })
      return
    }
    setIsGenerating(true)
    setShowAiPanel(true)
    try {
      setAiGenerationStep('Analyzing product...')
      const data = await adminApiRequest<any>('/ai/generate-product/', 'POST', { productName, imageUrl: cloudinaryUrl })
      setAiGenerationStep('Populating fields...')
      if (data.short_description) setValue('shortDescription', data.short_description)
      if (data.long_description) setValue('longDescription', data.long_description)
      if (data.seo_title) setValue('seoTitle', data.seo_title)
      if (data.seo_meta_description) setValue('seoDescription', data.seo_meta_description)
      if (data.seo_keywords) setValue('seoKeywords', data.seo_keywords.join(', '))
      if (data.og_description) setValue('ogDescription', data.og_description)
      if (data.twitter_description) setValue('twitterDescription', data.twitter_description)
      if (data.image_alt) setValue('imageAlt', data.image_alt)
      if (data.image_title) setValue('imageTitle', data.image_title)
      if (data.image_caption) setValue('imageCaption', data.image_caption)
      if (data.whatsapp_template) setValue('whatsappTemplate', data.whatsapp_template)
      if (data.quotation_template) setValue('quotationTemplate', data.quotation_template)
      if (data.cta_content) setValue('ctaContent', data.cta_content)
      if (data.applications) setValue('applications', data.applications)
      if (data.benefits) setValue('benefits', data.benefits)
      if (data.features) setValue('features', data.features)
      if (data.industries_served) setValue('industriesServed', data.industries_served)
      if (data.faqs) setValue('faqs', data.faqs)
      if (data.technical_specifications) {
        const specs = data.technical_specifications.map((s: any) => ({ key: s.key, value: s.value }))
        setValue('specifications', specs)
      }
      setAiGenerationStep('')
      toast({ title: 'Success', description: 'All fields populated from AI analysis', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Generation failed', description: err.message, variant: 'error' })
      setAiGenerationStep('')
    } finally {
      setIsGenerating(false)
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const method = productId ? 'PATCH' : 'POST'
      const endpoint = productId ? `/admin/products/${productId}/` : '/admin/products/'
      await adminApiRequest(endpoint, method as any, data)
      toast({ title: 'Success', description: productId ? 'Product updated' : 'Product created', variant: 'success' })
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'error' })
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* Main Column */}
      <div className="space-y-6">
        {/* Product Identity */}
        <section className="card p-6 space-y-4">
          <h3 className="text-lg font-bold">Product Details</h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Product Name *</label>
              <input {...register('name')} className="input w-full mt-1" placeholder="e.g., Sulfuric Acid 98%" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium">Slug (URL-friendly) *</label>
              <input {...register('slug')} className="input w-full mt-1" placeholder="e.g., sulfuric-acid-98" />
            </div>
            <div>
              <label className="text-sm font-medium">Short Description</label>
              <input {...register('shortDescription')} maxLength={200} className="input w-full mt-1" placeholder="Max 200 chars" />
              <p className="text-xs text-gray-500 mt-1">{(watchedValues.shortDescription?.length || 0)}/200</p>
            </div>
            <div>
              <label className="text-sm font-medium">Long Description</label>
              <textarea {...register('longDescription')} rows={5} className="input w-full mt-1" placeholder="Detailed product description..." />
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <section className="card p-6">
          <button type="button" onClick={() => toggleSection('content')} className="flex items-center justify-between w-full mb-4">
            <h3 className="text-lg font-bold">Content & Engagement</h3>
            <ChevronDown className={cn('h-4 w-4 transition', expandedSections.content && 'rotate-180')} />
          </button>
          {expandedSections.content && (
            <div className="space-y-4">
              {[
                { name: 'applications', label: 'Applications', fields: applicationsFields },
                { name: 'benefits', label: 'Benefits', fields: benefitsFields },
                { name: 'features', label: 'Features', fields: featuresFields },
                { name: 'industriesServed', label: 'Industries Served', fields: industriesFields },
              ].map(({ name, label, fields }) => (
                <div key={name}>
                  <label className="text-sm font-medium">{label}</label>
                  <div className="space-y-2 mt-2">
                    {(fields.fields || []).map((field, i) => (
                      <div key={field.id} className="flex gap-2">
                        <input {...register(`${name}.${i}` as any)} className="input flex-1" placeholder={`Add ${label.toLowerCase()}`} />
                        <button type="button" onClick={() => fields.remove(i)} className="btn-ghost text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={() => fields.append('')} className="btn btn-sm mt-2">
                    <Plus className="h-3 w-3 mr-1" /> Add
                  </button>
                </div>
              ))}

              {/* FAQs */}
              <div>
                <label className="text-sm font-medium">FAQs</label>
                <div className="space-y-3 mt-2">
                  {(faqsFields.fields || []).map((field, i) => (
                    <div key={field.id} className="border rounded-lg p-3 space-y-2">
                      <input {...register(`faqs.${i}.q`)} className="input w-full" placeholder="Question" />
                      <textarea {...register(`faqs.${i}.a`)} rows={2} className="input w-full" placeholder="Answer" />
                      <button type="button" onClick={() => faqsFields.remove(i)} className="btn-ghost btn-sm text-red-500">
                        <Trash2 className="h-3 w-3 mr-1" /> Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => faqsFields.append({ q: '', a: '' })} className="btn btn-sm mt-2">
                  <Plus className="h-3 w-3 mr-1" /> Add FAQ
                </button>
              </div>

              {/* Technical Specs */}
              <div>
                <label className="text-sm font-medium">Technical Specifications</label>
                <div className="space-y-2 mt-2">
                  {(specsFields.fields || []).map((field, i) => (
                    <div key={field.id} className="grid grid-cols-2 gap-2">
                      <input {...register(`specifications.${i}.key`)} className="input" placeholder="Key" />
                      <div className="flex gap-2">
                        <input {...register(`specifications.${i}.value`)} className="input flex-1" placeholder="Value" />
                        <button type="button" onClick={() => specsFields.remove(i)} className="btn-ghost text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => specsFields.append({ key: '', value: '' })} className="btn btn-sm mt-2">
                  <Plus className="h-3 w-3 mr-1" /> Add
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Logistics */}
        <section className="card p-6 space-y-4">
          <h3 className="text-lg font-bold">Logistics & Pricing</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium">Packaging Type</label>
              <input {...register('packagingType')} className="input w-full mt-1" placeholder="e.g., 25kg bags" />
            </div>
            <div>
              <label className="text-sm font-medium">Pricing</label>
              <input {...register('pricing')} className="input w-full mt-1" placeholder="e.g., Contact for quote" />
            </div>
            <div>
              <label className="text-sm font-medium">Min. Order Quantity</label>
              <input {...register('minOrderQuantity', { valueAsNumber: true })} type="number" className="input w-full mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">Unit of Measure</label>
              <select {...register('unitOfMeasure')} className="input w-full mt-1">
                <option value="KG">Kilograms</option>
                <option value="L">Liters</option>
                <option value="GAL">Gallons</option>
                <option value="TON">Metric Tons</option>
              </select>
            </div>
          </div>
        </section>

        {/* Chemical Properties */}
        <section className="card p-6 space-y-4">
          <h3 className="text-lg font-bold">Chemical Properties</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <input {...register('casNumber')} className="input" placeholder="CAS Number" />
            <input {...register('chemicalFormula')} className="input" placeholder="Chemical Formula" />
            <input {...register('purity')} className="input" placeholder="Purity (e.g., 99.9%)" />
            <input {...register('appearance')} className="input" placeholder="Appearance" />
            <input {...register('density')} className="input" placeholder="Density (g/mL)" />
            <input {...register('hazardClassification')} className="input" placeholder="Hazard Classification" />
          </div>
        </section>

        {/* Engagement Templates */}
        <section className="card p-6 space-y-4">
          <h3 className="text-lg font-bold">Customer Engagement</h3>
          <div>
            <label className="text-sm font-medium">WhatsApp Template</label>
            <textarea {...register('whatsappTemplate')} rows={3} className="input w-full mt-1" placeholder="Default WhatsApp message template" />
          </div>
          <div>
            <label className="text-sm font-medium">Quotation Template</label>
            <textarea {...register('quotationTemplate')} rows={3} className="input w-full mt-1" placeholder="Default quote request template" />
          </div>
          <div>
            <label className="text-sm font-medium">CTA Content</label>
            <input {...register('ctaContent')} className="input w-full mt-1" placeholder="Call-to-action text" />
          </div>
        </section>

        {/* SEO Panel */}
        <section className="card p-6">
          <button type="button" onClick={() => toggleSection('seo')} className="flex items-center justify-between w-full mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold">SEO Optimization</h3>
              <div className="text-xs px-2 py-1 rounded-full text-white" style={{ backgroundColor: seoScore >= 70 ? '#10b981' : seoScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                {seoScore}/100
              </div>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition', expandedSections.seo && 'rotate-180')} />
          </button>
          {expandedSections.seo && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Meta Title (70 chars max)</label>
                <input {...register('seoTitle')} maxLength={70} className="input w-full mt-1" />
                <p className="text-xs text-gray-500 mt-1">{(watchedValues.seoTitle?.length || 0)}/70</p>
              </div>
              <div>
                <label className="text-sm font-medium">Meta Description (160 chars max)</label>
                <textarea {...register('seoDescription')} maxLength={160} rows={2} className="input w-full mt-1" />
                <p className="text-xs text-gray-500 mt-1">{(watchedValues.seoDescription?.length || 0)}/160</p>
              </div>
              <div>
                <label className="text-sm font-medium">SEO Keywords</label>
                <input {...register('seoKeywords')} className="input w-full mt-1" placeholder="Comma-separated keywords" />
              </div>
              <div>
                <label className="text-sm font-medium">OpenGraph Title (95 chars max)</label>
                <input {...register('ogTitle')} maxLength={95} className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">OpenGraph Description (200 chars max)</label>
                <textarea {...register('ogDescription')} maxLength={200} rows={2} className="input w-full mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Twitter Description (200 chars max)</label>
                <textarea {...register('twitterDescription')} maxLength={200} rows={2} className="input w-full mt-1" />
              </div>
              {seoIssues.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-yellow-900 mb-2">SEO Recommendations:</p>
                  <ul className="text-xs text-yellow-800 space-y-1">
                    {seoIssues.map((issue, i) => (<li key={i}>• {issue}</li>))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </section>
      </div>

      {/* Sidebar */}
      <div className="space-y-6 lg:sticky lg:top-6 lg:h-fit">
        {/* Publish Panel */}
        <section className="card p-4 space-y-3">
          <h3 className="font-bold text-sm">Publish</h3>
          <div>
            <label className="text-xs font-medium">Status</label>
            <select {...register('status')} className="input w-full text-sm mt-1">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="out_of_stock">Out of Stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
          {watchedValues.status === 'scheduled' && (
            <div>
              <label className="text-xs font-medium">Publish Date</label>
              <input {...register('publishAt')} type="datetime-local" className="input w-full text-sm mt-1" />
            </div>
          )}
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input {...register('isFeatured')} type="checkbox" className="h-4 w-4" /> Featured Product
          </label>
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input {...register('isNew')} type="checkbox" className="h-4 w-4" /> Mark as New
          </label>
          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-sm w-full">
            {isSubmitting ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : null}
            Save {watchedValues.status || 'Draft'}
          </button>
        </section>

        {/* Organization Panel */}
        <section className="card p-4 space-y-3">
          <h3 className="font-bold text-sm">Organization</h3>
          <div>
            <label className="text-xs font-medium">Category</label>
            <select {...register('category')} className="input w-full text-sm mt-1">
              <option value="">Select a category...</option>
              {categoriesData?.results?.map((cat: any) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Tags (comma separated)</label>
            <input 
              className="input w-full text-sm mt-1" 
              placeholder="e.g. industrial, reagent"
              value={watchedValues.tags?.join(', ') || ''}
              onChange={(e) => {
                const vals = e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                setValue('tags', vals)
              }}
            />
          </div>
        </section>

        {/* Image Upload Panel */}
        <section className="card p-4 space-y-3">
          <h3 className="font-bold text-sm">Product Image</h3>
          {imagePreview && (
            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
              <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="flex gap-2 border-b">
            <button type="button" onClick={() => setImageUploadMode('file')} className={cn('text-xs py-2 px-2 border-b-2 transition', imageUploadMode === 'file' ? 'border-amber-400 text-amber-400' : 'border-transparent')}>
              <Upload className="h-3 w-3 inline mr-1" /> Upload
            </button>
            <button type="button" onClick={() => setImageUploadMode('url')} className={cn('text-xs py-2 px-2 border-b-2 transition', imageUploadMode === 'url' ? 'border-amber-400 text-amber-400' : 'border-transparent')}>
              <LinkIcon className="h-3 w-3 inline mr-1" /> URL
            </button>
          </div>
          {imageUploadMode === 'file' ? (
            <label className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer">
              <input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f) }} className="hidden" disabled={isUploadingImage} />
              {isUploadingImage ? (<Loader2 className="h-6 w-6 animate-spin mx-auto text-amber-400" />) : (<div><Upload className="h-6 w-6 mx-auto mb-1" /><p className="text-xs text-gray-500">Drag or click to upload</p></div>)}
            </label>
          ) : (
            <div className="space-y-2">
              <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="input w-full text-sm" disabled={isUploadingImage} />
              <button type="button" onClick={handleImageUrlUpload} disabled={isUploadingImage || !imageUrl} className="btn btn-sm btn-secondary w-full text-xs">
                {isUploadingImage ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null} Upload
              </button>
            </div>
          )}
          {watchedValues.cloudinaryUrl && (
            <div className="space-y-2">
              <input {...register('imageAlt')} maxLength={125} className="input w-full text-xs" placeholder="Alt text" />
              <input {...register('imageTitle')} maxLength={125} className="input w-full text-xs" placeholder="Title" />
              <input {...register('imageCaption')} maxLength={255} className="input w-full text-xs" placeholder="Caption" />
            </div>
          )}
        </section>

        {/* AI Panel */}
        <section className="card p-4 space-y-3 border-amber-200 bg-amber-50">
          <button type="button" onClick={() => setShowAiPanel(!showAiPanel)} className="flex items-center justify-between w-full">
            <h3 className="font-bold text-sm">AI Assistant</h3>
            <ChevronDown className={cn('h-4 w-4 transition', showAiPanel && 'rotate-180')} />
          </button>
          {showAiPanel && (
            <>
              <button type="button" onClick={handleGenerateContent} disabled={isGenerating || !watchedValues.name || !watchedValues.cloudinaryUrl} className="btn btn-amber btn-sm w-full text-xs">
                {isGenerating ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Wand2 className="h-3 w-3 mr-1" />}
                Generate
              </button>
              {aiGenerationStep && (<div className="text-xs text-amber-800 bg-white p-2 rounded">⏳ {aiGenerationStep}</div>)}
              <p className="text-xs text-amber-800">AI will generate all SEO, content, and engagement fields.</p>
            </>
          )}
        </section>
      </div>
    </form>
  )
}