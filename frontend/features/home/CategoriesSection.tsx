'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { FlaskConical, Beaker, Atom, Microscope, Droplets, Zap } from 'lucide-react'

const CATEGORIES = [
  {
    icon: Droplets,
    name: 'Industrial Chemicals',
    count: '150+ products',
    desc: 'Bulk industrial-grade solvents, intermediates, polymers and additives for manufacturing and processing — supplied with technical datasheets and regulatory support.',
    href: '/products?category=building-architecture',
    color: 'from-blue-500/20 to-blue-600/5',
    border: 'border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: Beaker,
    name: 'Acids & Bases',
    count: '60+ products',
    desc: 'Technical and lab-grade acids and alkalis for diverse applications.',
    href: '/products?category=acids-bases',
    color: 'from-red-500/20 to-red-600/5',
    border: 'border-red-500/20',
    iconColor: 'text-red-400',
  },
  {
    icon: Atom,
    name: 'Dyes Colors and Candles',
    count: '90+ products',
    desc: 'Pigments, dyes, waxes and candle-making supplies for manufacturing and artisan crafts.',
    href: '/products?category=dyes-colors-candles',
    color: 'from-amber-500/20 to-amber-600/5',
    border: 'border-amber-500/20',
    iconColor: 'text-amber-400',
  },
  {
    icon: Microscope,
    name: 'Cleaning & Disinfection Chemicals',
    count: '150+ products',
    desc: 'Sanitizers, disinfectants, surface cleaners and industrial hygiene solutions for facilities and equipment.',
    href: '/products?category=cleaning-disinfection',
    color: 'from-emerald-500/20 to-emerald-600/5',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: FlaskConical,
    name: 'Water Treatment',
    count: '40+ products',
    desc: 'Coagulants, disinfectants, and conditioning agents for water systems.',
    href: '/products?category=water-treatment',
    color: 'from-cyan-500/20 to-cyan-600/5',
    border: 'border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Zap,
    name: 'Soaps and Detergents',
    count: '80+ products',
    desc: 'Surfactants, builders and formulation components for soaps, detergents and personal care products.',
    href: '/products?category=soaps-detergents',
    color: 'from-purple-500/20 to-purple-600/5',
    border: 'border-purple-500/20',
    iconColor: 'text-purple-400',
  },
]

export default function CategoriesSection() {
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon
            return (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <Link
                  href={cat.href}
                  className={`group flex gap-4 p-6 rounded-2xl border ${cat.border} bg-gradient-to-br ${cat.color} hover:scale-[1.02] hover:shadow-card-hover transition-all duration-300`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-surface-card/80 flex items-center justify-center shrink-0 ${cat.iconColor} group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-text-primary text-base group-hover:text-amber-400 transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-[11px] font-medium text-text-muted uppercase tracking-wider mb-1.5">{cat.count}</p>
                    <p className="text-xs text-text-secondary leading-relaxed">{cat.desc}</p>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
