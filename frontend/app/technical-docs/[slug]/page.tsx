import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { generatePageMetadata } from '@/lib/metadata'
import { technicalDocService } from '@/services/technicalDocService'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import TechnicalDocViewer from '@/components/technical-docs/TechnicalDocViewer'
import { ArrowLeft } from 'lucide-react'

export const revalidate = 600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const docs = await technicalDocService.list()
    return docs.map((doc: any) => ({ slug: doc.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const doc = await technicalDocService.bySlug(slug)
    if (!doc) throw new Error('Not found')
    
    return generatePageMetadata({
      title: `${doc.title} — Finstar Technical Sheets`,
      description: doc.excerpt || `Technical documentation sheet for ${doc.title} including safety guidelines, ISO compliance, and standard specifications.`,
      canonical: `/technical-docs/${doc.slug}`,
      keywords: [doc.title, doc.standard_code || '', 'chemical spec sheet', 'MSDS PDF Kenya'],
      updatedAt: doc.updated_at,
    })
  } catch {
    return generatePageMetadata({
      title: 'Document Not Found',
      description: 'The requested technical document could not be found.',
      noIndex: true,
    })
  }
}

export default async function TechnicalDocDetailPage({ params }: PageProps) {
  const { slug } = await params
  const doc = await technicalDocService.bySlug(slug)

  if (!doc) {
    notFound()
  }

  const breadcrumbItems = [
    { name: 'Home', href: '/' },
    { name: 'Technical Docs', href: '/technical-docs' },
    { name: doc.title, href: `/technical-docs/${doc.slug}` },
  ]

  const bSchema = breadcrumbSchema(breadcrumbItems)

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(bSchema) }}
      />

      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb" className="border-b border-surface-border bg-surface-card/30 py-4 no-print">
        <div className="container-wide flex min-w-0 items-center justify-between gap-3 text-xs">
          <Link href="/technical-docs" className="flex min-h-11 shrink-0 items-center gap-1.5 text-text-secondary hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Technical Library
          </Link>
          <ol className="hidden min-w-0 items-center gap-2 text-text-muted sm:flex">
            {breadcrumbItems.map((item, i) => (
              <li key={item.href} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>/</span>}
                {i < breadcrumbItems.length - 1
                  ? <Link href={item.href} className="hover:text-text-secondary">{item.name}</Link>
                  : <span className="text-text-primary truncate max-w-xs">{item.name}</span>
                }
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <main className="container-wide py-12 max-w-4xl space-y-8">
        <TechnicalDocViewer doc={doc} />
      </main>
    </div>
  )
}
