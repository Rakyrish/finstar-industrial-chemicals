import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generatePageMetadata } from '@/lib/metadata'
import { blogService } from '@/services/blogService'
import { articleSchema, graphSchema, breadcrumbSchema, toJsonLd } from '@/lib/schema'
import { formatDate } from '@/utils'
import { Calendar, Clock, ArrowLeft, BookOpen, Share2 } from 'lucide-react'

// ISR: revalidate every 10 minutes
export const revalidate = 600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const res = await blogService.list({ pageSize: 200 })
    return (res.results ?? [])
      .filter((p: any) => p.status === 'published')
      .map((p: any) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await blogService.detail(slug)
    const keywords = [
      post.title,
      'chemical guide',
      'industrial chemistry',
      post.category?.name ?? '',
      ...(post.tags ?? []).map((t: any) => typeof t === 'string' ? t : t.name),
    ].filter(Boolean)

    return generatePageMetadata({
      title: `${post.title} — Chemical Insights & Sourcing Guide`,
      description: post.excerpt || `${post.title}: Industrial chemical guide covering safety, handling, storage, and application optimization.`,
      canonical: `/blog/${post.slug}`,
      keywords,
      ogImage: post.coverImage || undefined,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
      author: post.author?.name ?? 'Finstar Editorial',
    })
  } catch {
    return generatePageMetadata({
      title: 'Article Not Found',
      description: 'The requested Finstar Industrial Chemicals article could not be found.',
      noIndex: true,
    })
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params
  let post: any
  try {
    post = await blogService.detail(slug)
  } catch {
    notFound()
  }

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.category?.name ?? 'Article', href: `/blog?category=${post.category?.slug ?? ''}` },
    { name: post.title, href: `/blog/${post.slug}` },
  ]

  const schemaGraph = graphSchema([
    articleSchema(post),
    breadcrumbSchema(breadcrumbItems),
  ])

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(schemaGraph) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="border-b border-surface-border bg-surface-card/30 py-4">
        <div className="container-wide flex min-w-0 items-center justify-between gap-3 text-xs">
          <Link href="/blog" className="flex min-h-11 shrink-0 items-center gap-1.5 text-text-secondary hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Knowledge Base
          </Link>
          <ol className="hidden min-w-0 items-center gap-2 text-text-muted sm:flex">
            {breadcrumbItems.map((item, i) => (
              <li key={item.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {i < breadcrumbItems.length - 1
                  ? <Link href={item.href} className="hover:text-text-secondary">{item.name}</Link>
                  : <span className="text-text-primary truncate max-w-xs">{item.name}</span>
                }
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <article className="container-wide py-12 max-w-4xl space-y-8">
        {/* Header */}
        <div className="space-y-4 text-center max-w-3xl mx-auto">
          <Link href={`/blog?category=${post.category?.slug}`} className="section-label inline-block">
            {post.category?.name}
          </Link>
          <h1 className="font-display font-bold text-text-primary text-3xl md:text-4xl lg:text-5xl leading-tight">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-text-muted pt-2">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-[10px]">
                  {post.author.name?.charAt(0)}
                </span>
                <span className="font-medium text-text-secondary">{post.author.name}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />{formatDate(post.publishedAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />{post.readingTime}m read
            </span>
          </div>
        </div>

        {/* Cover Image — next/image for LCP optimization */}
        {post.coverImage && (
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-surface-border bg-surface-card shadow-glow-blue">
            <Image
              src={post.coverImage}
              alt={`${post.title} — Finstar Industrial Chemicals`}
              fill
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
          <main className="lg:col-span-8 glass-card p-6 md:p-8 border border-surface-border space-y-6 text-sm md:text-base text-text-secondary leading-relaxed font-sans">
            <div
              className="prose-finstar max-w-none space-y-4 break-anywhere"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            {post.tags && post.tags.length > 0 && (
              <div className="pt-6 border-t border-surface-border flex flex-wrap gap-1.5">
                {post.tags.map((tag: any) => (
                  <span key={typeof tag === 'string' ? tag : tag.id} className="badge-muted text-[10px]">
                    #{typeof tag === 'string' ? tag : tag.name}
                  </span>
                ))}
              </div>
            )}
          </main>

          <aside className="lg:col-span-4 space-y-6">
            <div className="glass-card p-5 border border-surface-border text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mx-auto">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-sm text-text-primary">Share This Insight</h3>
              <p className="text-[10px] text-text-muted leading-relaxed">
                Forward this compliance or technical guidance to colleagues, laboratory personnel, or procurement officers.
              </p>
              <button className="btn-secondary w-full py-2 text-xs justify-center">Copy Article Link</button>
            </div>

            <div className="glass-card p-6 border border-surface-border text-center space-y-4 bg-amber-500/5 hover:border-amber-500/30 transition-all duration-300">
              <div className="w-10 h-10 rounded-xl bg-amber-gradient mx-auto flex items-center justify-center text-white shadow-glow-amber">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="font-display font-semibold text-sm text-text-primary">Need Chemical Sourcing?</h3>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Finstar stocks raw materials matching GHS, REACH, and KEBS directives with full batch certifications.
              </p>
              <Link href="/quote" className="btn-primary w-full py-2.5 text-xs justify-center">
                Request Sourcing Quote
              </Link>
            </div>

            {/* Internal linking to products */}
            <div className="glass-card p-5 border border-surface-border space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-primary">Chemical Catalogue</h3>
              <p className="text-[10px] text-text-muted">Browse related chemical products from Finstar.</p>
              <Link href="/products" className="btn-secondary w-full py-2 text-xs justify-center">
                View All Products
              </Link>
            </div>
          </aside>
        </div>
      </article>
    </div>
  )
}
