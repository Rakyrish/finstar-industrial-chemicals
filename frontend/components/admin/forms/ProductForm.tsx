'use client'

import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import { Check, ImagePlus, Loader2, Plus, Search, Sparkles, Upload, X } from 'lucide-react'
import type { AdminListResponse, AdminProductDraft } from '@/types/admin'
import { adminApiRequest, useAdminResource } from '@/lib/admin/client'
import { cn } from '@/utils'

type CategoryOption = { id: number; name: string; slug: string; description?: string; seoTitle?: string; seoDescription?: string; seoKeywords?: string }
type Spec = { key: string; value: string }
type Faq = { q: string; a: string }

type ProductFormValues = AdminProductDraft & {
  category?: string
  tags?: string[]
  specifications?: Spec[]
  faqs?: Faq[]
}

const BLOCKED_AI_SPEC_KEYS = ['assay', 'concentration', 'density', 'purity', 'specific gravity']

const FINSTAR_CATEGORY_OPTIONS = [
  { name: 'Building and Architecture', slug: 'building-and-architecture' },
  { name: 'Ceramics', slug: 'ceramics' },
  { name: 'Cleaning & Disinfection Chemicals', slug: 'cleaning-disinfection-chemicals' },
  { name: 'Dyes Colors and Candles', slug: 'dyes-colors-and-candles' },
  { name: 'Farming Chemicals', slug: 'farming-chemicals' },
  { name: 'Food & Pharmaceutical Ingredients', slug: 'food-pharmaceutical-ingredients' },
  { name: 'Food and Beverages', slug: 'food-and-beverages' },
  { name: 'Fragrances', slug: 'fragrances' },
  { name: 'Industrial Additives & Coating Chemicals', slug: 'industrial-additives-coating-chemicals' },
  { name: 'Industrial Binders & Alkyd Resins', slug: 'industrial-binders-alkyd-resins' },
  { name: 'Industrial Chemicals', slug: 'industrial-chemicals' },
  { name: 'Lubricants & Greases', slug: 'lubricants-greases' },
  { name: 'Micronutrients and Fertilizers', slug: 'micronutrients-and-fertilizers' },
  { name: 'Agricultural Chemicals', slug: 'agricultural-chemicals' },
  { name: 'Mining and metal processing', slug: 'mining-and-metal-processing' },
  { name: 'Paints ink and coatings', slug: 'paints-ink-and-coatings' },
  { name: 'Pharmaceuticals', slug: 'pharmaceuticals' },
  { name: 'Pigments & Dyes', slug: 'pigments-dyes' },
  { name: 'Plastic Rubber & PVC Products', slug: 'plastic-rubber-pvc-products' },
  { name: 'Rubber & Plastic Industry Chemicals', slug: 'rubber-plastic-industry-chemicals' },
  { name: 'Skin and Cosmetics', slug: 'skin-and-cosmetics' },
  { name: 'Soaps and Detergents', slug: 'soaps-and-detergents' },
  { name: 'Solvents', slug: 'solvents' },
  { name: 'Solvents & Thinners', slug: 'solvents-thinners' },
  { name: 'Specialty Chemicals', slug: 'specialty-chemicals' },
  { name: 'Textile, Rubber, and Leather Processing', slug: 'texting-rubber-and-leather-processing' },
  { name: 'Water treatment', slug: 'water-treatment' },
]

