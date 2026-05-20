'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Award, Truck, HeadphonesIcon, FileText, RefreshCw } from 'lucide-react'

const REASONS = [
  {
    icon: CheckCircle2,
    title: 'Verified Quality',
    desc: 'Every batch is tested and comes with a Certificate of Analysis. We source from ISO-certified manufacturers globally.',
  },
  {
    icon: Truck,
    title: 'Reliable Delivery',
    desc: 'Nationwide delivery network with real-time tracking. Bulk orders dispatched within 48 hours.',
  },
  {
    icon: HeadphonesIcon,
    title: 'Expert Support',
    desc: 'Our team of chemical engineers provides application support, regulatory guidance, and technical advice.',
  },
  {
    icon: Award,
    title: 'Competitive Pricing',
    desc: 'Direct relationships with manufacturers enable us to offer the best market pricing without compromising quality.',
  },
  {
    icon: FileText,
    title: 'Full Documentation',
    desc: 'Safety Data Sheets, Technical Data Sheets, and regulatory documents provided for every product.',
  },
  {
    icon: RefreshCw,
    title: 'Google Sheets Sync',
    desc: 'Real-time inventory visibility. Check stock levels instantly and get automated low-stock alerts.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="section-pad" aria-label="Why choose Finstar">
      <div className="container-wide">
        <div className="text-center mb-14">
          <span className="section-label mb-3">Why Finstar</span>
          <h2 className="font-display font-bold text-text-primary">
            The Finstar Advantage
          </h2>
          <p className="mt-3 text-text-secondary max-w-2xl mx-auto">
            We go beyond simply supplying chemicals — we are your long-term industrial partner.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {REASONS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group p-6 glass-card hover:border-amber-500/30 transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/20 transition-colors">
                  <Icon className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="font-display font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
