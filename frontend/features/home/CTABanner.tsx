'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Mail } from 'lucide-react'

export default function CTABanner() {
  return (
    <section className="section-pad" aria-label="Call to action">
      <div className="container-wide">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl bg-hero-gradient border border-brand-700/50 px-8 py-16 md:px-16 text-center"
        >
          {/* BG glow */}
          <div className="absolute inset-0 bg-mesh pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-[80px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-600/20 blur-[80px] rounded-full" />

          <div className="relative">
            <span className="section-label mb-4">Ready to Order?</span>
            <h2 className="font-display font-bold text-text-primary mb-4 max-w-2xl mx-auto">
              Get a Custom Quote in{' '}
              <span className="text-gradient-brand">Under 24 Hours</span>
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto mb-10 text-lg">
              Tell us what you need and our team will prepare a competitive, itemised quote with
              full technical documentation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/quote" className="btn-primary px-10 py-4 text-base">
                Request a Quote
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="btn-outline px-10 py-4 text-base">
                <Mail className="w-4 h-4" />
                Send a Message
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
