import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

  return {
    rules: [
      // ── Main search engine crawlers ────────────────────────────────────────
      {
        userAgent: ['Googlebot', 'Bingbot', 'Slurp', 'DuckDuckBot', 'Baiduspider'],
        allow: [
          '/',
          '/products',
          '/products/',
          '/blog',
          '/blog/',
          '/about',
          '/contact',
          '/quote',
          '/search',
          '/sitemap.xml',
        ],
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          // Prevent indexing of paginated + filtered duplicates
          '/products?page=',
          '/products?search=',
          '/blog?page=',
          // Block private routes
          '/dashboard/',
          '/account/',
          '/auth/',
        ],
      },
      // ── Respect all crawlers ───────────────────────────────────────────────
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/_next/',
          '/static/',
          '/dashboard/',
          '/account/',
          '/auth/',
        ],
        crawlDelay: 1,
      },
      // ── Aggressively block SEO scrapers / AI crawlers ─────────────────────
      {
        userAgent: ['GPTBot', 'ChatGPT-User', 'CCBot', 'anthropic-ai', 'Claude-Web'],
        disallow: '/',
      },
    ],
    sitemap: BASE ? `${BASE}/sitemap.xml` : undefined,
    host: BASE ?? undefined,
  }
}
