import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { blogService } from '@/services/blogService'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import { formatDate } from '@/utils'
import { Calendar, Clock, ArrowRight, BookOpen, RefreshCw } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Chemical Guides, Safety Compliance & Insights Blog',
  description: 'Read the latest technical guides, safety data updates, GHS labelling standards, and paint manufacturing process updates from the Finstar engineering desk.',
  canonical: '/blog',
  keywords: ['chemical blog Kenya', 'Finstar tech guides', 'industrial solvent safety blog', 'paint engineering updates'],
})

export default async function BlogPage() {
  let posts: any[] = []
  let categories: any[] = []

  try {
    posts = await blogService.list().catch(() => [])
    categories = await blogService.categories().catch(() => [])
  } catch (err) {
    console.error('Failed to load blog page data:', err)
  }

  const bSchema = breadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
  ])

  const featuredPost = posts.find((p) => p.isFeatured) || posts[0]
  const listPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(bSchema) }}
      />

      {/* Header */}
      <header className="page-header relative border-b border-surface-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative container-wide text-center">
          <span className="section-label mb-4">Finstar Insights</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            Industrial Knowledge Base
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Read technical articles on chemical safety, regulatory compliance, blending standards, and process optimization compiled by our engineers.
          </p>
        </div>
      </header>

      <div className="container-wide py-16 space-y-16">
        {/* Featured Post Card */}
        {featuredPost && (
          <section className="glass-card overflow-hidden border border-surface-border">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {featuredPost.coverImage && (
                <div className="lg:col-span-7 aspect-video lg:aspect-[16/10] bg-surface-muted overflow-hidden relative">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="badge-amber">Featured Guide</span>
                  </div>
                </div>
              )}
              <div className="lg:col-span-5 p-6 md:p-8 space-y-4">
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="badge bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-[10px]">
                    {featuredPost.category.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(featuredPost.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {featuredPost.readingTime}m read
                  </span>
                </div>

                <h2 className="font-display font-bold text-2xl text-text-primary leading-tight hover:text-amber-400 transition-colors">
                  <Link href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
                </h2>

                <p className="text-xs md:text-sm text-text-secondary leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="pt-4 border-t border-surface-border mt-6">
                  <Link
                    href={`/blog/${featuredPost.slug}`}
                    className="btn-primary inline-flex items-center gap-1.5 text-xs px-5 py-2.5"
                  >
                    Read Technical Article
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Categories Bar */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-4">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mr-2">
              Browse Category:
            </span>
            <button className="badge-amber text-xs px-3 py-1.5">All Guides</button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="badge-muted text-xs px-3 py-1.5 cursor-pointer hover:border-amber-500/30 hover:text-text-primary transition-all"
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* Blog Post List grid */}
        {listPosts.length > 0 ? (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {listPosts.map((post) => (
              <article
                key={post.id}
                className="group card flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-all duration-300"
              >
                {post.coverImage && (
                  <div className="aspect-video bg-surface-muted overflow-hidden relative">
                    <img
                      src={post.coverImage}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-[10px] text-text-muted">
                      <span className="badge-amber bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded">
                        {post.category.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.publishedAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readingTime}m read
                      </span>
                    </div>

                    <h3 className="font-display font-semibold text-text-primary group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-surface-border mt-auto flex items-center justify-between text-xs font-semibold text-amber-400">
                    <span>Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5 -translate-x-1 group-hover:translate-x-0 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </section>
        ) : (
          /* Empty / fallback state */
          <div className="glass-card p-12 text-center max-w-md mx-auto border border-surface-border space-y-4">
            <BookOpen className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="font-display font-semibold text-base text-text-primary">
              No Technical Articles Found
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We are currently drafting safety guides, TDS reviews, and regulatory posts. Check back shortly.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
