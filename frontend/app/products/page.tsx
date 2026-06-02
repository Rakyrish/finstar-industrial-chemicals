import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import { productService } from '@/services/productService'
import ProductCard from '@/components/shared/ProductCard'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import Link from 'next/link'
import { Filter, SlidersHorizontal, Search, RefreshCw, X } from 'lucide-react'

export const revalidate = 60 // ISR: Revalidate every 60 seconds

interface PageProps {
  searchParams: Promise<{
    category?: string
    search?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const resolvedParams = await searchParams
  const categoryName = resolvedParams.category
    ? resolvedParams.category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Catalogue'

  return generatePageMetadata({
    title: `${categoryName} — High-Purity Industrial Chemicals`,
    description: `Browse Finstar's high-purity industrial chemical products. Find solvents, acids, lab reagents, and specialty chemicals. Request a quote or check stock levels.`,
    canonical: `/products${resolvedParams.category ? `?category=${resolvedParams.category}` : ''}`,
    keywords: ['industrial chemicals catalog', 'chemical search', 'solvents list', 'laboratory reagents list'],
  })
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const categorySlug = resolvedParams.category
  const searchQuery = resolvedParams.search
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1

  // Fetch data concurrently on server
  const [categories, tags, paginatedResult] = await Promise.all([
    productService.categories().catch(() => []),
    productService.tags().catch(() => []),
    productService.list({
      category: categorySlug,
      search: searchQuery,
      page,
      pageSize: 12,
    }).catch(() => ({ count: 0, next: null, previous: null, results: [] })),
  ])

  const products = paginatedResult.results

  const activeCategory = categories.find((c) => c.slug === categorySlug)

  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
  ]
  if (activeCategory) {
    breadcrumbs.push({ name: activeCategory.name, href: `/products?category=${activeCategory.slug}` })
  }

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
          <span className="section-label mb-4">Chemical Inventory</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            {activeCategory ? activeCategory.name : 'Industrial Chemical Catalogue'}
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            {activeCategory
              ? activeCategory.description
              : 'Browse our extensive portfolio of top-tier industrial chemicals, high-purity solvents, laboratory reagents, and process formulations.'}
          </p>
        </div>
      </header>

      {/* Main Content & Grid Layout */}
      <div className="container-wide py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar (Desktop) */}
          <aside className="w-full lg:w-64 shrink-0 space-y-6">
            {/* Search filter */}
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-primary flex items-center gap-2">
                <Search className="w-3.5 h-3.5 text-amber-400" />
                Filter Search
              </h2>
              <form action="/products" method="GET" className="relative flex items-center">
                {categorySlug && <input type="hidden" name="category" value={categorySlug} />}
                <input
                  type="text"
                  name="search"
                  defaultValue={searchQuery || ''}
                  placeholder="Keyword search..."
                  className="input-base py-2.5 pl-3.5 pr-8 text-xs"
                />
                <button type="submit" className="absolute right-2.5 p-1 text-text-muted hover:text-amber-400">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
              {searchQuery && (
                <Link
                  href={`/products${categorySlug ? `?category=${categorySlug}` : ''}`}
                  className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300"
                >
                  <X className="w-3.5 h-3.5" /> Clear search filter
                </Link>
              )}
            </div>

            {/* Categories filter */}
            <div className="glass-card p-5 space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-text-primary flex items-center gap-2">
                <Filter className="w-3.5 h-3.5 text-amber-400" />
                Categories
              </h2>
              <ul className="space-y-1.5">
                <li>
                  <Link
                    href={`/products${searchQuery ? `?search=${searchQuery}` : ''}`}
                    className={`block px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      !categorySlug
                        ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20 shadow-glow-amber'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted border border-transparent'
                    }`}
                  >
                    All Categories
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat.id}>
                    <Link
                      href={`/products?category=${cat.slug}${searchQuery ? `&search=${searchQuery}` : ''}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                        categorySlug === cat.slug
                          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20 shadow-glow-amber'
                          : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted border-transparent'
                      }`}
                    >
                      <span>{cat.name}</span>
                      {cat.productCount > 0 && (
                        <span className="text-[10px] text-text-muted px-1.5 py-0.5 rounded-full bg-surface-muted/40">
                          {cat.productCount}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular tags */}
            {tags.length > 0 && (
              <div className="glass-card p-5 space-y-3">
                <h2 className="text-xs font-semibold uppercase tracking-widest text-text-primary flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
                  Popular Tags
                </h2>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => (
                    <span
                      key={tag.id}
                      className="badge-muted text-[10px] cursor-pointer hover:border-amber-500/30 hover:text-text-primary"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Product Grid & Pagination Area */}
          <main className="flex-1 space-y-8" id="products-catalog-grid">
            {products.length > 0 ? (
              <>
                <div className="grid-products">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
              
                  ))}
                </div>

                {/* Pagination */}
                {paginatedResult.count > 12 && (
                  <div className="flex justify-between items-center py-6 border-t border-surface-border">
                    <Link
                      href={`/products?page=${page - 1}${categorySlug ? `&category=${categorySlug}` : ''}${
                        searchQuery ? `&search=${searchQuery}` : ''
                      }`}
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
                      href={`/products?page=${page + 1}${categorySlug ? `&category=${categorySlug}` : ''}${
                        searchQuery ? `&search=${searchQuery}` : ''
                      }`}
                      className={`btn-secondary text-xs px-4 py-2 ${
                        !paginatedResult.next ? 'pointer-events-none opacity-40' : ''
                      }`}
                    >
                      Next
                    </Link>
                  </div>
                )}
              </>
            ) : (
              /* No Results State */
              <div className="glass-card p-12 text-center border border-surface-border">
                <div className="w-14 h-14 rounded-full bg-surface-muted mx-auto mb-4 flex items-center justify-center text-text-muted">
                  <RefreshCw className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary mb-1">
                  No Chemical Compounds Found
                </h3>
                <p className="text-xs text-text-muted max-w-sm mx-auto mb-6">
                  We couldn&rsquo;t find any product matching your filters. Try updating your search or browsing another category.
                </p>
                <Link
                  href="/products"
                  className="btn-primary text-xs px-5 py-2.5"
                >
                  Clear Filters
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
