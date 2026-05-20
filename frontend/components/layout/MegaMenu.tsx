'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import type { NavCategory } from '@/types'
import { cn } from '@/utils'

interface MegaMenuProps {
  categories: NavCategory[]
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function MegaMenu({ categories, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[720px] max-w-[95vw]"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Arrow */}
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-surface-card border-l border-t border-surface-border" />

      <div className="relative glass-card overflow-hidden shadow-card-hover">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-surface-border">
          {categories.map((cat) => (
            <div key={cat.id} className={cn('p-5', cat.isFeatured && 'bg-amber-500/5')}>
              <Link
                href={cat.href}
                className="group block mb-3"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {cat.isFeatured && (
                    <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                  <span className="font-display font-semibold text-sm text-text-primary group-hover:text-amber-400 transition-colors">
                    {cat.label}
                  </span>
                </div>
                {cat.description && (
                  <p className="text-xs text-text-muted leading-relaxed">
                    {cat.description}
                  </p>
                )}
              </Link>

              {cat.items && (
                <ul className="space-y-1.5">
                  {cat.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-1.5 text-xs text-text-secondary hover:text-amber-400 transition-colors duration-150 group/link"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover/link:opacity-100 -translate-x-1 group-hover/link:translate-x-0 transition-all duration-150" />
                        {item.label}
                        {item.isNew && (
                          <span className="badge-amber text-[9px] px-1.5 py-0.5">NEW</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* Featured CTA */}
              {cat.isFeatured && (
                <Link
                  href={cat.href}
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  Browse all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div className="px-5 py-3 bg-surface-muted/50 border-t border-surface-border flex items-center justify-between">
          <p className="text-xs text-text-muted">
            Browse our full catalogue of industrial chemicals
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            View all products
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}
