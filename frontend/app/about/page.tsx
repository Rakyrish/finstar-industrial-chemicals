import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import { ShieldCheck, Award, Users, Lightbulb, MapPin, Building, Globe, Mail } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = generatePageMetadata({
  title: 'About Us — Certified Industrial Chemical Distributor',
  description: 'Learn about Finstar Industrial Chemicals: our mission, ISO certified quality, 15+ years experience, and our robust distribution network across East Africa.',
  canonical: '/about',
  keywords: ['chemical distributor Kenya', 'Finstar chemistry team', 'chemical supplier credentials', 'Nairobi chemical warehouse'],
})

const MILESTONES = [
  { year: '2011', title: 'Company Founded', desc: 'Finstar began operations in Nairobi, supplying general industrial solvents to local manufacturers.' },
  { year: '2015', title: 'Warehouse Expansion', desc: 'Opened our modern 25,000 sq ft compliant chemical storage warehouse facility in Industrial Area, Nairobi.' },
  { year: '2018', title: 'ISO 9001:2015 Certification', desc: 'Awarded full ISO certification for quality management, supply chain traceability, and safe chemical storage.' },
  { year: '2022', title: 'Regional Footprint', desc: 'Established cross-border supply hubs in Uganda and Tanzania to support East Africa-wide manufacturing.' },
]

const VALUES = [
  { icon: ShieldCheck, title: 'Absolute Quality Assurance', desc: 'We never compromise. Every chemical batch undergoes quality control validation and is backed by complete traceability documentation.' },
  { icon: Users, title: 'Customer-First Relationship', desc: 'We build long-term supply partnerships. Our dedicated category managers understand your production schedules and ensure you never run out of raw materials.' },
  { icon: Lightbulb, title: 'Technical Innovation', desc: 'We provide technical application support. Our chemical engineers collaborate directly with your team to optimize formulations and processes.' },
  { icon: Award, title: 'Uncompromising Safety Standards', desc: 'From transport compliance to storage security, safety is our priority. We adhere rigorously to GHS labelling, REACH, and local authority mandates.' },
]

export default function AboutPage() {
  const bSchema = breadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
  ])

  return (
    <div className="min-h-screen bg-mesh noise-overlay pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(bSchema) }}
      />

      {/* Header */}
      <header className="page-header relative border-b border-surface-border">
        <div className="absolute inset-0 bg-hero-gradient opacity-90" />
        <div className="relative container-wide text-center">
          <span className="section-label mb-4">Our Story</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            About Finstar Chemicals
          </h1>
          <p className="text-white max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Finstar Chemicals supplies high-quality industrial chemicals and raw materials to businesses across East Africa, offering reliable products, efficient delivery, and expert support to meet diverse manufacturing and industrial needs.

          </p>
        </div>
      </header>

      {/* Narrative Section */}
      <section className="container-wide py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              Who We Are
            </span>
            <h2 className="font-display font-semibold text-2xl md:text-3xl text-text-primary leading-tight">
              A Trusted Partner for East Africa&rsquo;s Industrial sector
            </h2>
            <p className="text-sm text-text-secondary leading-relaxed">
              Finstar Industrial Chemicals is a trusted supplier of industrial and specialty chemicals in East Africa, providing reliable sourcing and distribution solutions for industries including water treatment, food manufacturing, construction, paints & coatings, and laboratory research. We are committed to delivering quality products that support efficient production and dependable industrial performance.
            </p>
          </div>

          {/* Graphical narrative block */}
          <div className="lg:col-span-5 glass-card p-8 border border-surface-border text-center space-y-4 shadow-glow-blue relative overflow-hidden">
            <div className="absolute inset-0 bg-hero-gradient opacity-10 pointer-events-none" />
            <div className="w-16 h-16 rounded-2xl bg-amber-gradient mx-auto flex items-center justify-center text-white shadow-glow-amber">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary">
              Certified Sourcing
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              All chemicals supplied by Finstar Industrial Chemicals are fully certified. We verify purity, safe handling, and adherence to internationally recognized quality and safety standards.
            </p>
            <div className="pt-4 border-t border-surface-border flex justify-around text-xs">
              <div>
                <span className="font-bold text-lg text-amber-400 block">1000+</span>
                <span className="text-text-muted">Products</span>
              </div>
              <div className="border-r border-surface-border" />
              <div>
                <span className="font-bold text-lg text-amber-400 block">100%</span>
                <span className="text-text-muted">Traceability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-surface-card border-y border-surface-border py-20">
        <div className="container-wide space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <span className="section-label">Values</span>
            <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
              Our Core Commitments
            </h2>
            <p className="text-xs text-text-secondary">
              Our business operations, supply procedures, and client relationships are governed by strict values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((val) => {
              const Icon = val.icon
              return (
                <div
                  key={val.title}
                  className="p-6 rounded-2xl bg-surface-muted/30 border border-surface-border flex gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-text-primary mb-1">{val.title}</h3>
                    <p className="text-xs text-text-secondary leading-relaxed">{val.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

     

      {/* CTA Warehouse visit */}
      <div className="container-wide max-w-4xl">
        <div className="rounded-3xl bg-hero-gradient border border-brand-700/50 p-8 md:p-12 text-center space-y-6">
          <MapPin className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h2 className="font-display font-semibold text-xl md:text-2xl text-text-primary">
            Reliable Chemical Supply Solutions
          </h2>
          <p className="text-xs md:text-sm text-white max-w-xl mx-auto leading-relaxed">
            We provide dependable industrial chemical sourcing and distribution services tailored to meet the needs of manufacturers, laboratories, and processing industries across East Africa.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              <Mail className="w-4 h-4" /> Contact Our Team
            </Link>
            <Link href="/products" className="btn-outline">
              Explore Our Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
