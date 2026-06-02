import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generatePageMetadata } from '@/lib/metadata'
import { productService } from '@/services/productService'
import { productSchema, toJsonLd } from '@/lib/schema'
import ProductCard from '@/components/shared/ProductCard'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import { Award, AlertCircle, ArrowLeft, Send, CheckCircle2 } from 'lucide-react'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

type DetailRow = {
  label: string
  value?: string | number | null
}

function textParagraphs(value?: string | null) {
  return value?.split(/\n+/).map((paragraph) => paragraph.trim()).filter(Boolean) ?? []
}

function compactRows(rows: DetailRow[]) {
  const seen = new Set<string>()
  const hiddenLabels = new Set(['assay', 'assay / purity', 'cas number', 'cas registry number', 'density', 'minimum order', 'min order', 'purity'])

  return rows.filter((row) => {
    if (row.value === undefined || row.value === null || row.value === '') return false

    const key = row.label.toLowerCase()
    if (hiddenLabels.has(key)) return false
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function contentList(items?: string[]) {
  return (items ?? []).map((item) => item.trim()).filter(Boolean)
}

function displayCopy(value?: string | null) {
  return (value ?? '')
    .replace(/\bpricing\b/gi, 'quotation details')
    .replace(/\bprices\b/gi, 'quotations')
    .replace(/\bprice\b/gi, 'quotation')
}

function searchUrl(base: string, productName: string) {
  return `${base}${encodeURIComponent(productName)}`
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  try {
    const product = await productService.detail(resolvedParams.slug)
    return generatePageMetadata({
      title: `${product.name} — Industrial Chemical Supplier`,
      description: `${product.name}: ${product.shortDescription || 'Industrial chemical supply, packaging, handling guidance, and inquiry options.'}`,
      canonical: `/products/${product.slug}`,
      keywords: [product.name, `${product.name} supplier`, `${product.name} formula`, 'industrial chemicals'],
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
  const summary = displayCopy(product.shortDescription || product.description)
  const longDescription = displayCopy(product.longDescription || product.description || summary)
  const aboutParagraphs = textParagraphs(longDescription)
  const applications = contentList(product.applications).map(displayCopy)
  const benefits = contentList(product.benefits).map(displayCopy)
  const features = contentList(product.features).map(displayCopy)
  const industries = contentList(product.industriesServed).map(displayCopy)
  const specificationRows = compactRows([
    ...(product.specifications ?? []).map((spec) => ({
      label: spec.key,
      value: spec.unit ? `${spec.value} ${spec.unit}` : spec.value,
    })),
    { label: 'Chemical formula', value: product.chemicalFormula },
    { label: 'Appearance', value: product.appearance },
  ])
  const overviewRows = compactRows([
    { label: 'Product Name', value: product.name },
    { label: 'Category', value: product.category?.name },
    { label: 'Packaging Type', value: product.packagingType },
    { label: 'Availability', value: product.status === 'active' ? 'Available for order' : product.status },
  ])
  const detailBlocks = [
    { title: 'Applications', items: applications },
    { title: 'Industries Served', items: industries },
    { title: 'Benefits', items: benefits },
    { title: 'Product Features', items: features },
  ].filter((block) => block.items.length > 0)
  const authorityResources = [
    {
      label: 'Wikipedia',
      href: searchUrl('https://en.wikipedia.org/wiki/Special:Search?search=', product.name),
    },
    {
      label: 'PubChem',
      href: searchUrl('https://pubchem.ncbi.nlm.nih.gov/#query=', product.name),
    },
  ]
  const internalResources = [
    { label: product.category.name, href: `/products?category=${product.category.slug}` },
    { label: 'industrial chemicals catalogue', href: '/products' },
    { label: 'request a quote', href: `/quote?product=${product.slug}` },
    { label: 'chemical safety guides', href: '/blog' },
  ]

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
          {/* Left Column: Image */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-card border border-surface-border group shadow-glow-blue flex items-center justify-center">
              {product.primaryImage ? (
                <Image
                  src={product.primaryImage}
                  alt={product.imageAlt || product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  priority
                />
              ) : (
                <Award className="w-20 h-20 text-text-muted/30" />
              )}

              <div className="absolute bottom-4 left-4 rounded bg-black/35 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                Finstar
              </div>

              {/* Status Indicator */}
              <div className="absolute top-4 left-4">
                {product.status === 'active' ? (
                  <span className="badge-amber bg-amber-500/10 text-amber-400">Available</span>
                ) : (
                  <div className="absolute left-1/2 top-24 w-[145%] -translate-x-1/2 -rotate-12 bg-red-600 py-2 text-center shadow-2xl ring-1 ring-white/30">
                    <span className="text-sm font-black uppercase tracking-[0.24em] text-white drop-shadow">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Title, Key Details, Quote CTA */}
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
              {product.chemicalFormula && (
                <span className="inline-flex w-fit rounded-md border border-surface-border bg-surface-muted px-2 py-1 text-xs text-text-muted">
                  Formula: {product.chemicalFormula}
                </span>
              )}
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">
                {summary}
              </p>
            </div>

            {/* Main Details Grid */}
            <div className="border-y border-surface-border py-6">
              <div>
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
                {specificationRows.map((spec) => (
                  <div key={spec.label} className="flex items-center justify-between gap-4 py-2 text-xs">
                    <span className="text-text-muted">{spec.label}</span>
                    <span className="text-right font-medium text-text-secondary">{spec.value}</span>
                  </div>
                ))}
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
              <WhatsAppButton
                variant="inline"
                message={product.whatsappTemplate || `Hello Finstar, I am interested in ${product.name}. Please send availability and quotation details.`}
                className="flex-1 justify-center"
              />
            </div>

            {/* Caution/Handling note */}
            {product.hazardClassification && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-text-secondary">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-text-primary block mb-1">Hazard Identification</span>
                  {displayCopy(product.hazardClassification)} — use correct personal protective equipment (PPE) and follow site safety procedures before handling.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Full Product Details */}
        <section className="mt-16 border-t border-surface-border pt-12">
          <div className="mb-8 max-w-3xl">
            <span className="section-label">Full Product Details</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-text-primary md:text-3xl">
              {product.name} Details, Specifications and Uses
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-8">
              {overviewRows.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="border-b border-surface-border px-6 py-4">
                    <h3 className="font-display text-lg font-semibold text-text-primary">Product Overview</h3>
                  </div>
                  <div className="divide-y divide-surface-border">
                    {overviewRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-1 gap-2 px-6 py-4 text-sm sm:grid-cols-3">
                        <span className="font-medium text-text-muted">{row.label}</span>
                        <span className="sm:col-span-2 text-text-secondary">{row.value}</span>
                      </div>
                    ))}
                    <p>
                      Explore related{' '}
                      <Link
                        href={internalResources[0].href}
                        className="text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                      >
                        {internalResources[0].label}
                      </Link>
                      , browse the full{' '}
                      <Link
                        href={internalResources[1].href}
                        className="text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                      >
                        {internalResources[1].label}
                      </Link>
                      ,{' '}
                      <Link
                        href={internalResources[2].href}
                        className="text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                      >
                        {internalResources[2].label}
                      </Link>
                      , or read our{' '}
                      <Link
                        href={internalResources[3].href}
                        className="text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                      >
                        {internalResources[3].label}
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {aboutParagraphs.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">About This Product</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-text-secondary">
                    {aboutParagraphs.map((paragraph, index) => (
                      <p key={paragraph}>
                        {paragraph}
                        {index === 0 && (
                          <>
                            {' '}
                            For broader reference, see{' '}
                            <a
                              href={authorityResources[0].href}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                            >
                              {authorityResources[0].label}
                            </a>
                            {' '}and{' '}
                            <a
                              href={authorityResources[1].href}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="text-amber-400 underline-offset-4 transition-colors hover:text-amber-300 hover:underline"
                            >
                              {authorityResources[1].label}
                            </a>
                            .
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {detailBlocks.map((block) => (
                <div key={block.title} className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">{block.title}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {block.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-muted/20 p-3 text-sm text-text-secondary">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-5 space-y-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">Availability in Kenya, Uganda, Tanzania & Rwanda</h3>
                <p className="mt-3 text-sm leading-7 text-text-secondary">
                  {displayCopy(product.ctaContent) || `${product.name} is available from Finstar for industrial buyers, manufacturers, contractors, and institutional procurement teams across Kenya, Uganda, Tanzania, and Rwanda.`}
                </p>
                <div className="mt-5 flex flex-col gap-3">
                  <Link href={`/quote?product=${product.slug}`} className="btn-primary justify-center">
                    <Send className="h-4 w-4" /> Request Quote
                  </Link>
                  <WhatsAppButton
                    variant="inline"
                    message={product.whatsappTemplate || `Hello Finstar, I am interested in ${product.name}. Please send availability and quotation details.`}
                    className="justify-center"
                  />
                </div>
              </div>

              {(product.faqs ?? []).length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">Common Questions</h3>
                  <div className="mt-4 space-y-4">
                    {(product.faqs ?? []).map((faq) => {
                      const question = faq.q || faq.question
                      const answer = faq.a || faq.answer
                      if (!question || !answer) return null

                      return (
                        <div key={question} className="border-b border-surface-border pb-4 last:border-b-0 last:pb-0">
                          <h4 className="text-sm font-semibold text-text-primary">{displayCopy(question)}</h4>
                          <p className="mt-2 text-sm leading-6 text-text-secondary">{displayCopy(answer)}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </aside>
          </div>
        </section>

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

        <WhatsAppButton message={`Hello, I would like to inquire about ${product.name}.`} />
      </div>
    </div>
  )
}
