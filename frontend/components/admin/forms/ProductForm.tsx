"use client"

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { z } from 'zod'
import type { AdminProductDraft } from '@/types/admin'
import { useAdminToast } from '../AdminToastProvider'

type ProductImageDraft = { url: string }

type ProductFormValues = AdminProductDraft & { images: ProductImageDraft[]; specifications: Array<{ key: string; value: string }> }

const productFormSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  slug: z.string().min(2, 'Slug is required'),
  description: z.string().min(10, 'Description is required'),
  category: z.string().min(2, 'Category is required'),
  status: z.enum(['active', 'inactive', 'out_of_stock', 'discontinued']),
  featured: z.boolean(),
  pricing: z.string().min(1, 'Pricing is required'),
  packaging: z.string().min(1, 'Packaging is required'),
  inventoryQuantity: z.coerce.number().min(0),
  seoTitle: z.string().min(2),
  seoDescription: z.string().min(2),
  images: z.array(z.object({ url: z.string().min(1, 'Image URL is required') })).min(1, 'Add at least one image'),
  specifications: z.array(z.object({ key: z.string().min(1, 'Spec key is required'), value: z.string().min(1, 'Spec value is required') })).min(1, 'Add at least one spec'),
})

const defaultValues: ProductFormValues = {
  name: '',
  slug: '',
  description: '',
  category: '',
  status: 'active',
  featured: true,
  pricing: '',
  packaging: '',
  inventoryQuantity: 0,
  seoTitle: '',
  seoDescription: '',
  images: [{ url: '' }],
  specifications: [{ key: '', value: '' }],
}

export default function ProductForm() {
  const [message, setMessage] = useState('')
  const { toast } = useAdminToast()
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues,
  })

  const imageFields = useFieldArray({ control, name: 'images' })
  const specificationFields = useFieldArray({ control, name: 'specifications' })

  const onSubmit = async (values: ProductFormValues) => {
    setMessage('')
    const response = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
      credentials: 'include',
    })

    const result = await response.json()
    setMessage(result.message ?? 'Product saved successfully')
    toast({ title: 'Product saved', description: result.message ?? 'Product saved successfully', variant: 'success' })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-bold text-text-primary">Product details</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm text-text-primary">Product name</span><input {...register('name')} className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Slug</span><input {...register('slug')} className="input-base" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm text-text-primary">Description</span><textarea {...register('description')} rows={5} className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Category</span><input {...register('category')} className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Status</span><select {...register('status')} className="input-base"><option value="active">Active</option><option value="inactive">Inactive</option><option value="out_of_stock">Out of stock</option><option value="discontinued">Discontinued</option></select></label>
          <label className="flex items-center gap-3 rounded-2xl border border-surface-border bg-surface/50 px-4 py-3 text-sm text-text-primary">
            <input type="checkbox" {...register('featured')} className="h-4 w-4 rounded border-surface-border bg-surface-card accent-amber-500" />
            Featured product
          </label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Pricing</span><input {...register('pricing')} className="input-base" placeholder="KES 12,500 / drum" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Packaging</span><input {...register('packaging')} className="input-base" placeholder="25kg bags / 200L drums" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Inventory quantity</span><input {...register('inventoryQuantity', { valueAsNumber: true })} type="number" className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">SEO title</span><input {...register('seoTitle')} className="input-base" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm text-text-primary">SEO description</span><textarea {...register('seoDescription')} rows={3} className="input-base" /></label>
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-text-primary">Images</h3>
          <button type="button" onClick={() => imageFields.append({ url: '' })} className="btn-secondary"><Plus className="h-4 w-4" /> Add image</button>
        </div>
        <div className="space-y-3">
          {imageFields.fields.map((field, index) => (
            <div key={field.id} className="flex gap-3">
              <input {...register(`images.${index}.url` as const)} className="input-base" placeholder="https://..." />
              <button type="button" onClick={() => imageFields.remove(index)} className="btn-secondary"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      <section className="card space-y-4 p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-text-primary">Specifications</h3>
          <button type="button" onClick={() => specificationFields.append({ key: '', value: '' })} className="btn-secondary"><Plus className="h-4 w-4" /> Add spec</button>
        </div>
        <div className="space-y-3">
          {specificationFields.fields.map((field, index) => (
            <div key={field.id} className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <input {...register(`specifications.${index}.key` as const)} className="input-base" placeholder="Key" />
              <input {...register(`specifications.${index}.value` as const)} className="input-base" placeholder="Value" />
              <button type="button" onClick={() => specificationFields.remove(index)} className="btn-secondary"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      </section>

      {errors.name ? <p className="text-sm text-red-400">{errors.name.message}</p> : null}
      {message ? <p className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">{message}</p> : null}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Saving product...' : 'Save product'}
      </button>
    </form>
  )
}