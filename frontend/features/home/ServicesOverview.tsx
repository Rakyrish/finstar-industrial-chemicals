'use client'

import { motion } from 'framer-motion'
import { Truck, FlaskConical, FileText, Headphones, BarChart3, Database } from 'lucide-react'

const SERVICES = [
  {
    icon: FlaskConical,
    title: 'Bulk Chemical Supply',
    desc: 'Large-volume procurement with flexible packaging options — drums, IBCs, tankers.',
    href: '/services#bulk-supply',
  },
  {
    icon: Truck,
    title: 'Logistics & Delivery',
    desc: 'Temperature-controlled transport and full hazardous material compliance across East Africa.',
    href: '/services#logistics',
  },
  {
    icon: FileText,
    title: 'Regulatory Compliance',
    desc: 'REACH, GHS, and local KEBS compliance documentation provided for all products.',
    href: '/services#compliance',
  },
  {
    icon: Headphones,
    title: 'Technical Consulting',
    desc: 'Application engineering support to optimise your chemical processes and reduce waste.',
    href: '/services#consulting',
  },
  {
    icon: BarChart3,
    title: 'Inventory Management',
    desc: 'Automated reorder levels and Google Sheets integration to keep your operations running smoothly.',
    href: '/services#inventory',
  },
  {
    icon: Database,
    title: 'Custom Formulations',
    desc: 'Bespoke chemical blending and formulation services to meet your exact specifications.',
    href: '/services#formulations',
  },
]

export default function ServicesOverview() {
  return (
    <section className="section-pad bg-surface-card border-y border-surface-border" aria-label="Our services">
      <div className="container-wide">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Left text */}
          <div className="lg:w-1/3 shrink-0">
            <span className="section-label mb-4">Services</span>
            <h2 className="font-display font-bold text-text-primary mb-4">
              End-to-End Chemical Solutions
            </h2>
            <p className="text-text-secondary leading-relaxed mb-6">
              From procurement to technical support, Finstar provides complete chemical management services tailored to your industry.
            </p>
            <a href="/services" className="btn-primary">
              All Services
            </a>
          </div>

          {/* Grid */}
          <div className="flex-1 grid sm:grid-cols-2 gap-4">
            {SERVICES.map((svc, i) => {
              const Icon = svc.icon
              return (
                <motion.a
                  key={svc.title}
                  href={svc.href}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group flex gap-4 p-5 rounded-xl bg-surface-muted/50 border border-surface-border hover:border-amber-500/30 hover:bg-surface-muted transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-card flex items-center justify-center shrink-0 text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary mb-1 group-hover:text-amber-400 transition-colors">
                      {svc.title}
                    </h3>
                    <p className="text-xs text-text-muted leading-relaxed">{svc.desc}</p>
                  </div>
                </motion.a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
