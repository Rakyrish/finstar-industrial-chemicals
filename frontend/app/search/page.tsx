import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import { productService } from '@/services/productService'
import ProductCard from '@/components/shared/ProductCard'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import Link from 'next/link'
import { Search, RefreshCw, X, ArrowLeft } from 'lucide-react'
import type { PaginatedProducts } from '@/types'

export const revalidate = 0 // Search is always dynamic

interface PageProps {
  searchParams: Promise<{
    q?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams
  return generatePageMetadata({
    title: resolvedParams.q ? `Search Results for "${resolvedParams.q}"` : 'Search Chemical Catalogue',
    description: 'Search Finstar\'s extensive portfolio of high-purity industrial solvents, acids, reagents, and specialty chemicals.',
    canonical: '/search',
  })
}

export default async function SearchPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const query = resolvedParams.q || ''
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1

  let paginatedResult: PaginatedProducts = { count: 0, next: null, previous: null, results: [] }

  if (query.trim()) {
    try {
      // Use list API with search query
      paginatedResult = await productService.list({
        search: query,
        page,
        pageSize: 12,
      })
    } catch (err) {
      console.error('Search query failed:', err)
    }
  }

  const products = paginatedResult.results

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Search', href: '/search' },
  ]

  const bSchema = breadcrumbSchema(breadcrumbs)

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(bSchema) }}
      />

      {/* Page Header */}
      <header className="page-header relative border-b border-surface-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative container-wide text-center">
          <span className="section-label mb-4">Database Query</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            {query ? `Search Results` : 'Chemical Search Engine'}
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {query
              ? `Displaying matching compounds found for "${query}"`
              : 'Search our technical database by compound name, CAS number, chemical formula, or category.'}
          </p>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container-wide py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main search bar form */}
          <div className="glass-card p-6 border border-surface-border">
            <form action="/search" method="GET" className="relative flex items-center gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-text-muted pointer-events-none" />
                <input
                  type="text"
                  name="q"
                  defaultValue={query}
                  placeholder="Enter chemical name, CAS number, formula, or category..."
                  className="input-base pl-10 pr-10 py-3.5 text-sm"
                  autoComplete="off"
                />
                {query && (
                  <Link
                    href="/search"
                    className="absolute right-3.5 top-3.5 p-0.5 text-text-muted hover:text-text-primary transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </Link>
                )}
              </div>
              <button type="submit" className="btn-primary py-3.5 px-6 text-sm shrink-0">
                Search
              </button>
            </form>
          </div>

          {/* Results list */}
          {query.trim() ? (
            products.length > 0 ? (
              <div className="space-y-8">
                <div className="flex justify-between items-center text-xs text-text-muted">
                  <span>Found {paginatedResult.count} matching chemical compounds</span>
                  <Link href="/products" className="text-amber-400 hover:text-amber-300 flex items-center gap-1">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back to Full Catalogue
                  </Link>
                </div>

                <div className="grid-products">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {paginatedResult.count > 12 && (
                  <div className="flex justify-between items-center py-6 border-t border-surface-border">
                    <Link
                      href={`/search?page=${page - 1}&q=${encodeURIComponent(query)}`}
                      className={`btn-secondary text-xs px-4 py-2 ${
                        page === 1 ? 'pointer-events-none opacity-40' : ''
                      }`}
                    >
                      Previous
                    </Link>
                    <span className="text-xs text-text-muted">
                      Page {page} of {Math.ceil(paginatedResult.count / 12)}
                    </span>
                    <Link
                      href={`/search?page=${page + 1}&q=${encodeURIComponent(query)}`}
                      className={`btn-secondary text-xs px-4 py-2 ${
                        !paginatedResult.next ? 'pointer-events-none opacity-40' : ''
                      }`}
                    >
                      Next
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* No Results State */
              <div className="glass-card p-12 text-center border border-surface-border space-y-4">
                <div className="w-14 h-14 rounded-full bg-surface-muted mx-auto flex items-center justify-center text-text-muted">
                  <RefreshCw className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary">
                  No Chemical Compounds Found
                </h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto leading-relaxed">
                  We couldn&rsquo;t find any product matching &ldquo;{query}&rdquo;. Double check the spelling, CAS registry number, or try searching by category instead.
                </p>
                <div className="flex justify-center gap-4 pt-2">
                  <Link href="/products" className="btn-primary text-xs">
                    Browse All Products
                  </Link>
                  <Link href="/contact" className="btn-secondary text-xs">
                    Inquire Custom Sourcing
                  </Link>
                </div>
              </div>
            )
          ) : (
            /* Initial search prompt state */
            <div className="glass-card p-12 text-center border border-surface-border space-y-4 bg-surface-muted/10">
              <Search className="w-12 h-12 text-amber-500/70 mx-auto" />
              <h3 className="font-display font-semibold text-base text-text-primary">
                Chemical Database Sourcing
              </h3>
              <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
                Enter chemical keywords to quickly inspect technical specifications, check min order volumes, packaging variations, purity grades, and request custom quotes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
