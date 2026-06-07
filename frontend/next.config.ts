import type { NextConfig } from 'next'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const rootEnvPath = resolve(process.cwd(), '..', '.env')

if (existsSync(rootEnvPath)) {
  const envFile = readFileSync(rootEnvPath, 'utf8')

  envFile.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return

    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) return

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '')

    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  })
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
const siteImageHostname = siteUrl ? new URL(siteUrl).hostname : undefined
const extraImageHostnames = (process.env.NEXT_PUBLIC_IMAGE_HOSTNAMES || '')
  .split(',')
  .map((hostname) => hostname.trim())
  .filter(Boolean)

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,

  // SEO & security: suppress X-Powered-By header
  poweredByHeader: false,
  // Disable ETags to avoid cache fragmentation on CDN
  generateEtags: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(siteImageHostname
        ? [{ protocol: 'https' as const, hostname: siteImageHostname }]
        : []),
      ...extraImageHostnames.map((hostname) => ({
        protocol: 'https' as const,
        hostname,
      })),
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Performance: compress responses
  compress: true,

  // Security + SEO headers
  async headers() {
    return [
      {
        // Security + crawl-friendliness for all routes
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
      {
        // Long-term cache for static assets (images, fonts, icons)
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // Sitemap + robots: short cache so search engines pick up updates fast
        source: '/(sitemap.xml|robots.txt)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        // HTML pages: serve fresh, allow background revalidation
        source: '/:path((?!_next|api|admin).*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ]
  },

  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/chemicals',
        destination: '/products',
        permanent: true,
      },
      ...(siteUrl
        ? [
            {
              source: '/admin/',
              destination: `${siteUrl}/admin`,
              permanent: true,
              basePath: false as const,
            },
          ]
        : []),
    ]
  },

  // Rewrites for API proxy in development. The destination must come from env.
  async rewrites() {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    return process.env.NODE_ENV === 'development' && apiUrl
      ? [
          {
            source: '/api/v1/:path*',
            destination: `${apiUrl.replace(/\/$/, '')}/:path*`,
          },
        ]
      : []
  },

  // Experimental features for Next.js 15
  experimental: {
    optimizePackageImports: ['framer-motion', 'lucide-react'],
  },
}

export default nextConfig
