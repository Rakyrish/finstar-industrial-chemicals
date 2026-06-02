'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Beaker, Layers, PackageSearch, Star } from 'lucide-react'
import type { NavCategory } from '@/types'
import { cn } from '@/utils'

interface MegaMenuProps {
  categories: NavCategory[]
  onMouseEnter: () => void
  onMouseLeave: () => void
}

export default function MegaMenu({ categories, onMouseEnter, onMouseLeave }: MegaMenuProps) {
  const featuredCategory = categories.find((category) => category.isFeatured) ?? categories[0]
  const productLinks = categories.flatMap((category) =>
    (category.items ?? []).map((item) => ({
      ...item,
      category: category.label,
    }))
  ).slice(0, 10)
  const visibleCategories = categories.slice(0, 12)

  return (
    <motion.div
      initial={{ opacity: 0, x: '-50%', y: 10, scale: 0.98 }}
      animate={{ opacity: 1, x: '-50%', y: 0, scale: 1 }}
      exit={{ opacity: 0, x: '-50%', y: 10, scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
      className="fixed left-1/2 top-[72px] z-50 w-[min(1080px,calc(100vw-32px))] pt-3"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Arrow */}
      <div className="absolute left-1/2 top-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-l border-t border-surface-border bg-surface-card" />

      <div className="relative overflow-hidden rounded-2xl border border-surface-border bg-surface-card shadow-card-hover">
        <div className="grid min-h-[360px] grid-cols-[280px_minmax(0,1fr)_280px]">
          <aside className="border-r border-surface-border bg-surface-muted/25 p-5">
            <div className="mb-4 flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <PackageSearch className="h-5 w-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-text-primary">Product Catalogue</p>
                <p className="text-xs text-text-muted">Browse by chemical category</p>
              </div>
            </div>

            <div className="space-y-1">
              {visibleCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className={cn(
                    'group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    cat.isFeatured
                      ? 'bg-amber-500/10 text-amber-400'
                      : 'text-text-secondary hover:bg-surface-muted hover:text-text-primary'
                  )}
                >
                  <span className="min-w-0 truncate font-medium">{cat.label}</span>
                  {cat.isFeatured ? (
                    <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400" />
                  ) : (
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  )}
                </Link>
              ))}
            </div>
          </aside>

          <section className="p-6">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-400">Popular Products</p>
                <h3 className="mt-1 font-display text-xl font-bold text-text-primary">
                  Common industrial chemical requests
                </h3>
              </div>
              <Link href="/products" className="hidden items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300 xl:inline-flex">
                Full catalogue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {productLinks.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {productLinks.map((item) => (
                  <Link
                    key={`${item.category}-${item.href}`}
                    href={item.href}
                    className="group rounded-xl border border-surface-border bg-surface/45 p-3 transition hover:border-amber-500/40 hover:bg-surface-muted/60"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                        <Beaker className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 text-sm font-semibold leading-snug text-text-primary transition group-hover:text-amber-400">
                          {item.label}
                        </span>
                        <span className="mt-1 block truncate text-xs text-text-muted">{item.category}</span>
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-surface-border bg-surface/45 p-5 text-sm text-text-secondary">
                Product shortcuts will appear here as catalogue items are added.
              </div>
            )}
          </section>

          <aside className="border-l border-surface-border bg-gradient-to-b from-surface-muted/45 to-surface-card p-5">
            {featuredCategory ? (
              <div className="space-y-5">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                  <div className="mb-3 flex items-center gap-2 text-amber-400">
                    <Layers className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-[0.16em]">Featured Category</span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-text-primary">{featuredCategory.label}</h4>
                  {featuredCategory.description ? (
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-text-secondary">{featuredCategory.description}</p>
                  ) : (
                    <p className="mt-2 text-sm leading-6 text-text-secondary">
                      Explore selected industrial chemicals available for quotation and procurement support.
                    </p>
                  )}
                  <Link href={featuredCategory.href} className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400 hover:text-amber-300">
                    Browse category
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">Fast actions</p>
                  <Link href="/quote" className="flex items-center justify-between rounded-xl border border-surface-border bg-surface/50 px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:border-amber-500/40 hover:text-amber-400">
                    Request a quote
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link href="/search" className="flex items-center justify-between rounded-xl border border-surface-border bg-surface/50 px-3 py-2.5 text-sm font-semibold text-text-primary transition hover:border-amber-500/40 hover:text-amber-400">
                    Search chemicals
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ) : null}
          </aside>
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-surface-border bg-surface-muted/35 px-6 py-3">
          <p className="text-xs text-text-muted">
            Industrial chemical supply across Kenya, Uganda, Tanzania, and Rwanda.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/products" className="text-xs font-semibold text-text-secondary transition hover:text-amber-400">
              All products
            </Link>
            <Link href="/contact" className="text-xs font-semibold text-text-secondary transition hover:text-amber-400">
              Contact sales
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
