"use client"

import { message } from 'antd'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { adminBlogSchema } from '@/lib/admin/schemas'
import type { AdminBlogDraft } from '@/types/admin'

type BlogFormValues = AdminBlogDraft

const defaultValues: BlogFormValues = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  author: '',
  featuredImage: '',
  tags: [],
  status: 'draft',
  publishDate: '',
  seoTitle: '',
  seoDescription: '',
}

export default function BlogForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<BlogFormValues>({
    resolver: zodResolver(adminBlogSchema),
    defaultValues,
  })

  const onSubmit = async (values: BlogFormValues) => {
    try {
      const response = await fetch('/api/admin/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
        credentials: 'include',
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.detail ?? result.message ?? 'Blog post save failed.')
      message.success(result.message ?? 'Blog post saved successfully.')
    } catch (error: any) {
      message.error(error.message || 'Blog post save failed.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="card space-y-4 p-6">
        <h3 className="text-lg font-bold text-text-primary">Post content</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-2"><span className="text-sm text-text-primary">Title</span><input {...register('title')} className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Slug</span><input {...register('slug')} className="input-base" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm text-text-primary">Excerpt</span><textarea {...register('excerpt')} rows={3} className="input-base" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm text-text-primary">Content</span><textarea {...register('content')} rows={10} className="input-base font-mono text-sm" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Author</span><input {...register('author')} className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Featured image</span><input {...register('featuredImage')} className="input-base" placeholder="https://..." /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Publish date</span><input {...register('publishDate')} type="date" className="input-base" /></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Status</span><select {...register('status')} className="input-base"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
          <label className="space-y-2"><span className="text-sm text-text-primary">Tags</span><input defaultValue={watch('tags').join(', ')} onChange={(event) => setValue('tags', event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean))} className="input-base" placeholder="safety, training, logistics" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm text-text-primary">SEO title</span><input {...register('seoTitle')} className="input-base" /></label>
          <label className="space-y-2 md:col-span-2"><span className="text-sm text-text-primary">SEO description</span><textarea {...register('seoDescription')} rows={3} className="input-base" /></label>
        </div>
      </section>

      {errors.title ? <p className="text-sm text-red-400">{errors.title.message}</p> : null}

      <button type="submit" disabled={isSubmitting} className="btn-primary">
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? 'Saving post...' : 'Save post'}
      </button>
    </form>
  )
}
