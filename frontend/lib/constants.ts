import type { NavItem, FooterColumn, SocialLink } from '@/types'
import { frontendConfig, getWhatsAppUrl } from './config'

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Products',
    categories: [
      {
        id: 'industrial-solvents',
        label: 'Industrial Solvents',
        href: '/products?category=industrial-solvents',
        description: 'High-purity solvents for industrial processes',
        items: [
          { label: 'Acetone', href: '/products/acetone' },
          { label: 'Methanol', href: '/products/methanol' },
          { label: 'Ethanol', href: '/products/ethanol' },
          { label: 'Toluene', href: '/products/toluene' },
          { label: 'Xylene', href: '/products/xylene' },
        ],
      },
      {
        id: 'acids-bases',
        label: 'Acids & Bases',
        href: '/products?category=acids-bases',
        description: 'Technical and lab grade acids and alkalis',
        items: [
          { label: 'Sulphuric Acid', href: '/products/sulphuric-acid' },
          { label: 'Hydrochloric Acid', href: '/products/hydrochloric-acid' },
          { label: 'Caustic Soda', href: '/products/caustic-soda' },
          { label: 'Phosphoric Acid', href: '/products/phosphoric-acid' },
          { label: 'Nitric Acid', href: '/products/nitric-acid' },
        ],
      },
      {
        id: 'specialty-chemicals',
        label: 'Specialty Chemicals',
        href: '/products?category=specialty-chemicals',
        description: 'Custom and specialty chemical formulations',
        items: [
          { label: 'Surfactants', href: '/products/surfactants' },
          { label: 'Oxidising Agents', href: '/products/oxidising-agents' },
          { label: 'Catalysts', href: '/products/catalysts' },
          { label: 'Polymers', href: '/products/polymers' },
        ],
      },
      {
        id: 'lab-reagents',
        label: 'Lab Reagents',
        href: '/products?category=lab-reagents',
        description: 'Analytical grade reagents for laboratories',
        isFeatured: true,
        items: [
          { label: 'Buffer Solutions', href: '/products/buffer-solutions' },
          { label: 'Indicator Dyes', href: '/products/indicator-dyes' },
          { label: 'Titration Reagents', href: '/products/titration-reagents' },
          { label: 'Culture Media', href: '/products/culture-media' },
        ],
      },
    ],
  },
  {
    label: 'Services',
    href: '/services',
  },
  {
    label: 'About',
    href: '/about',
  },
  {
    label: 'Blog',
    href: '/blog',
  },
  {
    label: 'Contact',
    href: '/contact',
  },
]

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Products',
    links: [
      { label: 'Industrial Solvents',   href: '/products?category=industrial-solvents' },
      { label: 'Acids & Bases',         href: '/products?category=acids-bases' },
      { label: 'Specialty Chemicals',   href: '/products?category=specialty-chemicals' },
      { label: 'Lab Reagents',          href: '/products?category=lab-reagents' },
      { label: 'View All Products',     href: '/products' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us',      href: '/about' },
      { label: 'Services',      href: '/services' },
      { label: 'Blog',          href: '/blog' },
      { label: 'Careers',       href: '/careers' },
      { label: 'Contact Us',   href: '/contact' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'Request a Quote',       href: '/quote' },
      { label: 'Technical Support',     href: '/contact?type=technical' },
      { label: 'Safety Data Sheets',    href: '/sds' },
      { label: 'FAQs',                  href: '/faq' },
      { label: 'Track Inquiry',         href: '/inquiry-status' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy',   href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy',    href: '/cookies' },
    ],
  },
]

export const SOCIAL_LINKS: SocialLink[] = [
  ...(process.env.NEXT_PUBLIC_LINKEDIN_URL
    ? [{ platform: 'linkedin' as const, href: process.env.NEXT_PUBLIC_LINKEDIN_URL, label: 'LinkedIn' }]
    : []),
  ...(process.env.NEXT_PUBLIC_TWITTER_URL
    ? [{ platform: 'twitter' as const, href: process.env.NEXT_PUBLIC_TWITTER_URL, label: 'Twitter' }]
    : []),
  ...(process.env.NEXT_PUBLIC_FACEBOOK_URL
    ? [{ platform: 'facebook' as const, href: process.env.NEXT_PUBLIC_FACEBOOK_URL, label: 'Facebook' }]
    : []),
  ...(frontendConfig.whatsappNumber
    ? [{ platform: 'whatsapp' as const, href: getWhatsAppUrl(), label: 'WhatsApp' }]
    : []),
]

export const COMPANY_INFO = {
  name:        'Finstar Industrial Chemicals',
  shortName:   'Finstar',
  tagline:     'Precision Chemistry. Industrial Scale.',
  email:       frontendConfig.companyEmail,
  phone:       frontendConfig.phoneNumber,
  address:     process.env.NEXT_PUBLIC_COMPANY_ADDRESS || '',
  founded:     '2010',
  employees:   '50–200',
  registration: 'CPR/2010/XXXXX',
}
