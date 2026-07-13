import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { generatePageMetadata } from '@/lib/metadata'
import { productService } from '@/services/productService'
import { productSchema, breadcrumbSchema, faqSchema, graphSchema, toJsonLd } from '@/lib/schema'
import ProductCard from '@/components/shared/ProductCard'
import ProtectedProductImage from '@/components/shared/ProtectedProductImage'
import WhatsAppButton from '@/components/shared/WhatsAppButton'
import { Award, AlertCircle, ArrowLeft, Send, CheckCircle2, Package, Database, ShieldCheck, FileText, Download, ExternalLink } from 'lucide-react'
export const dynamic = 'force-dynamic';
// ISR: revalidate every 5 minutes
export const revalidate = 300

interface PageProps {
  params: Promise<{ slug: string }>
}

// Pre-render all active product pages at build time
export async function generateStaticParams() {
  try {
    const res = await productService.list({ pageSize: 1000 })
    return (res.results ?? [])
      .filter((p: any) => p.status === 'active')
      .map((p: any) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

type DetailRow = { label: string; value?: string | number | null }

function textParagraphs(value?: string | null) {
  return value?.split(/\n+/).map((p) => p.trim()).filter(Boolean) ?? []
}

function compactRows(rows: DetailRow[]) {
  const seen = new Set<string>()
  const hidden = new Set(['assay', 'assay / purity', 'density', 'minimum order', 'min order', 'purity'])
  return rows.filter((r) => {
    if (r.value == null || r.value === '') return false
    const k = r.label.toLowerCase()
    if (hidden.has(k) || seen.has(k)) return false
    seen.add(k)
    return true
  })
}

function contentList(items?: string[]) {
  return (items ?? []).map((i) => i.trim()).filter(Boolean)
}

function displayCopy(value?: string | null) {
  return (value ?? '')
    .replace(/\bpricing\b/gi, 'quotation details')
    .replace(/\bprices\b/gi, 'quotations')
    .replace(/\bprice\b/gi, 'quotation')
}

function searchUrl(base: string, name: string) {
  return `${base}${encodeURIComponent(name)}`
}

// ── Keyword builder (matches backend _auto_keywords logic) ───────────────────
function buildProductKeywords(product: any): string[] {
  const name = product.name
  const cat = product.category?.name ?? 'industrial chemical'
  const cas = product.casNumber ? [`CAS ${product.casNumber}`] : []
  return [
    name,
    `${name} supplier`,
    `buy ${name}`,
    `${name} Kenya`,
    `${name} Uganda`,
    `${name} Tanzania`,
    `${name} East Africa`,
    `${cat} supplier Kenya`,
    'industrial chemicals Kenya',
    'chemical supplier East Africa',
    ...cas,
    ...(product.seoKeywords?.split(',').map((k: string) => k.trim()) ?? []),
  ].filter(Boolean)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await productService.detail(slug)
    const cat = product.category?.name ?? 'Industrial Chemical'
    const name = product.name

    // Use DB-stored SEO fields first, fall back to auto-generation
    const title = product.seoTitle
      || `${name} — ${cat} Supplier in Kenya & East Africa | Finstar`
    const description = product.seoDescription
      || `Buy ${name} from Finstar — trusted ${cat} supplier in Kenya, Uganda, Tanzania & Rwanda. ${product.shortDescription ?? ''} Request a bulk quote today.`.slice(0, 220)
    const ogTitle = product.ogTitle || title
    const twitterDesc = product.twitterDescription || description

    return generatePageMetadata({
      title,
      description,
      canonical: `/products/${product.slug}`,
      keywords: buildProductKeywords(product),
      ogImage: product.primaryImage || undefined,
      ogTitle,
      twitterDescription: twitterDesc,
      updatedAt: product.updatedAt,
    })
  } catch {
    return generatePageMetadata({
      title: 'Product Not Found',
      description: 'The requested Finstar Industrial Chemicals product could not be found.',
      noIndex: true,
    })
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params
  let product: any
  let related: any[] = []

  try {
    product = await productService.detail(slug)
    related = await productService.related(product.slug, 3).catch(() => [])
  } catch {
    notFound()
  }

  // ── Schema: combine Product + Breadcrumb + FAQ into one @graph ────────────
  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Products', href: '/products' },
    { name: product.category?.name ?? 'Chemicals', href: `/products?category=${product.category?.slug ?? ''}` },
    { name: product.name, href: `/products/${product.slug}` },
  ]
  const productFaqs = (product.faqs ?? [])
    .map((f: any) => ({ q: f.q || f.question, a: f.a || f.answer }))
    .filter((f: any) => f.q && f.a)

  const schemaGraph = graphSchema([
    productSchema(product),
    breadcrumbSchema(breadcrumbItems),
    ...(productFaqs.length > 0 ? [faqSchema(productFaqs)!] : []),
  ])

  // ── Content preparation ───────────────────────────────────────────────────
  const summary = displayCopy(product.shortDescription || product.description)
  const longDesc = displayCopy(product.longDescription || product.description || summary)
  const paragraphs = textParagraphs(longDesc)
  const applications = contentList(product.applications).map(displayCopy)
  const benefits = contentList(product.benefits).map(displayCopy)
  const features = contentList(product.features).map(displayCopy)
  const industries = contentList(product.industriesServed).map(displayCopy)
  const specRows = compactRows([
    ...(product.specifications ?? []).map((s: any) => ({
      label: s.key, value: s.unit ? `${s.value} ${s.unit}` : s.value,
    })),
    { label: 'Chemical Formula', value: product.chemicalFormula },
    { label: 'Appearance', value: product.appearance },
    { label: 'CAS Number', value: product.casNumber },
    { label: 'Purity', value: product.purity },
    { label: 'Density', value: product.density },
  ])
  const overviewRows = compactRows([
    { label: 'Product Name', value: product.name },
    { label: 'Category', value: product.category?.name },
    { label: 'Packaging', value: product.packagingType },
    // { label: 'Min. Order', value: product.minOrderQuantity ? `${product.minOrderQuantity} ${product.unitOfMeasure ?? 'KG'}` : null },
    { label: 'Availability', value: product.status === 'active' ? 'In Stock — Ready for Dispatch' : product.status },
  ])
  const detailBlocks = [
    { title: 'Applications', items: applications },
    { title: 'Benefits', items: benefits },
    { title: 'Features', items: features },
  ].filter((b) => b.items.length > 0)

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      {/* Single @graph JSON-LD for Product + Breadcrumb + FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(schemaGraph) }}
      />

      {/* Semantic Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="border-b border-surface-border bg-surface-card/30 py-4">
        <div className="container-wide flex min-w-0 items-center justify-between gap-3 text-xs">
          <Link
            href="/products"
            className="flex min-h-11 shrink-0 items-center gap-1.5 text-text-secondary hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalogue
          </Link>
          <ol className="hidden min-w-0 items-center gap-2 text-text-muted sm:flex" itemScope itemType="https://schema.org/BreadcrumbList">
            {breadcrumbItems.map((item, i) => (
              <li key={item.href} className="flex items-center gap-2" itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                {i > 0 && <span aria-hidden>/</span>}
                {i < breadcrumbItems.length - 1 ? (
                  <Link href={item.href} className="hover:text-text-secondary" itemProp="item">
                    <span itemProp="name">{item.name}</span>
                  </Link>
                ) : (
                  <span className="text-text-primary truncate max-w-xs" itemProp="name">{item.name}</span>
                )}
                <meta itemProp="position" content={String(i + 1)} />
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="container-wide py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Product Image */}
          <div className="lg:col-span-5 space-y-6">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-card border border-surface-border group shadow-glow-blue flex items-center justify-center">
              {product.primaryImage ? (
                <ProtectedProductImage
                  src={product.primaryImage}
                  alt={product.imageAlt || `${product.name} — ${product.category?.name ?? 'Industrial Chemical'} by Finstar`}
                  title={product.imageTitle || product.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  priority
                />
              ) : (
                <Award className="w-20 h-20 text-text-muted/30" aria-hidden />
              )}
              <div className="absolute bottom-4 left-4 rounded bg-black/35 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80 backdrop-blur-sm">
                Finstar
              </div>
              <div className="absolute top-4 left-4">
                {product.status === 'active' ? (
                  <span className="badge-amber bg-amber-500/10 text-amber-400">In Stock</span>
                ) : (
                  <div className="absolute left-1/2 top-24 w-[145%] -translate-x-1/2 -rotate-12 bg-red-600 py-2 text-center shadow-2xl ring-1 ring-white/30">
                    <span className="text-sm font-black uppercase tracking-[0.24em] text-white drop-shadow">Out of Stock</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Right: Details */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <Link href={`/products?category=${product.category?.slug}`} className="section-label inline-block">
                {product.category?.name}
              </Link>
              <h1 className="font-display font-bold text-text-primary text-2xl sm:text-3xl md:text-4xl leading-tight break-anywhere">
                {product.name}
              </h1>

              {product.chemicalFormula && (
                <span className="inline-flex w-fit rounded-md border border-surface-border bg-surface-muted px-2 py-1 text-xs text-text-muted">
                  Formula: <strong className="ml-1">{product.chemicalFormula}</strong>
                </span>
              )}
              {product.casNumber && (
                <span className="inline-flex w-fit rounded-md border border-surface-border bg-surface-muted px-2 py-1 text-xs text-text-muted ml-2">
                  CAS: {product.casNumber}
                </span>
              )}
              <p className="text-text-secondary text-sm md:text-base leading-relaxed">{summary}</p>
            </div>

            {/* Packaging strip */}
            {/* <div className="border-y border-surface-border py-4 flex items-center gap-3">
              <Package className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-[10px] uppercase tracking-wider text-text-muted mb-0.5">Packaging</span>
                <span className="font-semibold text-sm text-text-primary">{product.packagingType}</span>
              </div>
            </div> */}

            {/* Specs Table */}
            {specRows.length > 0 && (
              <div className="glass-card p-6 space-y-4">
                <h2 className="text-sm font-semibold font-display text-text-primary flex items-center gap-2">
                  <Database className="w-4 h-4 text-amber-400" />
                  Technical Specifications
                </h2>
                <div className="divide-y divide-surface-border">
                  {specRows.map((spec) => (
                    <div key={spec.label} className="grid grid-cols-1 gap-1 py-2 text-xs sm:grid-cols-2 sm:gap-4">
                      <span className="text-text-muted break-anywhere">{spec.label}</span>
                      <span className="font-medium text-text-secondary break-anywhere sm:text-right">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              {/* Datasheet button — shown only when a datasheet exists */}
              {(() => {
                const datasheets = (product.technicalDocs ?? []).filter((d: any) => d.doc_type === 'datasheet')
                const primarySheet = datasheets[0]
                if (!primarySheet) return null
                return (
                  <Link
                    href={primarySheet.pdf_file ?? `/technical-docs/${primarySheet.slug}`}
                    target={primarySheet.pdf_file ? '_blank' : undefined}
                    rel={primarySheet.pdf_file ? 'noopener noreferrer' : undefined}
                    download={primarySheet.pdf_file ? true : undefined}
                    className="btn-secondary flex items-center justify-center gap-2 py-3.5 text-sm border-amber-500/40 text-amber-400 hover:bg-amber-500/10"
                  >
                    {primarySheet.pdf_file ? (
                      <><Download className="w-4 h-4" /> Download Data Sheet</>
                    ) : (
                      <><FileText className="w-4 h-4" /> View Data Sheet</>
                    )}
                  </Link>
                )
              })()}

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href={`/quote?product=${product.slug}`} className="btn-primary flex-1 justify-center py-3.5 text-sm">
                  <Send className="w-4 h-4" /> Request Quote &amp; Spec Sheet
                </Link>
                <WhatsAppButton
                  variant="inline"
                  message={product.whatsappTemplate || `Hello Finstar, I am interested in ${product.name}. Please send availability and quotation details.`}
                  className="flex-1 justify-center"
                />
              </div>
            </div>

            {/* Hazard / Safety */}
            {product.hazardClassification && (
              <div className="flex items-start gap-3 p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-xs text-text-secondary" role="alert" aria-label="Safety Information">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" aria-hidden />
                <div>
                  <span className="font-semibold text-text-primary block mb-1">Safety Information</span>
                  {displayCopy(product.hazardClassification)} — use correct personal protective equipment (PPE) and follow site safety procedures before handling.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Full Product Details ──────────────────────────────────────────── */}
        <section className="mt-16 border-t border-surface-border pt-12" aria-label="Full Product Details">
          <div className="mb-8 max-w-3xl">
            <span className="section-label">Full Product Details</span>
            <h2 className="mt-3 font-display text-2xl font-bold text-text-primary md:text-3xl">
              {product.name} — Specifications, Uses & Availability
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-8">
              {/* Overview Table */}
              {overviewRows.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="border-b border-surface-border px-4 py-4 sm:px-6">
                    <h3 className="font-display text-lg font-semibold text-text-primary">Product Overview</h3>
                  </div>
                  <div className="divide-y divide-surface-border">
                    {overviewRows.map((row) => (
                      <div key={row.label} className="grid grid-cols-1 gap-2 px-4 py-4 text-sm sm:grid-cols-3 sm:px-6">
                        <span className="font-medium text-text-muted">{row.label}</span>
                        <span className="sm:col-span-2 text-text-secondary">{row.value}</span>
                      </div>
                    ))}
                    <p className="px-4 py-4 text-sm leading-7 sm:px-6">
                      Explore{' '}
                      <Link href={`/products?category=${product.category?.slug}`} className="text-amber-400 hover:text-amber-300 hover:underline underline-offset-4">
                        {product.category?.name}
                      </Link>
                      , browse the full{' '}
                      <Link href="/products" className="text-amber-400 hover:text-amber-300 hover:underline underline-offset-4">
                        chemical catalogue
                      </Link>
                      , or{' '}
                      <Link href={`/quote?product=${product.slug}`} className="text-amber-400 hover:text-amber-300 hover:underline underline-offset-4">
                        request a quote
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}

              {/* Long Description */}
              {paragraphs.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">About {product.name}</h3>
                  <div className="mt-4 space-y-4 text-sm leading-7 text-text-secondary">
                    {paragraphs.map((p, i) => (
                      <p key={i}>
                        {p}
                        {i === 0 && (
                          <>
                            {' '}For scientific reference, see{' '}
                            <a href={searchUrl('https://pubchem.ncbi.nlm.nih.gov/#query=', product.name)} target="_blank" rel="nofollow noopener noreferrer" className=" hover:text-amber-300 hover:underline underline-offset-4">
                              PubChem
                            </a>
                            {' '}and{' '}
                            <a href={searchUrl('https://en.wikipedia.org/wiki/Special:Search?search=', product.name)} target="_blank" rel="nofollow noopener noreferrer" className=" hover:text-amber-300 hover:underline underline-offset-4">
                              Wikipedia
                            </a>.
                          </>
                        )}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Applications / Benefits / Features blocks */}
              {detailBlocks.map((block) => (
                <div key={block.title} className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">{block.title}</h3>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {block.items.map((item) => (
                      <div key={item} className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-muted/20 p-3 text-sm text-text-secondary">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" aria-hidden />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Industries Served */}
              {industries.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">Industries Served</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {industries.map((ind) => (
                      <span key={ind} className="badge-muted px-3 py-1.5 text-xs font-medium">{ind}</span>
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-text-muted leading-relaxed">
                    {product.name} is supplied by Finstar to industrial buyers across Kenya, Uganda, Tanzania, and Rwanda.
                    Read our <Link href="/blog" className="text-amber-400 hover:text-amber-300 hover:underline underline-offset-4">chemical safety guides</Link> for handling best practices.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:col-span-5 space-y-6">
              {/* Availability CTA Card */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold text-text-primary">
                  Supply in Kenya, Uganda, Tanzania & Rwanda
                </h3>
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

              {/* Safety Information Card */}
              {product.hazardClassification && (
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-400" aria-hidden />
                    Safety &amp; Handling
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-text-secondary">
                    {displayCopy(product.hazardClassification)}
                  </p>
                  <p className="mt-2 text-xs text-text-muted">
                    Always consult the product Safety Data Sheet (SDS) before handling. Contact Finstar for GHS-compliant documentation.
                  </p>
                </div>
              )}

              {/* Data Sheet Card — shown when technical docs exist */}
              {(product.technicalDocs ?? []).length > 0 && (
                <div className="glass-card p-6 border border-amber-500/20">
                  <h3 className="font-display text-base font-semibold text-text-primary flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" aria-hidden />
                    Technical Documents
                  </h3>
                  <p className="mt-2 text-xs text-text-muted leading-relaxed">
                    Official Finstar product data sheets, safety specifications, and compliance guides.
                  </p>
                  <div className="mt-4 space-y-3">
                    {(product.technicalDocs as any[]).map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between gap-3 rounded-lg border border-surface-border bg-surface-muted/20 px-3 py-2.5">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-text-primary truncate">{doc.title}</p>
                          <p className="text-[10px] text-text-muted mt-0.5">{doc.doc_type_label ?? doc.doc_type}</p>
                        </div>
                        {doc.pdf_file ? (
                          <a
                            href={doc.pdf_file}
                            download
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                            aria-label={`Download ${doc.title}`}
                          >
                            <Download className="w-3.5 h-3.5" /> PDF
                          </a>
                        ) : (
                          <Link
                            href={`/technical-docs/${doc.slug}`}
                            className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                            aria-label={`View ${doc.title}`}
                          >
                            <ExternalLink className="w-3.5 h-3.5" /> View
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FAQ Accordion */}
              {productFaqs.length > 0 && (
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold text-text-primary">Frequently Asked Questions</h3>
                  <div className="mt-4 space-y-4">
                    {productFaqs.map((faq: any) => (
                      <div key={faq.q} className="border-b border-surface-border pb-4 last:border-b-0 last:pb-0">
                        <h4 className="text-sm font-semibold text-text-primary">{displayCopy(faq.q)}</h4>
                        <p className="mt-2 text-sm leading-6 text-text-secondary">{displayCopy(faq.a)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </section>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-surface-border" aria-label="Related Products">
            <h2 className="font-display font-bold text-text-primary text-2xl mb-8">Related Chemicals</h2>
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
