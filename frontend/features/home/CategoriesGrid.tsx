'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Beaker } from 'lucide-react'
import type { Category } from '@/types'

export default function CategoriesGrid({ categories }: { categories: Category[] }) {
  // If API doesn't return icons/colors, we map defaults
  const getCatStyle = (slug: string) => {
    switch (slug) {
      case 'industrial-solvents': return { color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/20', iconColor: 'text-blue-400' }
      case 'acids-bases': return { color: 'from-red-500/20 to-red-600/5', border: 'border-red-500/20', iconColor: 'text-red-400' }
      case 'specialty-chemicals': return { color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' }
      default: return { color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/20', iconColor: 'text-amber-400' }
    }
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {categories.map((cat, i) => {
        const style = getCatStyle(cat.slug)
        return (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
          >
            <Link
              href={`/products?category=${cat.slug}`}
              className={`group flex gap-4 p-6 rounded-2xl border ${style.border} bg-gradient-to-br ${style.color} hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300`}
            >
              <div className={`w-12 h-12 rounded-xl bg-surface-card/80 flex items-center justify-center shrink-0 ${style.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                <Beaker className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-display font-semibold text-text-primary text-base group-hover:text-amber-400 transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">{cat.productCount ?? 0} products</p>
                <p className="text-xs text-text-secondary leading-relaxed line-clamp-3">{cat.description || `Browse our high-quality ${cat.name} suitable for various industrial applications.`}</p>
              </div>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
