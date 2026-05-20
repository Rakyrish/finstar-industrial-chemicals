'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, X, ArrowRight, Loader2 } from 'lucide-react'
import { productService } from '@/services/productService'
import type { ProductListItem } from '@/types'
import { cn, debounce } from '@/utils'

interface SearchBarProps {
  placeholder?: string
  autoFocus?: boolean
  onClose?: () => void
  className?: string
}

export default function SearchBar({
  placeholder = 'Search products...',
  autoFocus = false,
  onClose,
  className,
}: SearchBarProps) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState<ProductListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [open,    setOpen]    = useState(false)
  const router  = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus()
  }, [autoFocus])

  const search = debounce(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setOpen(false); return }
    setLoading(true)
    try {
      const items = await productService.search(q, 6)
      setResults(items)
      setOpen(true)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }, 300)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setQuery(val)
    search(val)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
      setOpen(false)
      onClose?.()
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={cn('relative w-full', className)}>
      <form onSubmit={handleSubmit} role="search">
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={handleChange}
            placeholder={placeholder}
            className="input-base pl-10 pr-10"
            aria-label="Search products"
            autoComplete="off"
          />
          {loading && (
            <Loader2 className="absolute right-3.5 w-4 h-4 text-text-muted animate-spin" />
          )}
          {!loading && query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 p-0.5 text-text-muted hover:text-text-primary transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown results */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 glass-card overflow-hidden z-50 shadow-card-hover">
          <ul role="listbox" aria-label="Search results">
            {results.map((product) => (
              <li key={product.id} role="option">
                <Link
                  href={`/products/${product.slug}`}
                  onClick={() => { setOpen(false); onClose?.() }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted transition-colors group"
                >
                  <div className="w-8 h-8 rounded-lg bg-surface-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {product.primaryImage ? (
                      <img src={product.primaryImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Search className="w-3.5 h-3.5 text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </p>
                    <p className="text-xs text-text-muted truncate">{product.category.name}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="px-4 py-2.5 bg-surface-muted/50 border-t border-surface-border">
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={() => { setOpen(false); onClose?.() }}
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium"
            >
              See all results for &ldquo;{query}&rdquo; →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