const emptyProduct: ProductFormValues = {
  name: '',
  slug: '',
  status: 'draft',
  category: '',
  tags: [],
  applications: [],
  benefits: [],
  features: [],
  industriesServed: [],
  specifications: [],
  faqs: [],
  isFeatured: false,
  isNew: true,
  unitOfMeasure: 'KG',
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function listFrom(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : []
}

function specsFrom(value: unknown): Spec[] {
  return Array.isArray(value)
    ? value
        .map((item: any) => ({ key: String(item.key ?? ''), value: String(item.value ?? '') }))
        .filter((item) => item.key || item.value)
        .filter((item) => !BLOCKED_AI_SPEC_KEYS.some((blocked) => item.key.toLowerCase().includes(blocked)))
    : []
}

function faqsFrom(value: unknown): Faq[] {
  return Array.isArray(value) ? value.map((item: any) => ({ q: String(item.q ?? ''), a: String(item.a ?? '') })).filter((item) => item.q || item.a) : []
}

function normalizeInitial(data?: AdminProductDraft): ProductFormValues {
  if (!data) return emptyProduct
  const raw = data as any
  return {
    ...emptyProduct,
    ...data,
    shortDescription: raw.shortDescription ?? raw.short_description ?? '',
    longDescription: raw.longDescription ?? raw.long_description ?? raw.description ?? '',
    category: typeof raw.category === 'string' ? raw.category : raw.category?.name ?? '',
    tags: Array.isArray(raw.tags) ? raw.tags.map((tag: any) => (typeof tag === 'string' ? tag : tag.name)).filter(Boolean) : [],
    applications: listFrom(raw.applications),
    benefits: listFrom(raw.benefits),
    features: listFrom(raw.features),
    industriesServed: listFrom(raw.industriesServed ?? raw.industries_served),
    specifications: specsFrom(raw.specifications),
    faqs: faqsFrom(raw.faqs),
    minOrderQuantity: raw.minOrderQuantity ?? raw.min_order_quantity ?? 1,
    unitOfMeasure: raw.unitOfMeasure ?? raw.unit_of_measure ?? 'KG',
    packagingType: raw.packagingType ?? raw.packaging_type ?? '',
    casNumber: raw.casNumber ?? raw.cas_number ?? '',
    chemicalFormula: raw.chemicalFormula ?? raw.chemical_formula ?? '',
    hazardClassification: raw.hazardClassification ?? raw.hazard_classification ?? '',
    cloudinaryUrl: raw.cloudinaryUrl ?? raw.cloudinary_url ?? raw.primaryImage ?? '',
    cloudinaryPublicId: raw.cloudinaryPublicId ?? raw.cloudinary_public_id ?? '',
    seoTitle: raw.seoTitle ?? raw.seo_title ?? '',
    seoDescription: raw.seoDescription ?? raw.seo_description ?? '',
    seoKeywords: raw.seoKeywords ?? raw.seo_keywords ?? '',
    ogDescription: raw.ogDescription ?? raw.og_description ?? '',
    twitterDescription: raw.twitterDescription ?? raw.twitter_description ?? '',
    imageAlt: raw.imageAlt ?? raw.image_alt ?? '',
    imageTitle: raw.imageTitle ?? raw.image_title ?? '',
    imageCaption: raw.imageCaption ?? raw.image_caption ?? '',
    schemaMarkup: raw.schemaMarkup ?? raw.schema_markup ?? undefined,
    isFeatured: Boolean(raw.isFeatured ?? raw.is_featured),
    isNew: Boolean(raw.isNew ?? raw.is_new ?? true),
  }
}

function mapGenerated(data: any): Partial<ProductFormValues> {
  const productName = data.product_name ?? data.name ?? ''
  return {
    name: productName,
    slug: data.seo_slug ?? slugify(productName),
    shortDescription: data.short_description ?? '',
    longDescription: data.long_description ?? '',
    seoTitle: data.seo_title ?? '',
    seoDescription: data.seo_meta_description ?? '',
    seoKeywords: Array.isArray(data.seo_keywords) ? data.seo_keywords.join(', ') : data.seo_keywords ?? '',
    tags: listFrom(data.product_tags),
    features: listFrom(data.features),
    benefits: listFrom(data.benefits),
    applications: listFrom(data.applications),
    industriesServed: listFrom(data.industries_served),
    specifications: specsFrom(data.technical_specifications),
    faqs: faqsFrom(data.faqs),
    ogDescription: data.og_description ?? '',
    twitterDescription: data.twitter_description ?? '',
    imageAlt: data.image_alt ?? '',
    imageTitle: data.image_title ?? '',
    imageCaption: data.image_caption ?? '',
    whatsappTemplate: data.whatsapp_template ?? '',
    quotationTemplate: data.quotation_template ?? '',
    ctaContent: data.cta_content ?? '',
    schemaMarkup: data.schema_markup,
    hazardClassification: listFrom(data.safety_considerations).join('\n'),
  }
}

function resetProductForm(): ProductFormValues {
  return {
    ...emptyProduct,
    tags: [],
    applications: [],
    benefits: [],
    features: [],
    industriesServed: [],
    specifications: [],
    faqs: [],
  }
}

function categorySeoDefaults(name: string, productKeywords = '') {
  const trimmed = name.trim()
  return {
    name: trimmed,
    slug: slugify(trimmed),
    description: `Browse ${trimmed} from Finstar Industrial Chemicals for industrial buyers in Kenya, Uganda, Tanzania, and Rwanda.`,
    seoTitle: `${trimmed} in Kenya, Uganda, Tanzania & Rwanda | Finstar`,
    seoDescription: `Find ${trimmed} from Finstar Industrial Chemicals for B2B procurement, industrial sourcing, and quote requests across Kenya, Uganda, Tanzania, and Rwanda.`,
    seoKeywords: [trimmed, `${trimmed} Kenya`, `${trimmed} Uganda`, `${trimmed} Tanzania`, `${trimmed} Rwanda`, productKeywords]
      .filter(Boolean)
      .join(', '),
  }
}

function mergeCategoryOptions(savedCategories: CategoryOption[]) {
  const byName = new Map<string, CategoryOption>()

  FINSTAR_CATEGORY_OPTIONS.forEach((category, index) => {
    byName.set(category.name.toLowerCase(), {
      id: -(index + 1),
      ...categorySeoDefaults(category.name),
      slug: category.slug,
    })
  })

  savedCategories.forEach((category) => {
    byName.set(category.name.toLowerCase(), category)
  })

  return Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name))
}

