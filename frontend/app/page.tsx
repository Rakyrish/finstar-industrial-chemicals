import { Suspense } from 'react'
import type { Metadata } from 'next'
import { generatePageMetadata } from '@/lib/metadata'
import HeroSection from '@/features/home/HeroSection'
import StatsSection from '@/features/home/StatsSection'
import FeaturedProducts from '@/features/home/FeaturedProducts'
import CategoriesSection from '@/features/home/CategoriesSection'
import WhyChooseUs from '@/features/home/WhyChooseUs'
import CTABanner from '@/features/home/CTABanner'
import RecentBlog from '@/features/home/RecentBlog'
import { breadcrumbSchema, toJsonLd } from '@/lib/schema'

export const metadata: Metadata = generatePageMetadata({
  title: 'Industrial Chemical Solutions — East Africa',
  description:
    'Finstar Industrial Chemicals: trusted supplier of solvents, acids, reagents, and specialty chemicals. Fast delivery across East Africa. Request a quote today.',
  keywords: [
    'industrial chemicals Kenya', 'chemical supplier Nairobi',
    'industrial solvents East Africa', 'bulk chemicals', 'reagents supplier',
  ],
})

export default function HomePage() {
  const breadcrumb = breadcrumbSchema([{ name: 'Home', href: '/' }])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumb) }}
      />
      <HeroSection />
      <StatsSection />
      <Suspense fallback={<div className="h-96 animate-pulse bg-surface-muted rounded-2xl mx-8" />}>
        <FeaturedProducts />
      </Suspense>
      <CategoriesSection />
      <WhyChooseUs />
      <Suspense fallback={null}>
        <RecentBlog />
      </Suspense>
      <CTABanner />
    </>
  )
}
