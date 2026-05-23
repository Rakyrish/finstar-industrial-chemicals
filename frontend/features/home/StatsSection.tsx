'use client'

import { useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const STATS = [
  { value: 500,  suffix: '+',  label: 'Chemical Products',   desc: 'Across all major categories' },
  { value: 200,  suffix: '+',  label: 'Happy Clients',       desc: 'Across East Africa' },

  { value: 99,   suffix: '%',  label: 'On-time Delivery',    desc: 'Customer satisfaction rate' },
]

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
  return (
    <section className="py-12 md:py-16 border-b border-surface-border" aria-label="Company statistics">
      <div className="container-wide">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center p-6 glass-card-light rounded-2xl"
            >
              <div className="font-display font-bold text-4xl md:text-5xl text-gradient-brand mb-2">
                <AnimatedCount target={stat.value} suffix={stat.suffix} />
              </div>
              <div className="font-semibold text-sm text-text-primary mb-1">{stat.label}</div>
              <div className="text-xs text-text-muted">{stat.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
