import Link from 'next/link'
import { FlaskConical, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface px-4">
      <div className="text-center max-w-lg">
        {/* Icon */}
        <div className="w-20 h-20 rounded-2xl bg-amber-gradient mx-auto mb-6 flex items-center justify-center shadow-glow-amber">
          <FlaskConical className="w-10 h-10 text-white" />
        </div>

        {/* 404 */}
        <div className="font-display font-bold text-8xl text-gradient-brand mb-2">404</div>
        <h1 className="font-display font-bold text-2xl text-text-primary mb-3">
          Formula Not Found
        </h1>
        <p className="text-text-secondary mb-8 leading-relaxed">
          The chemical compound you&rsquo;re looking for doesn&rsquo;t exist in our catalogue.
          Let&rsquo;s get you back to the lab.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/" className="btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <Link href="/products" className="btn-secondary">
            <Search className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  )
}
