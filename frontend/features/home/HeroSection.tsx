'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, ChevronDown, Shield, Zap, Globe } from 'lucide-react'
import HeroCarousel from './HeroCarousel'

const HERO_BADGES = [
  { icon: Zap,    label: 'Fast Delivery' },
  { icon: Globe,  label: 'East Africa Wide' },
]

export default function HeroSection() {
  return (
    <section
      className="relative min-h-[60vh] sm:min-h-[75vh] lg:min-h-[60vh] flex items-center overflow-hidden bg-mesh noise-overlay pt-[72px]"
      aria-label="Hero section"
    >
      {/* Background gradient layers */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface/80" />

      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Glowing orbs */}
      {/* <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-brand-600/20 blur-[120px] animate-pulse-slow" /> */}
      {/* <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-amber-500/15 blur-[100px] animate-float" /> */}

      {/* Content */}
      <div className="relative container-wide py-0 sm:py-0 md:py-0 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center lg:items-stretch">
          {/* Left column */}
          <div className="max-w-2xl flex flex-col justify-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="section-label mb-6">
              ⚗️ Trusted Industrial Chemical Partner
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display font-bold text-text-primary mb-6 leading-[1.1] text-balance"
          >
            Precision Chemistry.{' '}
            <span className="text-gradient-brand">Industrial Scale.</span>
          </motion.h1>

          {/* Sub */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-text-secondary max-w-2xl mb-10 leading-relaxed"
          >
            East Africa&rsquo;s trusted source for high-purity industrial solvents,
            acids, reagents, and specialty chemicals. Reliable supply, competitive
            pricing, and expert technical support.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 mb-8 md:mb-12"
          >
            <Link href="/quote" className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
              Request a Quote
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/products" className="btn-outline px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base">
              Browse Products
            </Link>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap gap-3"
          >
            {HERO_BADGES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-3 py-2 rounded-lg glass-card-light text-xs font-medium text-text-secondary"
              >
                <Icon className="w-3.5 h-3.5 text-amber-400" />
                {label}
              </div>
            ))}
          </motion.div>
          </div>
          {/* Right column - Carousel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:hidden flex items-stretch justify-center h-full w-full mt-6 sm:mt-8"
          >
            <HeroCarousel />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="hidden lg:flex items-stretch justify-center h-full"
          >
            <HeroCarousel />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
        aria-hidden="true"
      >
        <span className="text-[10px] uppercase tracking-widest text-text-muted">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-4 h-4 text-text-muted" />
        </motion.div>
      </motion.div>
    </section>
  )
}
