import type { Metadata } from 'next'
import { Inter, Outfit } from 'next/font/google'
import '@/styles/globals.css'
import { defaultMetadata } from '@/lib/metadata'
import { organizationSchema, toJsonLd } from '@/lib/schema'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ChatbotWidget from '@/components/shared/ChatbotWidget'
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
  const orgSchema = organizationSchema()
  const chrome = await getSiteChromeData()

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <head>
        {/* Anti-FOUC: apply theme before first paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('finstar_theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t;}else if(window.matchMedia('(prefers-color-scheme: light)').matches){document.documentElement.dataset.theme='light';}else{document.documentElement.dataset.theme='dark';}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(orgSchema) }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/finlogo.jpeg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#052974" />
      </head>
      <body className="bg-surface text-text-primary antialiased">
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
