"use client"

import { useState } from 'react'
import { FileText, Download, Printer, ArrowLeft, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import { formatDate } from '@/utils'

interface ViewerProps {
  doc: {
    title: string
    doc_type: string
    doc_type_label: string
    standard_code?: string
    excerpt: string
    body_html: string
    pdf_file?: string | null
    created_at: string
    updated_at: string
    related_products?: any[]
  }
}

export default function TechnicalDocViewer({ doc }: ViewerProps) {
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 150)
  }

  return (
    <div className="space-y-8">
      {/* Print styles injected locally */}
      <style jsx global>{`
        @media print {
          /* Hide navigation, sidebar, headers, footers, buttons */
          nav,
          header,
          footer,
          .no-print,
          button,
          .btn,
          a[href] {
            display: none !important;
          }
          
          body {
            background: white !important;
            color: black !important;
            font-size: 12pt !important;
          }

          .print-container {
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }

          /* Ensure technical page layout breaks nicely */
          h2, h3 {
            page-break-after: avoid;
            page-break-inside: avoid;
          }
          table, tr, img {
            page-break-inside: avoid;
          }
        }
      `}</style>

      {/* Action panel */}
      <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 border border-surface-border bg-surface-card/60 backdrop-blur rounded-3xl">
        <Link
          href="/technical-docs"
          className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Link>
        <div className="flex items-center gap-3">
          {doc.pdf_file ? (
            <a
              href={doc.pdf_file}
              download
              className="btn-secondary py-2.5 px-5 flex items-center gap-2 text-xs rounded-2xl border border-surface-border text-text-secondary hover:text-text-primary"
            >
              <Download className="w-4 h-4" />
              Download Official PDF
            </a>
          ) : (
            <button
              onClick={handlePrint}
              className="btn-primary py-2.5 px-5 flex items-center gap-2 text-xs rounded-2xl bg-amber-500 hover:bg-amber-600 text-surface font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              Download / Print PDF
            </button>
          )}
        </div>
      </div>

      {/* Main Document Content Area */}
      <div className="print-container card border border-surface-border bg-surface-card rounded-3xl p-6 md:p-12 shadow-card space-y-8">
        {/* Document Header */}
        <div className="border-b border-surface-border pb-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              {doc.doc_type_label || doc.doc_type}
            </span>
            <span className="text-xs text-text-muted">
              Updated: {formatDate(doc.updated_at)}
            </span>
          </div>

          <h1 className="font-display font-bold text-text-primary text-2xl md:text-4xl leading-tight">
            {doc.title}
          </h1>

          {doc.standard_code && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-surface bg-amber-500 px-2.5 py-1 rounded">
                STANDARD REFERENCE: {doc.standard_code}
              </span>
            </div>
          )}
        </div>

        {/* Document abstract / excerpt */}
        <div className="p-4 bg-surface/50 border-l-4 border-amber-500 rounded-r-2xl">
          <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">
            Technical Abstract
          </h4>
          <p className="text-xs md:text-sm text-text-secondary leading-relaxed italic">
            {doc.excerpt}
          </p>
        </div>

        {/* HTML Content Body */}
        <article 
          className="prose prose-invert max-w-none text-text-secondary text-sm md:text-base leading-relaxed space-y-6"
          dangerouslySetInnerHTML={{ __html: doc.body_html }}
        />

        {/* Product Relations */}
        {doc.related_products && doc.related_products.length > 0 && (
          <div className="no-print pt-6 border-t border-surface-border space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Associated Products
            </h4>
            <div className="flex flex-wrap gap-3">
              {doc.related_products.map((prod) => (
                <Link
                  key={prod.id}
                  href={`/products/${prod.slug}`}
                  className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-2xl border border-surface-border bg-surface/30 text-text-secondary hover:text-amber-400 hover:border-amber-500/40 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {prod.name}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Corporate Footer for Print PDF */}
        <div className="hidden print:block pt-8 border-t border-surface-border text-center text-[10px] text-text-muted">
          <p className="font-semibold text-text-primary">Finstar Industrial Chemicals</p>
          <p className="mt-1">P.O. Box Nairobi, Kenya • info@finstarindustrial.com • www.finstarindustrial.com</p>
          <p className="mt-2 opacity-50">This is an automated safety specification/compliance data sheet verified via Finstar Quality Assurance.</p>
        </div>
      </div>
    </div>
  )
}
