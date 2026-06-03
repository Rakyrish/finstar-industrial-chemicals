import { z } from 'zod'

export const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
})

export type AdminLoginFormData = z.infer<typeof adminLoginSchema>

export const adminBlogSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  slug: z.string().min(1, 'Slug is required.'),
  excerpt: z.string().min(1, 'Excerpt is required.'),
  content: z.string().min(1, 'Content is required.'),
  author: z.string().min(1, 'Author is required.'),
  featuredImage: z.string().url('Featured image must be a valid URL.').or(z.literal('')).optional(),
  tags: z.array(z.string()),
  status: z.enum(['draft', 'published', 'archived']),
  publishDate: z.string().min(1, 'Publish date is required.'),
  seoTitle: z.string().min(1, 'SEO title is required.'),
  seoDescription: z.string().min(1, 'SEO description is required.'),
})

export type AdminBlogFormData = z.infer<typeof adminBlogSchema>
