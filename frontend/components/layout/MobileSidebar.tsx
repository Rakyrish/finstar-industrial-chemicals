'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronDown, FlaskConical, Phone, ArrowRight } from 'lucide-react'
import { NAV_ITEMS, COMPANY_INFO, SOCIAL_LINKS } from '@/lib/constants'
import { cn } from '@/utils'

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null)

  const toggleCategory = (label: string) => {
    setOpenCategory(openCategory === label ? null : label)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-[320px] max-w-[90vw] bg-surface-card border-l border-surface-border overflow-y-auto flex flex-col"
            aria-label="Mobile navigation menu"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-surface-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-gradient flex items-center justify-center">
                  <FlaskConical className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
                <span className="font-display font-bold text-sm text-text-primary">
                  Finstar
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all"
                aria-label="Close navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Mobile navigation">
              {NAV_ITEMS.map((item) => {
                const hasMenu = item.categories && item.categories.length > 0
                const isExpanded = openCategory === item.label

                if (hasMenu) {
                  return (
                    <div key={item.label}>
                      <button
                        onClick={() => toggleCategory(item.label)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-150"
                        aria-expanded={isExpanded}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 transition-transform duration-200',
                            isExpanded && 'rotate-180'
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="pl-4 py-1 space-y-3">
                              {item.categories!.map((cat) => (
                                <div key={cat.id}>
                                  <Link
                                    href={cat.href}
                                    onClick={onClose}
                                    className="block px-4 py-2 text-xs font-semibold text-text-primary hover:text-amber-400 transition-colors uppercase tracking-wider"
                                  >
                                    {cat.label}
                                  </Link>
                                  {cat.items && (
                                    <ul className="space-y-1 pl-2">
                                      {cat.items.map((sub) => (
                                        <li key={sub.label}>
                                          <Link
                                            href={sub.href}
                                            onClick={onClose}
                                            className="flex items-center gap-1.5 px-4 py-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
                                          >
                                            <ArrowRight className="w-3 h-3 text-amber-500/60" />
                                            {sub.label}
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href ?? '#'}
                    onClick={onClose}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-150"
                  >
                    {item.label}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom CTA */}
            <div className="p-4 space-y-3 border-t border-surface-border">
              <Link
                href="/quote"
                onClick={onClose}
                className="btn-primary w-full justify-center"
              >
                Get a Quote
              </Link>
              <a
                href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all border border-surface-border"
              >
                <Phone className="w-4 h-4 text-amber-400" />
                {COMPANY_INFO.phone}
              </a>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
