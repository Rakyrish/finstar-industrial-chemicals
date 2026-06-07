import type { Metadata } from 'next'
import type { SeoConfig } from '@/types'
import { absoluteUrl } from '@/utils'
import { frontendConfig } from './config'

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Finstar Industrial Chemicals'
const SITE_URL  = frontendConfig.siteUrl
const DEFAULT_OG = `${SITE_URL}/og-default.png`
const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE ?? '@FinstarChemicals'

/**
 * Generates full Next.js Metadata from a SeoConfig object.
 * Priority: DB-stored fields → auto-generated → defaults.
 */
export function generatePageMetadata(config: SeoConfig): Metadata {
  const {
    title, description, canonical, ogImage = DEFAULT_OG,
    ogType = 'website', noIndex = false, noFollow = false,
    keywords = [], publishedAt, updatedAt, author,
    ogTitle, twitterTitle, twitterDescription,
    languages,
  } = config

  const fullTitle    = title.includes('|') ? title : `${title} | ${SITE_NAME}`
  const canonicalUrl = canonical ? absoluteUrl(canonical) : undefined

  // Build hreflang alternates
  const altLanguages: Record<string, string> = {}
  if (canonical) {
    altLanguages['en'] = absoluteUrl(canonical)
    altLanguages['x-default'] = absoluteUrl(canonical)
  }
  if (languages) {
    Object.assign(altLanguages, languages)
  }

  return {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    ...(author ? { authors: [{ name: author }] } : {}),
    ...(SITE_URL ? { metadataBase: new URL(SITE_URL) } : {}),

    alternates: {
      ...(canonicalUrl ? { canonical: canonicalUrl } : {}),
      ...(Object.keys(altLanguages).length > 0 ? { languages: altLanguages } : {}),
    },

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
      type: ogType === 'product' ? 'website' : ogType as any,
      title: ogTitle ?? fullTitle,
      description,
      siteName: SITE_NAME,
      url: canonicalUrl ?? SITE_URL,
      locale: 'en_KE',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
      ...(updatedAt   ? { modifiedTime:  updatedAt   } : {}),
    },

    twitter: {
      card: 'summary_large_image',
      site: TWITTER_HANDLE,
      title: twitterTitle ?? fullTitle,
      description: twitterDescription ?? description,
      images: [{ url: ogImage, alt: title }],
    },

    // Additional meta tags for chemicals / B2B context
    other: {
      'geo.region': 'KE',
      'geo.placename': 'Nairobi, Kenya',
      'DC.subject': 'Industrial Chemicals, Chemical Supply, East Africa',
      'rating': 'general',
      ...(publishedAt ? { 'article:published_time': publishedAt } : {}),
      ...(updatedAt ? { 'article:modified_time': updatedAt } : {}),
    },
  }
}

export const defaultMetadata: Metadata = generatePageMetadata({
  title: 'Industrial Chemical Solutions',
  description:
    'Finstar Industrial Chemicals — trusted supplier of high-quality industrial chemicals, detergent chemicals, food-grade chemicals, cosmetic chemicals, laboratory chemicals, mining chemicals, and water treatment chemicals across East Africa (Kenya, Uganda, Tanzania, Rwanda).',
  keywords: [
    'industrial chemicals', 'chemical supplier Kenya', 'detergent chemicals',
    'food grade chemicals', 'cosmetic chemicals', 'laboratory chemicals',
    'mining chemicals', 'water treatment chemicals', 'manufacturing raw materials',
    'East Africa chemical supplier', 'Finstar Industrial Chemicals',
  ],
  canonical: '/',
})
