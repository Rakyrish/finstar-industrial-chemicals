import { productService } from '@/services/productService'
import CategoriesGrid from './CategoriesGrid'

export default async function CategoriesSection() {
  const categories = await productService.categories().catch(() => [])

  if (!categories || categories.length === 0) {
    return null
  }

  return (
    <section className="section-pad bg-surface-card border-y border-surface-border" aria-label="Product categories">
      <div className="container-wide">
        <div className="text-center mb-12">
          <span className="section-label mb-3">Categories</span>
          <h2 className="font-display font-bold text-text-primary">
            Browse by Category
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
            From laboratory reagents to bulk industrial chemicals — we stock what you need.
          </p>
        </div>

        <CategoriesGrid categories={categories} />
      </div>
    </section>
  )
}
