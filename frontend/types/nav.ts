// Navigation types
export interface NavSubItem {
  label: string
  href: string
  description?: string
  icon?: string
  isNew?: boolean
}

export interface NavCategory {
  id: string
  label: string
  href: string
  description?: string
  image?: string
  items?: NavSubItem[]
  isFeatured?: boolean
}

export interface NavItem {
  label: string
  href?: string
  categories?: NavCategory[]
  isExternal?: boolean
}

export interface NavLink {
  label: string
  href: string
}

export interface FooterColumn {
  title: string
  links: NavLink[]
}

export interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'facebook' | 'instagram' | 'youtube' | 'whatsapp'
  href: string
  label: string
}
