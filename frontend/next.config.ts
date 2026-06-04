import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  trailingSlash: false,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.finstarindustrial.com',
      },
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

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|webp|avif|gif|svg|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
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
    {
      source: '/admin/',
      destination: 'https://finstarindustrialchemicals.com/admin',
      permanent: true,
      basePath: false,
    },
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
