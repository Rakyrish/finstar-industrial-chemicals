// Blog / Content Marketing types
export type BlogStatus = 'draft' | 'published' | 'archived'

export interface BlogAuthor {
  id: number
  name: string
  slug: string
  avatar?: string
  bio?: string
  role?: string
}

export interface BlogCategory {
  id: number
  name: string
  slug: string
  description?: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage?: string
  author: BlogAuthor
  category: BlogCategory
  tags: Array<string | { id: number; name: string; slug?: string }>
  status: BlogStatus
  publishedAt: string
  updatedAt: string
  readingTime: number
  viewCount: number
  // SEO
  metaTitle?: string
  metaDescription?: string
  canonicalUrl?: string
  ogImage?: string
}

export interface BlogListItem {
  id: number
  title: string
  slug: string
  excerpt: string
  coverImage?: string
  author: Pick<BlogAuthor, 'id' | 'name' | 'avatar'>
  category: BlogCategory
  tags: string[]
  publishedAt: string
  updatedAt?: string
  readingTime: number
}

export interface PaginatedBlogPosts {
  count: number
  next: string | null
  previous: string | null
  results: BlogListItem[]
}

export interface BlogFilters {
  category?: string
  tag?: string
  search?: string
  page?: number
  pageSize?: number
}