function scoreSeo(form: ProductFormValues) {
  const issues: string[] = []
  let score = 0
  const titleLength = form.seoTitle?.length ?? 0
  const descLength = form.seoDescription?.length ?? 0

  if (titleLength >= 45 && titleLength <= 90) score += 15
  else issues.push('Tune SEO title to 45-90 characters.')
  if (descLength >= 120 && descLength <= 220) score += 15
  else issues.push('Tune meta description to 120-220 characters.')
  if (form.slug && form.slug.length > 4) score += 10
  else issues.push('Add an SEO-friendly slug.')
  if (form.imageAlt && form.imageAlt.length >= 20) score += 10
  else issues.push('Add descriptive image alt text.')
  if ((form.seoKeywords ?? '').split(',').filter((item) => item.trim()).length >= 3) score += 10
  else issues.push('Add primary and secondary SEO keywords.')
  if ((form.longDescription?.length ?? 0) >= 500) score += 15
  else issues.push('Expand the long description for topical depth.')
  if ((form.faqs?.length ?? 0) >= 2) score += 10
  else issues.push('Add SEO-focused FAQs.')
  if ((form.applications?.length ?? 0) && (form.benefits?.length ?? 0) && (form.features?.length ?? 0)) score += 10
  else issues.push('Complete features, benefits, and applications.')
  if (form.schemaMarkup) score += 5
  else issues.push('Add product schema data.')

  return { score: Math.min(score, 100), issues }
}

