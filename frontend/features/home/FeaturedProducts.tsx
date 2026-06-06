import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { productService } from '@/services/productService'
import ProductCard from '@/components/shared/ProductCard'
import type { ProductListItem } from '@/types'

function groupProductsByCategory(products: ProductListItem[]) {
  const groups = new Map<string, { name: string; slug: string; products: ProductListItem[] }>()

  products.forEach((product) => {
    const key = product.category.slug
    const group = groups.get(key)

    if (group) {
      group.products.push(product)
      return
    }

    groups.set(key, {
      name: product.category.name,
      slug: product.category.slug,
      products: [product],
    })
  })

  return Array.from(groups.values())
}

export default async function FeaturedProducts() {
  let products: ProductListItem[] = []
  try {
    products = await productService.featured(48)
  } catch {
    // Silently fail — show section with empty state
  }

  const categoryRows = groupProductsByCategory(products).filter((category) => category.products.length > 1)

  return (
    <section className="section-pad" aria-label="Featured products">
      <div className="container-wide">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="section-label mb-3">Our Products</span>
            <h2 className="font-display font-bold text-text-primary">
              Featured Chemicals
            </h2>
            <p className="mt-2 text-text-secondary max-w-xl">
              High-purity industrial chemicals ready for immediate dispatch. All products
              come with full documentation and safety data sheets.
            </p>
          </div>
          <Link
            href="/products"
            className="btn-ghost shrink-0 text-amber-400 hover:text-amber-300"
          >
            View all products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category rows */}
        {categoryRows.length > 0 ? (
          <div className="space-y-8">
            {categoryRows.map((category) => (
              <div key={category.slug} className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-text-primary">
                    {category.name}
                  </h3>
                  <Link
                    href={`/products?category=${category.slug}`}
                    className="inline-flex min-h-11 items-center text-xs font-semibold text-amber-400 hover:text-amber-300"
                  >
                    View category
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5 lg:gap-6">
                  {category.products.slice(0, 4).map((product, i) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={i < 3}
                      className={i > 1 ? 'hidden lg:flex' : undefined}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* Skeleton fallback */
          <div className="grid-products">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card aspect-[4/5] animate-pulse bg-surface-muted"
              />
            ))}
          </div>
        ) : null}

        {/* CTA */}
        <div className="text-center mt-12">
          <Link href="/products" className="btn-primary px-10 py-4">
            Browse Full Catalogue
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
