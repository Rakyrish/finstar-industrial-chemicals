import { frontendConfig, getWhatsAppUrl } from '@/lib/config'
import { productService } from './productService'
import type { FooterColumn, NavItem, SocialLink } from '@/types'

export type CompanyInfo = {
  name: string
  brandName: string
  tagline: string
  description: string
  email: string
  phone: string
  whatsappNumber: string
  address: string
  addressLink: string
  businessHours: Array<{ label: string; value: string }>
}

export type SiteSettings = {
  company: CompanyInfo
  socialLinks: SocialLink[]
}

export type SiteChromeData = SiteSettings & {
  navItems: NavItem[]
  footerColumns: FooterColumn[]
}

const fallbackCompany: CompanyInfo = {
  name: 'Finstar Industrial Chemicals',
  brandName: 'FINSTAR',
  tagline: 'Industrial chemical supply for Kenya, Uganda, Tanzania, and Rwanda',
  description: 'Supplier of industrial chemicals, solvents, acids, alkalis, and specialty raw materials.',
  email: frontendConfig.companyEmail,
  phone: frontendConfig.phoneNumber,
  whatsappNumber: frontendConfig.whatsappNumber,
  address: '',
  addressLink: '',
  businessHours: [],
}

export async function getSiteSettings(): Promise<SiteSettings> {
  if (!frontendConfig.apiUrl) {
    return { company: fallbackCompany, socialLinks: [] }
  }

  try {
    const response = await fetch(`${frontendConfig.apiUrl}/seo/site-settings/`, {
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Site settings failed with ${response.status}`)
    const payload = await response.json()
    return {
      company: { ...fallbackCompany, ...(payload.company ?? {}) },
      socialLinks: Array.isArray(payload.socialLinks) ? payload.socialLinks : [],
    }
  } catch {
    return { company: fallbackCompany, socialLinks: [] }
  }
}

export async function getSiteChromeData(): Promise<SiteChromeData> {
  const [settings, categories] = await Promise.all([
    getSiteSettings(),
    productService.categories().catch(() => []),
  ])

  const categoryNav = await Promise.all(
    categories.slice(0, 6).map(async (category, index) => {
      const products = await productService.list({ category: category.slug, pageSize: 4 }).catch(() => ({ results: [] }))
      return {
        id: String(category.slug),
        label: category.name,
        href: `/products?category=${category.slug}`,
        description: category.description,
        isFeatured: Boolean(category.isFeatured) || index === 0,
        items: products.results.map((product) => ({
          label: product.name,
          href: `/products/${product.slug}`,
        })),
      }
    })
  )

  const navItems: NavItem[] = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products', categories: categoryNav },
    { label: 'About', href: '/about' },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact' },
  ]

  const footerColumns: FooterColumn[] = [
    {
      title: 'Products',
      links: [
        { label: 'All Chemicals', href: '/products' },
        ...categories.slice(0, 4).map((category) => ({ label: category.name, href: `/products?category=${category.slug}` })),
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Blog', href: '/blog' },
        { label: 'Search', href: '/search' },
        { label: 'Quote Request', href: '/quote' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
      ],
    },
  ]

  const socialLinks = settings.socialLinks.length
    ? settings.socialLinks
    : settings.company.whatsappNumber
      ? [{ platform: 'whatsapp' as const, href: getWhatsAppUrl(), label: 'WhatsApp' }]
      : []

  return { ...settings, socialLinks, navItems, footerColumns }
}
