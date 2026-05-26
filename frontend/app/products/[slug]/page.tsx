import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generatePageMetadata } from '@/lib/metadata'
import { productService } from '@/services/productService'
import { productSchema, toJsonLd } from '@/lib/schema'
import ProductCard from '@/components/shared/ProductCard'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import { ShieldCheck, FileText, Download, Award, AlertCircle, ArrowLeft, Send } from 'lucide-react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  try {
    const product = await productService.detail(resolvedParams.slug)
    return generatePageMetadata({
      title: `${product.name} — Technical Specifications & Supplier`,
      description: `${product.name}: ${product.shortDescription || 'Technical grade industrial chemical specs, purity details, SDS sheet, packaging, and inquiry options.'}`,
      canonical: `/products/${product.slug}`,
      keywords: [product.name, `${product.name} supplier`, `${product.name} formula`, 'industrial chemical specs'],
    })
  } catch {
    return generatePageMetadata({ title: 'Product Not Found' })
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  let product
  let related: any[] = []

  try {
    product = await productService.detail(resolvedParams.slug)
    related = await productService.related(product.slug, 3).catch(() => [])
  } catch {
    notFound()
  }

  const pSchema = productSchema(product)

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(pSchema) }}
      />

      {/* Navigation Breadcrumb bar */}
      <div className="border-b border-surface-border bg-surface-card/30 py-4">
        <div className="container-wide flex items-center justify-between text-xs">
          <Link
            href="/products"
            className="flex items-center gap-1.5 text-text-secondary hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
          </Link>
          <div className="flex items-center gap-2 text-text-muted">
            <Link href="/" className="hover:text-text-secondary">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-text-secondary">Catalogue</Link>
            <span>/</span>
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-text-secondary">
              {product.category.name}
            </Link>
            <span>/</span>
            <span className="text-text-primary truncate max-w-xs">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Image & Certifications */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-card border border-surface-border group shadow-glow-blue flex items-center justify-center">
              {product.primaryImage ? (
                <Image
                  src={product.primaryImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  priority
                />
              ) : (
                <Award className="w-20 h-20 text-text-muted/30" />
              )}

              {/* Status Indicator */}
              <div className="absolute top-4 left-4">
                {product.status === 'active' ? (
                  <span className="badge-amber bg-amber-500/10 text-amber-400">Available</span>
                ) : (
                  <span className="badge-red">Out of Stock</span>
                )}
              </div>
            </div>

            {/* Certifications Card */}
            <div className="glass-card p-5 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-text-primary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Guaranteed Quality
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs text-text-secondary">
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-muted/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  COA Available
                </div>
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-muted/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  ISO 9001 Sourced
                </div>
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-muted/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  REACH Compliant
                </div>
                <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-surface-muted/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  KEBS Approved
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Quick Specs, Tech Table, Quote CTA */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <Link
                href={`/products?category=${product.category.slug}`}
                className="section-label inline-block"
              >
                {product.category.name}
              </Link>
              <h1 className="font-display font-bold text-text-primary text-3xl md:text-4xl leading-tight">
                {product.name}
              </h1>
              {product.casNumber && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span className="px-2 py-1 bg-surface-muted rounded-md border border-surface-border">
                    CAS NO: {product.casNumber}
                  </span>
                  {product.chemicalFormula && (
                    <span className="px-2 py-1 bg-surface-muted rounded-md border border-surface-border">
                      Formula: {product.chemicalFormula}
                    </span>
                  )}
                </div>
              )}
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                {product.shortDescription || product.description}
              </p>
            </div>

            {/* Main Specs Grid */}
            <div className="grid grid-cols-3 gap-4 border-y border-surface-border py-6">
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">Purity</span>
                <span className="font-semibold text-sm text-text-primary">{product.purity || 'N/A'}</span>
              </div>
              <div className="text-center border-x border-surface-border">
                <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">Min Order</span>
                <span className="font-semibold text-sm text-text-primary">
                  {product.minOrderQuantity} {product.unitOfMeasure}
                </span>
              </div>
              <div className="text-center">
                <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-1">Packaging</span>
                <span className="font-semibold text-sm text-text-primary">{product.packagingType || 'IBC/Drum'}</span>
              </div>
            </div>

            {/* Specs Table */}
            <div className="glass-card p-6 space-y-4">
              <h3 className="text-sm font-semibold font-display text-text-primary">
                Technical Specifications
              </h3>
              <div className="divide-y divide-surface-border">
                {product.purity && (
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-text-muted">Assay / Purity</span>
                    <span className="font-medium text-text-secondary">{product.purity}</span>
                  </div>
                )}
                {product.casNumber && (
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-text-muted">CAS registry number</span>
                    <span className="font-medium text-text-secondary">{product.casNumber}</span>
                  </div>
                )}
                {product.chemicalFormula && (
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-text-muted">Chemical formula</span>
                    <span className="font-medium text-text-secondary">{product.chemicalFormula}</span>
                  </div>
                )}
                {product.appearance && (
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-text-muted">Appearance</span>
                    <span className="font-medium text-text-secondary">{product.appearance}</span>
                  </div>
                )}
                {product.density && (
                  <div className="flex items-center justify-between py-2 text-xs">
                    <span className="text-text-muted">Density</span>
                    <span className="font-medium text-text-secondary">{product.density}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href={`/quote?product=${product.slug}`}
                className="btn-primary flex-1 justify-center py-3.5 text-sm"
              >
                <Send className="w-4 h-4" /> Request Quote & Spec Sheet
              </Link>
              <button
                className="btn-secondary flex items-center justify-center gap-2 py-3.5 px-6 text-sm"
                aria-label="Download MSDS sheet"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>MSDS Sheet</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Caution/Handling note */}
            {product.hazardClassification && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-text-secondary">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block mb-1">Hazard Identification</span>
                  {product.hazardClassification} — strictly read the SDS sheet and wear correct personal protective equipment (PPE) before handling.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Products Section */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-surface-border">
            <h2 className="font-display font-bold text-text-primary text-2xl mb-8">
              Related Chemicals
            </h2>
            <div className="grid-products">
              {related.map((prod) => (
                <ProductCard key={prod.id} product={prod} />
              ))}
            </div>
          </section>
        )}

        <WhatsAppButton message={`Hello, I would like to inquire about ${product.name} (CAS: ${product.casNumber || 'N/A'}).`} />
      </div>
    </div>
  )
}
