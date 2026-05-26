import Link from 'next/link'
import { ArrowRight, Calendar, Clock } from 'lucide-react'
import { blogService } from '@/services/blogService'
import { formatDate } from '@/utils'

export default async function RecentBlog() {
  let posts: any[] = []
  try {
    posts = await blogService.recent(3)
  } catch {
    return null
  }

  if (!posts || posts.length === 0) return null

  return (
    <section className="section-pad border-t border-surface-border" aria-label="Latest articles">
      <div className="container-wide">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label mb-3">Resources</span>
            <h2 className="font-display font-bold text-text-primary">Latest Insights</h2>
            <p className="mt-2 text-text-secondary">
              Industry news, chemical guides, and regulatory updates.
            </p>
          </div>
          <Link href="/blog" className="btn-ghost text-amber-400 hover:text-amber-300 shrink-0">
            All articles <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group card overflow-hidden hover:-translate-y-1 transition-all duration-300"
            >
              {post.coverImage && (
                <div className="aspect-video bg-surface-muted overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                  <span className="badge-amber">{post.category.name}</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(post.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readingTime}m
                  </span>
                </div>
                <h3 className="font-display font-semibold text-text-primary group-hover:text-amber-400 transition-colors line-clamp-2 mb-2">
                  {post.title}
                </h3>
                <p className="text-xs text-text-muted line-clamp-3 leading-relaxed">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
