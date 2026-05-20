import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, FlaskConical, Tag, Star } from 'lucide-react'
import type { ProductListItem } from '@/types'
import { cn } from '@/utils'

interface ProductCardProps {
  product: ProductListItem
  className?: string
  priority?: boolean
}

export default function ProductCard({ product, className, priority = false }: ProductCardProps) {
  const isAvailable = product.status === 'active'

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        'group card shine-effect flex flex-col overflow-hidden',
        'hover:-translate-y-1 transition-all duration-300',
        className
      )}
      aria-label={`View ${product.name}`}
    >
      {/* Image */}
      <div className="relative aspect-product bg-surface-muted overflow-hidden">
        {product.primaryImage ? (
          <Image
            src={product.primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            priority={priority}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-brand-950 to-surface-muted">
            <FlaskConical className="w-10 h-10 text-text-muted/40" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {product.isNew && (
            <span className="badge-amber text-[10px]">NEW</span>
          )}
          {product.isFeatured && (
            <span className="badge bg-brand-600/80 text-brand-200 border border-brand-500/40 text-[10px] backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 mr-1 fill-current" />
              Featured
            </span>
          )}
        </div>

        {!isAvailable && (
          <div className="absolute inset-0 bg-surface/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="badge-red">Out of Stock</span>
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-glow-amber">
          <ArrowRight className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Category */}
        <div className="flex items-center gap-1.5">
          <Tag className="w-3 h-3 text-amber-500/70" />
          <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
            {product.category.name}
          </span>
        </div>

        {/* Name */}
        <h3 className="font-display font-semibold text-base text-text-primary group-hover:text-amber-400 transition-colors duration-150 line-clamp-2 leading-snug">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-text-muted line-clamp-2 leading-relaxed flex-1">
          {product.shortDescription}
        </p>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {product.tags.slice(0, 3).map((tag) => (
              <span key={tag.id} className="badge-muted text-[10px]">
                {tag.name}
              </span>
            ))}
            {product.tags.length > 3 && (
              <span className="badge-muted text-[10px]">+{product.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border mt-auto">
          <span className="text-xs text-text-muted">
            MOQ: {product.minOrderQuantity} {product.unitOfMeasure}
          </span>
          <span className="text-xs font-semibold text-amber-400 group-hover:gap-1.5 flex items-center gap-1 transition-all">
            View Details
            <ArrowRight className="w-3 h-3 -translate-x-1 group-hover:translate-x-0 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  )
}
