'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Search, ChevronDown, FlaskConical, Phone } from 'lucide-react'
import { NAV_ITEMS, COMPANY_INFO } from '@/lib/constants'
import { cn } from '@/utils'
import MegaMenu from './MegaMenu'
import MobileSidebar from './MobileSidebar'
import SearchBar from '../shared/SearchBar'

export default function Header() {
  const [scrolled,       setScrolled]       = useState(false)
  const [mobileOpen,     setMobileOpen]     = useState(false)
  const [searchOpen,     setSearchOpen]     = useState(false)
  const [activeMenu,     setActiveMenu]     = useState<string | null>(null)
  const pathname = usePathname()
  const menuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Detect scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false)
    setActiveMenu(null)
  }, [pathname])

  const handleMenuEnter = (label: string) => {
    if (menuTimer.current) clearTimeout(menuTimer.current)
    setActiveMenu(label)
  }

  const handleMenuLeave = () => {
    menuTimer.current = setTimeout(() => setActiveMenu(null), 120)
  }

  return (
    <>
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-surface/95 backdrop-blur-xl border-b border-surface-border shadow-[0_4px_32px_rgba(0,0,0,0.4)]'
            : 'bg-transparent'
        )}
      >
        <div className="container-wide">
          <div className="flex items-center justify-between h-[72px] gap-4">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-2.5 shrink-0 group"
              aria-label="Finstar Industrial Chemicals — Home"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-gradient flex items-center justify-center shadow-glow-amber group-hover:scale-105 transition-transform duration-200">
                <FlaskConical className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="hidden sm:block">
                <span className="font-display font-bold text-base text-text-primary leading-none">
                  Finstar
                </span>
                <span className="block text-[10px] text-text-muted tracking-widest uppercase">
                  Industrial Chemicals
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const hasMenu = item.categories && item.categories.length > 0
                const isActive = item.href ? pathname.startsWith(item.href) : false

                return (
                  <div
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => hasMenu && handleMenuEnter(item.label)}
                    onMouseLeave={() => hasMenu && handleMenuLeave()}
                  >
                    {hasMenu ? (
                      <button
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                          activeMenu === item.label
                            ? 'text-text-primary bg-surface-muted'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                        )}
                        aria-expanded={activeMenu === item.label}
                        aria-haspopup="true"
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            'w-3.5 h-3.5 transition-transform duration-200',
                            activeMenu === item.label && 'rotate-180'
                          )}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href ?? '#'}
                        className={cn(
                          'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
                          isActive
                            ? 'text-amber-400 bg-amber-500/10'
                            : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                        )}
                      >
                        {item.label}
                      </Link>
                    )}

                    {/* Mega Menu Dropdown */}
                    <AnimatePresence>
                      {hasMenu && activeMenu === item.label && (
                        <MegaMenu
                          categories={item.categories!}
                          onMouseEnter={() => handleMenuEnter(item.label)}
                          onMouseLeave={handleMenuLeave}
                        />
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search toggle */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-150"
                aria-label="Toggle search"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {/* Phone CTA */}
              <a
                href={`tel:${COMPANY_INFO.phone.replace(/\s/g, '')}`}
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-150"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                {COMPANY_INFO.phone}
              </a>

              {/* Quote CTA */}
              <Link
                href="/quote"
                className="hidden sm:inline-flex btn-primary text-xs px-4 py-2"
              >
                Get a Quote
              </Link>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all duration-150"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Search bar (expandable) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-surface-border bg-surface/98 backdrop-blur-xl"
            >
              <div className="container-wide py-3">
                <SearchBar
                  autoFocus
                  onClose={() => setSearchOpen(false)}
                  placeholder="Search products, categories, chemical names..."
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-[72px]" aria-hidden="true" />

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
    </>
  )
}
