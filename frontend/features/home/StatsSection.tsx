'use client'

import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { blogService } from '@/services/blogService'
import { productService } from '@/services/productService'

type StatItem = {
  value: number
  suffix: string
  label: string
  desc: string
}

function AnimatedCount({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    let start = 0
    const duration = 1800
    const step = (target / duration) * 16
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])

  return <span ref={ref}>{count}{suffix}</span>
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true

    async function loadStats() {
      try {
        const [products, categories, posts] = await Promise.all([
          productService.list({ pageSize: 1 }),
          productService.categories(),
          blogService.list({ pageSize: 1 }),
        ])

        if (!alive) return

        setStats([
          {
            value: products.count ?? products.results.length,
            suffix: '+',
            label: 'Chemical Products',
            desc: 'Live product records in the catalog',
          },
          {
            value: categories.length,
            suffix: '+',
            label: 'Product Categories',
            desc: 'Industrial categories available for inquiry',
          },
          {
            value: posts.count ?? posts.results.length,
            suffix: '+',
            label: 'Knowledge Resources',
            desc: 'Published guides and technical updates',
          },
        ])
      } catch (error) {
        if (alive) setStats([])
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadStats()
    return () => {
      alive = false
    }
  }, [])

  if (!loading && stats.length === 0) return null

  const displayStats: Array<StatItem | null> = loading ? Array.from<null>({ length: 3 }).fill(null) : stats

  return (
    <section className="py-12 md:py-16 border-b border-surface-border" aria-label="Company statistics">
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {displayStats.map((stat, i) => (
            <motion.div
              key={stat?.label ?? `stat-skeleton-${i}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 glass-card-light rounded-2xl"
            >
              {!stat ? (
                <div className="space-y-3">
                  <div className="mx-auto h-12 w-24 animate-pulse rounded bg-surface-muted" />
                  <div className="mx-auto h-4 w-32 animate-pulse rounded bg-surface-muted" />
                  <div className="mx-auto h-3 w-40 animate-pulse rounded bg-surface-muted" />
                </div>
              ) : (
                <>
                  <div className="font-display font-bold text-4xl md:text-5xl text-gradient-brand mb-2">
                    <AnimatedCount target={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="font-semibold text-sm text-text-primary mb-1">{stat.label}</div>
                  <div className="text-xs text-text-muted">{stat.desc}</div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
