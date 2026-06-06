import type { Metadata } from 'next'
import type { SeoConfig } from '@/types'
import { absoluteUrl } from '@/utils'
import { frontendConfig } from './config'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Finstar Industrial Chemicals'
const SITE_URL  = frontendConfig.siteUrl
const DEFAULT_OG = `${SITE_URL}/og-default.png`

export function generatePageMetadata(config: SeoConfig): Metadata {
  const {
    title, description, canonical, ogImage = DEFAULT_OG,
    ogType = 'website', noIndex = false, noFollow = false,
    keywords = [], publishedAt, updatedAt, author,
  } = config

  const fullTitle    = `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? absoluteUrl(canonical) : undefined

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    ...(author ? { authors: [{ name: author }] } : {}),
    ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: ogType === 'product' ? 'website' : ogType,
      title: fullTitle,
      description,
      siteName: SITE_NAME,
      url: canonicalUrl ?? SITE_URL,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
      ...(updatedAt   ? { modifiedTime:  updatedAt   } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [ogImage],
    },
  }
}

export const defaultMetadata: Metadata = generatePageMetadata({
  title: 'Industrial Chemical Solutions',
  description:
    'Finstar Industrial Chemicals — a trusted supplier of high-quality industrial chemicals, solvents, reagents, and specialty chemicals across East Africa.',
  keywords: [
    'industrial chemicals', 'chemical supplier', 'solvents', 'reagents',
    'specialty chemicals', 'East Africa chemicals', 'Finstar',
  ],
})
