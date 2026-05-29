import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { productService } from '@/services/productService'
import ProductCard from '@/components/shared/ProductCard'
import type { ProductListItem } from '@/types'

export default async function FeaturedProducts() {
  let products: ProductListItem[] = []
  try {
    products = await productService.featured(6)
  } catch {
    // Silently fail — show section with empty state
  }

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

        {/* Grid */}
        {products.length > 0 ? (
          <div className="grid-products">
            {products.map((product, i) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={i < 3}
              />
            ))}
          </div>
        ) : (
          /* Skeleton fallback */
          <div className="grid-products">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="card aspect-[4/5] animate-pulse bg-surface-muted"
              />
            ))}
          </div>
        )}

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
