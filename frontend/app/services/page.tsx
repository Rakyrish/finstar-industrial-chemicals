import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'
import Link from 'next/link'
import { FlaskConical, Truck, FileText, Headphones, BarChart3, Database, ShieldCheck, ArrowRight } from 'lucide-react'

export const metadata: Metadata = generatePageMetadata({
  title: 'Chemical Supply Services & Technical Consulting',
  description: 'Procure bulk industrial chemicals safely. We provide logistic support across East Africa, product blending, safety compliance, and automated inventory sync services.',
  canonical: '/services',
  keywords: ['chemical services Nairobi', 'bulk chemicals transport', 'custom chemical blending', 'chemical laboratory consulting'],
})

const FULL_SERVICES = [
  {
    id: 'bulk-supply',
    icon: FlaskConical,
    title: 'Bulk Chemical Procurement',
    subtitle: 'Scalable supply chains for high-volume chemicals',
    desc: 'Through our vetted global network of chemical manufacturers, we offer secure bulk procurement services. We maintain deep stock reserves of high-purity industrial solvents, acids, alkalis, and process chemicals to ensure supply-chain continuity for your manufacturing facilities.',
    features: ['Flexible packaging (drums, IBC totes, bulk tankers)', 'Guaranteed Certificate of Analysis (COA) compliance', 'Structured volume discounts & contractual pricing models', 'Dedicated category managers for raw-material security'],
  },
  {
    id: 'logistics',
    icon: Truck,
    title: 'Compliant Logistics & Transport',
    subtitle: 'East African regional delivery networks',
    desc: 'Chemical distribution requires specialized compliance, routing, and safety. We manage temperature-sensitive shipping, hazardous materials logistics, and KEBS cross-border clearance. Our delivery fleet is fully licensed to transport scheduled chemicals across East Africa securely.',
    features: ['Hazardous materials licensed delivery fleet', 'Real-time GPS vehicle tracking & dispatch notifications', 'Full regional clearance and customs coordination', 'Spill-kit equipped and trained logistics professionals'],
  },
  {
    id: 'compliance',
    icon: ShieldCheck,
    title: 'Regulatory & Safety Compliance',
    subtitle: 'Safety first. GHS, SDS, and technical datasheets',
    desc: 'We strictly adhere to standard hazardous material classification guidelines. Finstar provides up-to-date Safety Data Sheets (SDS), detailed Technical Data Sheets (TDS), and clear chemical labelling instructions so your staff remains safe and compliant.',
    features: ['GHS-compliant labelling on all drums and IBCs', 'Latest SDS/TDS provided in accessible digital forms', 'Storage compliance safety consulting', 'Assistance with regional authority chemical registrations'],
  },
  {
    id: 'consulting',
    icon: Headphones,
    title: 'Application Technical Support',
    subtitle: 'Chemical engineers at your service',
    desc: 'Don&rsquo;t just procure — optimize. Our in-house technical consulting team includes experienced industrial chemical engineers who can audit your processes, recommend raw material substitutes, and solve chemical compatibility or purification problems.',
    features: ['Manufacturing process chemical auditing', 'Substance replacement and optimization advisory', 'Blending compatibility safety reviews', 'Waste-water treatment efficiency analysis'],
  },
  {
    id: 'inventory',
    icon: BarChart3,
    title: 'Real-Time Inventory Sync',
    subtitle: 'Automated low-stock safety triggers',
    desc: 'Say goodbye to production stoppages caused by running out of raw materials. We sync our stocks in real-time with our customer ERPs or collaborative Google Sheets setups, alerting procurement managers automatically when critical chemical stocks drop below safety levels.',
    features: ['Automated reorder-level alerts via email', 'Shared client inventory dashboard integration', 'Just-In-Time (JIT) scheduling support', 'Consigned inventory models for qualified buyers'],
  },
  {
    id: 'formulations',
    icon: Database,
    title: 'Custom Blending & Formulation',
    subtitle: 'Bespoke chemical mixtures made to order',
    desc: 'If your manufacturing process requires a specific blend or concentration of raw solvents, acids, or surfactants, we provide contract chemical blending services. We mix, test, pack, and label custom formulations inside our state-of-the-art laboratory.',
    features: ['Custom concentration solvent and acid blending', 'Confidential formulation recipe protection', 'Strict quality control batch validation', 'Pilot batch sampling before full industrial execution'],
  },
]

export default function ServicesPage() {
  const bSchema = breadcrumbSchema([
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
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
          <span className="section-label mb-4">What We Do</span>
          <h1 className="font-display font-bold text-text-primary text-4xl md:text-5xl mb-4">
            Industrial Chemical Services
          </h1>
          <p className="text-text-secondary max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Finstar delivers comprehensive bulk chemical solutions, safe logistical networks, regulatory compliance documentation, and custom formulations for manufacturers across East Africa.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-wide py-20 space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FULL_SERVICES.map((svc) => {
            const Icon = svc.icon
            return (
              <article
                key={svc.id}
                id={svc.id}
                className="glass-card p-8 border border-surface-border flex flex-col justify-between hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="space-y-6">
                  {/* Service Icon & Title */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-lg text-text-primary">
                        {svc.title}
                      </h2>
                      <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wide">
                        {svc.subtitle}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
                    {svc.desc}
                  </p>

                  {/* Bullet features */}
                  <ul className="space-y-2.5">
                    {svc.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Card CTA */}
                <div className="pt-6 border-t border-surface-border mt-8 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-text-muted uppercase">
                    Tailored Solutions
                  </span>
                  <Link
                    href={`/quote?service=${svc.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors group"
                  >
                    Consult on this service
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>

        {/* Global CTA Section */}
        <div className="rounded-3xl bg-surface-card border border-surface-border p-8 md:p-12 text-center max-w-4xl mx-auto space-y-6">
          <h2 className="font-display font-semibold text-xl md:text-2xl text-text-primary">
            Need a Custom Chemical Solution or Supply Schedule?
          </h2>
          <p className="text-xs md:text-sm text-text-secondary max-w-xl mx-auto leading-relaxed">
            Let our process engineers and supply chain managers analyze your requirements. We prepare fully costed, safe, and reliable chemical supply agreements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/quote" className="btn-primary">
              Request Supply Quote
            </Link>
            <Link href="/contact" className="btn-secondary">
              Contact Technical Team
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
