import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '@/styles/globals.css'
import { defaultMetadata } from '@/lib/metadata'
import { organizationSchema, localBusinessSchema, websiteSchema, toJsonLd } from '@/lib/schema'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/shared/ChatbotWidget'
import WebVitalsReporter from '@/components/shared/WebVitalsReporter'
import { getSiteChromeData } from '@/services/siteService'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = defaultMetadata

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const orgSchema   = organizationSchema()
  const bizSchema   = localBusinessSchema()
  const siteSchema  = websiteSchema()
  const chrome = await getSiteChromeData()

  // Combine all root-level schemas into a single @graph payload
  const rootGraph = {
    '@context': 'https://schema.org',
    '@graph': [orgSchema, bizSchema, siteSchema],
  }

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('finstar_theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}else if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.dataset.theme='light';}else{document.documentElement.dataset.theme='dark';}}catch(e){}})();`,
          }}
        />

        {/* Combined Organization + LocalBusiness + WebSite schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(rootGraph) }}
        />

        {/* Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/finlogo.jpeg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#052974" />

        {/* Performance: preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />

        {/* Geo + language targeting */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.placename" content="Nairobi, Kenya" />
        <meta name="language" content="en" />
        <meta name="content-language" content="en-KE" />
      </head>
      <body className="bg-surface text-text-primary antialiased">
        <WebVitalsReporter />
        <Header navItems={chrome.navItems} company={chrome.company} />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer company={chrome.company} footerColumns={chrome.footerColumns} socialLinks={chrome.socialLinks} />
        <ChatbotWidget />
      </body>
    </html>
  )
}
