import type { Metadata } from 'next'
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { technicalDocService } from '@/services/technicalDocService'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import { formatDate } from '@/utils'
import { FileText, Calendar, Eye, Download, Search, BookOpen } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Product Data Sheets & Industrial Compliance Library',
  description: 'Access official Finstar Product Data Sheets, safety parameters, ISO guidelines, KEBS regulatory compliance, and GHS SDS downloads.',
  canonical: '/technical-docs',
  keywords: ['product data sheets Kenya', 'Finstar technical docs', 'chemical MSDS safety sheets', 'KEBS chemical standards'],
})

const DOC_TYPE_LABELS: Record<string, string> = {
  datasheet: 'Product Data Sheet',
  iso_guide: 'ISO Standard Guide',
  kebs_guide: 'KEBS Compliance Guide',
  iec_guide: 'IEC Standard Guide',
  case_study: 'Case Study',
  whitepaper: 'Technical Whitepaper',
}

interface PageProps {
  searchParams: Promise<{ type?: string }>
}

export default async function TechnicalDocsPage({ searchParams }: PageProps) {
  const { type: docType } = await searchParams
  
  let docs = await technicalDocService.list({ doc_type: docType }).catch(() => [])

  const bSchema = breadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Technical Docs', href: '/technical-docs' },
  ])

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(bSchema) }}
      />

      {/* Page Header */}
      <header className="page-header relative border-b border-surface-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative container-wide text-center">
          <span className="section-label mb-4">Documentation Hub</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            Technical Standards Library
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Download certified product data sheets, safety guidelines, international ISO compliance frameworks, and local KEBS standards.
          </p>
        </div>
      </header>

      <div className="container-wide py-12 space-y-8">
        {/* Document type selection/tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-surface-border pb-4">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-text-muted mr-2">
            Filter Document Type:
          </span>
          <Link
            href="/technical-docs"
            className={`badge min-h-11 text-xs px-3 py-1.5 cursor-pointer rounded-xl transition ${
              !docType ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'badge-muted hover:border-amber-500/30 hover:text-text-primary'
            }`}
          >
            All Documents
          </Link>
          {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
            <Link
              key={key}
              href={`/technical-docs?type=${key}`}
              className={`badge min-h-11 text-xs px-3 py-1.5 cursor-pointer rounded-xl transition ${
                docType === key ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'badge-muted hover:border-amber-500/30 hover:text-text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Documents Listing Grid */}
        {docs.length > 0 ? (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {docs.map((doc) => (
              <article
                key={doc.id}
                className="group card flex flex-col justify-between overflow-hidden hover:-translate-y-1 transition-all duration-300 border border-surface-border p-6 bg-surface-card rounded-3xl shadow-card"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <span className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
                      <FileText className="w-6 h-6" />
                    </span>
                    <span className="badge bg-surface-muted border border-surface-border text-text-secondary text-[10px] px-2 py-0.5 rounded">
                      {DOC_TYPE_LABELS[doc.doc_type] ?? doc.doc_type}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-display font-semibold text-text-primary group-hover:text-amber-400 transition-colors leading-snug text-base">
                      <Link href={`/technical-docs/${doc.slug}`}>{doc.title}</Link>
                    </h3>
                    {doc.standard_code && (
                      <p className="text-xs font-mono text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 inline-block">
                        Ref: {doc.standard_code}
                      </p>
                    )}
                    <p className="text-xs text-text-muted leading-relaxed line-clamp-3">
                      {doc.excerpt}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-border mt-6 flex items-center justify-between text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {doc.view_count || 0} views
                  </span>
                  <Link
                    href={`/technical-docs/${doc.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-semibold hover:underline"
                  >
                    View Document
                    <span className="text-sm font-light">&rarr;</span>
                  </Link>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <div className="glass-card p-12 text-center max-w-md mx-auto border border-surface-border space-y-4">
            <BookOpen className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="font-display font-semibold text-base text-text-primary">
              No Documents Found
            </h3>
            <p className="text-xs text-text-muted leading-relaxed">
              We are currently finalizing chemical specifications, safety data sheets, and ISO guidelines. Check back soon.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