export default function ProductForm({ productId, initialData }: { productId?: string; initialData?: AdminProductDraft } = {}) {
  const { data: categoriesData } = useAdminResource<AdminListResponse<CategoryOption>>('categories', { results: [], count: 0 })
  const [form, setForm] = useState<ProductFormValues>(() => normalizeInitial(initialData))
  const [imageUrl, setImageUrl] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [imageStatus, setImageStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'uploading'>('idle')
  const [imageError, setImageError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [categorySearch, setCategorySearch] = useState('')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({ name: '', slug: '', description: '', seoTitle: '', seoDescription: '', seoKeywords: '' })

  useEffect(() => {
    const normalized = normalizeInitial(initialData)
    setForm(normalized)
    setPreviewUrl(normalized.cloudinaryUrl ?? '')
  }, [initialData])

  const categories = useMemo(() => mergeCategoryOptions(categoriesData?.results ?? []), [categoriesData?.results])
  const filteredCategories = categories.filter((category) => category.name.toLowerCase().includes(categorySearch.toLowerCase()))
  const visibleCategories = (categorySearch ? filteredCategories : categories).slice(0, 12)
  const hasExactCategoryMatch = categories.some((category) => category.name.toLowerCase() === (categorySearch || form.category || '').trim().toLowerCase())
  const seo = useMemo(() => scoreSeo(form), [form])
  const hasImage = Boolean(form.cloudinaryUrl || previewUrl || imageUrl)

  const patchForm = (updates: Partial<ProductFormValues>) => setForm((current) => ({ ...current, ...updates }))

  const updateList = (key: 'features' | 'benefits' | 'applications' | 'industriesServed', value: string) => {
    patchForm({ [key]: value.split('\n').map((item) => item.trim()).filter(Boolean) } as Partial<ProductFormValues>)
  }

  const validateUrl = (url: string) => {
    setImageUrl(url)
    patchForm({ cloudinaryUrl: '', cloudinaryPublicId: '' })
    setImageError('')
    if (!url.trim()) {
      setPreviewUrl('')
      setImageStatus('idle')
      return
    }
    try {
      new URL(url)
    } catch {
      setPreviewUrl('')
      setImageStatus('invalid')
      setImageError('Enter a valid direct image URL.')
      return
    }
    setPreviewUrl(url)
    setImageStatus('validating')
  }

  const handlePreviewLoaded = () => {
    if (imageStatus === 'validating') setImageStatus('valid')
  }

  const handlePreviewError = () => {
    if (imageStatus === 'validating' || imageUrl) {
      setImageStatus('invalid')
      setImageError('The image could not be loaded. Check the URL and try again.')
    }
  }

  const uploadFile = async (file: File) => {
    const localPreview = URL.createObjectURL(file)
    setPreviewUrl(localPreview)
    setImageError('')
    setImageStatus('uploading')
    const body = new FormData()
    body.append('image', file)
    try {
      const response = await fetch('/api/admin/upload', { method: 'POST', body, credentials: 'include' })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.detail ?? 'Image upload failed.')
      patchForm({ cloudinaryUrl: payload.url, cloudinaryPublicId: payload.public_id })
      setPreviewUrl(payload.url)
      setImageUrl('')
      setImageStatus('valid')
      message.success('Image uploaded. Cloudinary media is ready.')
    } catch (error: any) {
      setImageStatus('invalid')
      setImageError(error.message)
      message.error(error.message || 'Upload failed.')
    }
  }

  const importUrlToCloudinary = async () => {
    if (form.cloudinaryUrl) return form.cloudinaryUrl
    if (!imageUrl || imageStatus === 'invalid') throw new Error('Add a valid image URL first.')
    setImageStatus('uploading')
    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ imageUrl }),
    })
    const payload = await response.json()
    if (!response.ok) throw new Error(payload.detail ?? 'Image import failed.')
    patchForm({ cloudinaryUrl: payload.url, cloudinaryPublicId: payload.public_id })
    setPreviewUrl(payload.url)
    setImageStatus('valid')
    return payload.url as string
  }

  const generateProduct = async () => {
    if (!hasImage) {
      message.warning('Upload an image or paste a direct image URL first.')
      return
    }
    setIsGenerating(true)
    try {
      const cloudinaryUrl = form.cloudinaryUrl || await importUrlToCloudinary()
      const generated = await adminApiRequest<any>('/admin/ai/generate-product/', 'POST', { imageUrl: cloudinaryUrl })
      patchForm({ ...mapGenerated(generated), cloudinaryUrl })
      message.success('Product generated. Review the AI content and publish when ready.')
    } catch (error: any) {
      message.error(error.message || 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  const createCategory = async () => {
    if (!newCategory.name.trim()) return
    const defaults = categorySeoDefaults(newCategory.name, form.seoKeywords)
    const payload = {
      ...defaults,
      ...newCategory,
      slug: newCategory.slug || defaults.slug,
      description: newCategory.description || defaults.description,
      seoTitle: newCategory.seoTitle || defaults.seoTitle,
      seoDescription: newCategory.seoDescription || defaults.seoDescription,
      seoKeywords: newCategory.seoKeywords || defaults.seoKeywords,
    }
    try {
      const category = await adminApiRequest<CategoryOption>('/admin/categories/', 'POST', payload)
      patchForm({ category: category.name })
      setCategorySearch(category.name)
      setShowCategoryModal(false)
      setNewCategory({ name: '', slug: '', description: '', seoTitle: '', seoDescription: '', seoKeywords: '' })
      message.success(`${category.name} has been created and selected.`)
    } catch (error: any) {
      message.error(error.message || 'Category creation failed.')
    }
  }

  const saveProduct = async (status: ProductFormValues['status']) => {
    setIsSaving(true)
    try {
      const payload = { ...form, status, slug: form.slug || slugify(form.name) }
      const method = productId ? 'PATCH' : 'POST'
      const path = productId ? `/admin/products/${productId}/` : '/admin/products/'
      await adminApiRequest(path, method, payload)
      message.success(status === 'active' ? 'Product published.' : 'Product draft saved.')
      if (!productId) {
        setForm(resetProductForm())
        setImageUrl('')
        setPreviewUrl('')
        setImageStatus('idle')
        setImageError('')
        setCategorySearch('')
        message.info('Form cleared. You can add another product.')
      }
    } catch (error: any) {
      message.error(error.message || 'Save failed.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-6">
        <section className="card p-5">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">AI-first publishing</p>
              <h2 className="mt-1 text-xl font-bold text-text-primary">Start with a product image</h2>
              <p className="mt-1 text-sm text-text-secondary">Upload a file or paste an image URL, then let OpenAI draft the product profile.</p>
            </div>
            <button type="button" onClick={generateProduct} disabled={!hasImage || isGenerating || imageStatus === 'uploading' || imageStatus === 'invalid'} className="btn-primary justify-center disabled:cursor-not-allowed disabled:opacity-50">
              {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Product
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <label className="flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-surface/40 p-5 text-center transition hover:border-amber-500/50 hover:bg-surface-muted/40">
              <input type="file" accept="image/*" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadFile(file) }} />
              {previewUrl ? (
                <img src={previewUrl} alt={form.imageAlt || 'Product preview'} onLoad={handlePreviewLoaded} onError={handlePreviewError} className="h-full max-h-[260px] w-full rounded-lg object-contain" />
              ) : (
                <div className="space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                    <ImagePlus className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary">Upload product image</p>
                    <p className="text-sm text-text-muted">PNG, JPG, or WebP</p>
                  </div>
                </div>
              )}
            </label>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-text-primary">Paste product image URL</label>
                <div className="mt-2 flex gap-2">
                  <input value={imageUrl} onChange={(event) => validateUrl(event.target.value)} className="input w-full" placeholder="https://example.com/product-image.jpg" />
                  <button type="button" onClick={importUrlToCloudinary} disabled={!imageUrl || imageStatus === 'invalid' || imageStatus === 'uploading'} className="btn-secondary px-4 disabled:opacity-50">
                    {imageStatus === 'uploading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  </button>
                </div>
                <div className="mt-2 min-h-5 text-xs">
                  {imageStatus === 'validating' && <span className="text-text-muted">Validating image preview...</span>}
                  {imageStatus === 'valid' && <span className="inline-flex items-center gap-1 text-emerald-500"><Check className="h-3 w-3" /> Image ready</span>}
                  {imageError && <span className="text-red-500">{imageError}</span>}
                </div>
              </div>

              <div className="rounded-xl border border-surface-border bg-surface/40 p-4">
                <p className="text-sm font-semibold text-text-primary">Generation checklist</p>
                <div className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
                  {['Identify product details', 'Write SEO title and meta', 'Draft description and FAQs', 'Create image alt text', 'Suggest internal links', 'Prepare schema data'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2"><Check className="h-3.5 w-3.5 text-amber-400" /> {item}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Product name" value={form.name ?? ''} onChange={(value) => patchForm({ name: value, slug: form.slug || slugify(value) })} />
            <Field label="SEO slug" value={form.slug ?? ''} onChange={(value) => patchForm({ slug: slugify(value) })} />
            <Field label="Short summary" value={form.shortDescription ?? ''} onChange={(value) => patchForm({ shortDescription: value })} className="md:col-span-2" />
            <TextArea label="Full product description" value={form.longDescription ?? ''} onChange={(value) => patchForm({ longDescription: value })} rows={8} className="md:col-span-2" />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <ListEditor title="Features" value={form.features ?? []} onChange={(value) => updateList('features', value)} />
          <ListEditor title="Benefits" value={form.benefits ?? []} onChange={(value) => updateList('benefits', value)} />
          <ListEditor title="Applications" value={form.applications ?? []} onChange={(value) => updateList('applications', value)} />
          <ListEditor title="Industries Served" value={form.industriesServed ?? []} onChange={(value) => updateList('industriesServed', value)} />
        </section>

        <section className="card p-5">
          <h3 className="text-base font-bold text-text-primary">Technical specifications</h3>
          <div className="mt-4 space-y-3">
            {(form.specifications ?? []).map((spec, index) => (
              <div key={index} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                <input value={spec.key} onChange={(event) => patchForm({ specifications: (form.specifications ?? []).map((item, i) => i === index ? { ...item, key: event.target.value } : item) })} className="input" placeholder="Specification" />
                <input value={spec.value} onChange={(event) => patchForm({ specifications: (form.specifications ?? []).map((item, i) => i === index ? { ...item, value: event.target.value } : item) })} className="input" placeholder="Value" />
                <button type="button" onClick={() => patchForm({ specifications: (form.specifications ?? []).filter((_, i) => i !== index) })} className="btn-ghost px-3"><X className="h-4 w-4" /></button>
              </div>
            ))}
            <button type="button" onClick={() => patchForm({ specifications: [...(form.specifications ?? []), { key: '', value: '' }] })} className="btn-secondary"><Plus className="h-4 w-4" /> Add specification</button>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-base font-bold text-text-primary">FAQ</h3>
          <div className="mt-4 space-y-4">
            {(form.faqs ?? []).map((faq, index) => (
              <div key={index} className="rounded-xl border border-surface-border bg-surface/40 p-4">
                <input value={faq.q} onChange={(event) => patchForm({ faqs: (form.faqs ?? []).map((item, i) => i === index ? { ...item, q: event.target.value } : item) })} className="input w-full" placeholder="Question" />
                <textarea value={faq.a} onChange={(event) => patchForm({ faqs: (form.faqs ?? []).map((item, i) => i === index ? { ...item, a: event.target.value } : item) })} className="input mt-2 min-h-24 w-full" placeholder="Answer" />
                <button type="button" onClick={() => patchForm({ faqs: (form.faqs ?? []).filter((_, i) => i !== index) })} className="btn-ghost mt-2 px-3 text-red-500"><X className="h-4 w-4" /> Remove</button>
              </div>
            ))}
            <button type="button" onClick={() => patchForm({ faqs: [...(form.faqs ?? []), { q: '', a: '' }] })} className="btn-secondary"><Plus className="h-4 w-4" /> Add FAQ</button>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-base font-bold text-text-primary">SEO metadata</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="SEO title" value={form.seoTitle ?? ''} onChange={(value) => patchForm({ seoTitle: value })} helper={`${form.seoTitle?.length ?? 0}/90`} />
            <Field label="SEO keywords" value={form.seoKeywords ?? ''} onChange={(value) => patchForm({ seoKeywords: value })} />
            <TextArea label="Meta description" value={form.seoDescription ?? ''} onChange={(value) => patchForm({ seoDescription: value })} rows={3} helper={`${form.seoDescription?.length ?? 0}/220`} className="md:col-span-2" />
            <Field label="OpenGraph description" value={form.ogDescription ?? ''} onChange={(value) => patchForm({ ogDescription: value })} />
            <Field label="Image alt text" value={form.imageAlt ?? ''} onChange={(value) => patchForm({ imageAlt: value })} />
          </div>
        </section>
      </div>

      <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
        <section className="card p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-text-primary">SEO Score</p>
              <p className="text-xs text-text-muted">Pre-publish validation</p>
            </div>
            <div className={cn('flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold', seo.score >= 80 ? 'bg-emerald-500/15 text-emerald-500' : seo.score >= 55 ? 'bg-amber-500/15 text-amber-400' : 'bg-red-500/15 text-red-500')}>
              {seo.score}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {seo.issues.slice(0, 5).map((issue) => <p key={issue} className="text-xs text-text-secondary">{issue}</p>)}
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-base font-bold text-text-primary">Publishing</h3>
          <div className="mt-4 space-y-4">
            <label className="block text-sm font-semibold text-text-primary">Category</label>
            <p className="text-xs text-text-muted">Choose from Finstar categories or type a custom category and create it manually.</p>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-text-muted" />
              <input value={categorySearch || form.category || ''} onChange={(event) => { setCategorySearch(event.target.value); patchForm({ category: event.target.value }) }} className="input w-full pl-9" placeholder="Search or create category" />
            </div>
            <div className="max-h-56 overflow-auto rounded-xl border border-surface-border bg-surface/80">
              {visibleCategories.map((category) => (
                <button key={`${category.id}-${category.slug}`} type="button" onClick={() => { patchForm({ category: category.name }); setCategorySearch('') }} className={cn('block w-full px-3 py-2 text-left text-sm hover:bg-surface-muted hover:text-text-primary', form.category === category.name ? 'text-amber-400' : 'text-text-secondary')}>
                  <span className="block font-medium">{category.name}</span>
                  {category.description ? <span className="mt-0.5 block line-clamp-1 text-xs text-text-muted">{category.description}</span> : null}
                </button>
              ))}
              {visibleCategories.length === 0 && (
                <p className="px-3 py-3 text-sm text-text-muted">No matching category found.</p>
              )}
              {(categorySearch || form.category) && !hasExactCategoryMatch && (
                <button type="button" onClick={() => { setNewCategory(categorySeoDefaults(categorySearch || form.category || '', form.seoKeywords)); setShowCategoryModal(true) }} className="block w-full border-t border-surface-border px-3 py-2 text-left text-sm font-semibold text-amber-400">
                  Create "{categorySearch || form.category}"
                </button>
              )}
            </div>
            {form.category && !categorySearch && (
              <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                Selected category: {form.category}
              </div>
            )}
            <select value={form.status} onChange={(event) => patchForm({ status: event.target.value as ProductFormValues['status'] })} className="input w-full">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="discontinued">Discontinued</option>
            </select>
            <label className="flex items-center justify-between rounded-xl border border-surface-border bg-surface/40 px-3 py-3 text-sm text-text-secondary">
              Featured product
              <input type="checkbox" checked={Boolean(form.isFeatured)} onChange={(event) => patchForm({ isFeatured: event.target.checked })} />
            </label>
            <button type="button" onClick={() => saveProduct('active')} disabled={isSaving || !form.name || !form.cloudinaryUrl} className="btn-primary w-full justify-center disabled:opacity-50">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Publish Product
            </button>
            <button type="button" onClick={() => saveProduct('draft')} disabled={isSaving || !form.name} className="btn-secondary w-full justify-center disabled:opacity-50">
              Save Draft
            </button>
          </div>
        </section>

        <section className="card p-5">
          <h3 className="text-base font-bold text-text-primary">Image SEO</h3>
          <div className="mt-4 space-y-3">
            <Field label="Image title" value={form.imageTitle ?? ''} onChange={(value) => patchForm({ imageTitle: value })} />
            <Field label="Caption" value={form.imageCaption ?? ''} onChange={(value) => patchForm({ imageCaption: value })} />
          </div>
        </section>
      </aside>

      {showCategoryModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-xl border border-surface-border bg-surface-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-text-primary">Create category</h3>
              <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-ghost px-3"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 space-y-4">
              <Field label="Category name" value={newCategory.name} onChange={(value) => setNewCategory((current) => ({ ...current, ...categorySeoDefaults(value, form.seoKeywords), slug: current.slug && current.slug !== slugify(current.name) ? current.slug : slugify(value) }))} />
              <Field label="Slug" value={newCategory.slug} onChange={(value) => setNewCategory((current) => ({ ...current, slug: slugify(value) }))} />
              <TextArea label="Description" value={newCategory.description} onChange={(value) => setNewCategory((current) => ({ ...current, description: value }))} rows={3} />
              <Field label="SEO title" value={newCategory.seoTitle} onChange={(value) => setNewCategory((current) => ({ ...current, seoTitle: value }))} helper={`${newCategory.seoTitle.length}/90`} />
              <TextArea label="SEO description" value={newCategory.seoDescription} onChange={(value) => setNewCategory((current) => ({ ...current, seoDescription: value }))} rows={2} helper={`${newCategory.seoDescription.length}/220`} />
              <TextArea label="SEO keywords" value={newCategory.seoKeywords} onChange={(value) => setNewCategory((current) => ({ ...current, seoKeywords: value }))} rows={2} />
              <button type="button" onClick={createCategory} className="btn-primary w-full justify-center">Create and select</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, helper, className }: { label: string; value: string | number; onChange: (value: string) => void; helper?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="flex items-center justify-between text-sm font-semibold text-text-primary">
        {label}
        {helper ? <span className="text-xs font-normal text-text-muted">{helper}</span> : null}
      </span>
      <input value={value ?? ''} onChange={(event) => onChange(event.target.value)} className="input mt-2 w-full" />
    </label>
  )
}

function TextArea({ label, value, onChange, rows = 4, helper, className }: { label: string; value: string; onChange: (value: string) => void; rows?: number; helper?: string; className?: string }) {
  return (
    <label className={cn('block', className)}>
      <span className="flex items-center justify-between text-sm font-semibold text-text-primary">
        {label}
        {helper ? <span className="text-xs font-normal text-text-muted">{helper}</span> : null}
      </span>
      <textarea value={value ?? ''} onChange={(event) => onChange(event.target.value)} rows={rows} className="input mt-2 w-full" />
    </label>
  )
}

function ListEditor({ title, value, onChange }: { title: string; value: string[]; onChange: (value: string) => void }) {
  return (
    <section className="card p-5">
      <h3 className="text-base font-bold text-text-primary">{title}</h3>
      <textarea value={value.join('\n')} onChange={(event) => onChange(event.target.value)} rows={6} className="input mt-4 w-full" placeholder="One item per line" />
    </section>
  )
}
