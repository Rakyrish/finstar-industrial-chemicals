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
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Delivering high-purity raw materials, compliant supply chains, and chemical engineering expertise to industrial manufacturing partners since 2011.
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
              Finstar Industrial Chemicals has established itself as one of the premier chemical sourcing and distribution entities in the region. We cater to diverse industrial sectors, including paints & coatings, water treatment, food manufacturing, construction chemicals, and laboratory research.
            </p>
            <p className="text-sm text-text-secondary leading-relaxed">
              We understand that raw material quality directly impacts your final product performance. That is why our supply chain is ISO 9001:2015 certified, offering full batch traceability, safety documentation compliance, and laboratory verification on every scheduled chemical delivery.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4 text-xs text-text-muted">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-400" />
                <span>Nairobi Headquarters</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>East Africa Logistics</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>ISO 9001 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                <span>15+ YearsSourced</span>
              </div>
            </div>
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
              All chemicals supplied by Finstar are fully certified. We verify purity, handling safety, and compliance with local authorities like KEBS and international GHS directives.
            </p>
            <div className="pt-4 border-t border-surface-border flex justify-around text-xs">
              <div>
                <span className="font-bold text-lg text-amber-400 block">500+</span>
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

      {/* Historical Milestones */}
      <section className="container-wide py-20 space-y-12">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="section-label">Milestones</span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-text-primary">
            Timeline of Excellence
          </h2>
          <p className="text-xs text-text-secondary">
            A history of continuous growth, storage expansions, and regional supply integrations.
          </p>
        </div>

        <div className="relative border-l border-surface-border pl-6 max-w-3xl mx-auto space-y-8">
          {MILESTONES.map((stone) => (
            <div key={stone.year} className="relative">
              {/* Dot indicator */}
              <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-amber-gradient border-2 border-surface shadow-glow-amber" />
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
                <span className="font-display font-bold text-amber-400 text-base shrink-0 pt-0.5">
                  {stone.year}
                </span>
                <div>
                  <h3 className="font-semibold text-sm text-text-primary mb-1">{stone.title}</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">{stone.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Warehouse visit */}
      <div className="container-wide max-w-4xl">
        <div className="rounded-3xl bg-hero-gradient border border-brand-700/50 p-8 md:p-12 text-center space-y-6">
          <MapPin className="w-12 h-12 text-amber-400 mx-auto animate-bounce" />
          <h2 className="font-display font-semibold text-xl md:text-2xl text-text-primary">
            Visit Our Main Warehouse & Sourcing Labs
          </h2>
          <p className="text-xs md:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            Interested in viewing our storage facilities or auditing our quality management controls? Reach out to schedule a facility walkthrough at our Industrial Area, Nairobi complex.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary">
              <Mail className="w-4 h-4" /> Schedule Facility Visit
            </Link>
            <Link href="/products" className="btn-outline">
              Browse Sourced Chemicals
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
