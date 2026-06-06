/**
 * Image Optimization & Lazy Loading Utilities
 * Handles Cloudinary integration, format selection, and performance optimization
 */

import { frontendConfig } from './config'

export interface ImageOptions {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'fit' | 'scale' | 'pad'
  gravity?: 'auto' | 'face' | 'center'
}

export interface ResponsiveImageSet {
  srcSet: string
  src: string
  sizes: string
}

/**
 * Generate Cloudinary URL with transformations
 */
function generateCloudinaryUrl(publicId: string, options: ImageOptions = {}): string {
  const cloudName = frontendConfig.cloudinaryCloudName

  if (!cloudName || !publicId) {
    console.warn('Cloudinary configuration missing')
    return ''
  }

  const {
    width = 800,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
    gravity = 'auto',
  } = options

  // Build transformation string
  const transforms: string[] = []

  // Add dimensions
  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)

  // Add quality
  transforms.push(`q_${quality}`)

  // Add format
  transforms.push(`f_${format}`)

  // Add cropping
  if (crop !== 'scale') {
    transforms.push(`c_${crop}`)
    transforms.push(`g_${gravity}`)
  }

  // Add fetch format (for AVIF/WebP support)
  transforms.push('fl_progressive')

  const transformString = transforms.join(',')
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/fetch`

  return `${baseUrl}/${transformString}/${publicId}`
}

/**
 * Get Cloudinary URL from various input formats
 */
export function getImageUrl(
  imageInput: string | null | undefined,
  options: ImageOptions = {}
): string {
  if (!imageInput) {
    return '/placeholder-product.jpg' // Fallback placeholder
  }

  // If it's already a Cloudinary URL, return as-is
  if (imageInput.includes('cloudinary.com')) {
    return imageInput
  }

  // If it's a public ID, generate full URL
  if (!imageInput.startsWith('http')) {
    return generateCloudinaryUrl(imageInput, options)
  }

  // If it's an external URL, fetch through Cloudinary for optimization
  return generateCloudinaryUrl(imageInput, options)
}

/**
 * Generate responsive image srcSet for different screen sizes
 */
export function generateResponsiveImageSet(
  publicId: string,
  alt: string,
  options: ImageOptions = {}
): ResponsiveImageSet {
  const sizes = [320, 640, 960, 1280, 1920]
  const srcSetEntries = sizes.map((size) => {
    const url = generateCloudinaryUrl(publicId, {
      ...options,
      width: size,
    })
    return `${url} ${size}w`
  })

  const defaultUrl = generateCloudinaryUrl(publicId, {
    ...options,
    width: 800,
  })

  return {
    srcSet: srcSetEntries.join(', '),
    src: defaultUrl,
    sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw',
  }
}

/**
 * Generate product image URL with optimization
 */
export function getProductImageUrl(
  publicId: string | null | undefined,
  size: 'thumbnail' | 'medium' | 'large' = 'medium'
): string {
  if (!publicId) return '/placeholder-product.jpg'

  const sizeMap = {
    thumbnail: { width: 300, height: 300, quality: 80 },
    medium: { width: 600, height: 600, quality: 85 },
    large: { width: 1200, height: 1200, quality: 90 },
  }

  return generateCloudinaryUrl(publicId, {
    ...sizeMap[size],
    format: 'auto',
    crop: 'fill',
    gravity: 'auto',
  })
}

/**
 * Generate blog image URL with optimization
 */
export function getBlogImageUrl(
  publicId: string | null | undefined,
  type: 'thumbnail' | 'featured' = 'featured'
): string {
  if (!publicId) return '/placeholder-blog.jpg'

  const typeMap = {
    thumbnail: { width: 400, height: 300, quality: 80 },
    featured: { width: 1200, height: 600, quality: 85 },
  }

  return generateCloudinaryUrl(publicId, {
    ...typeMap[type],
    format: 'auto',
    crop: 'fill',
    gravity: 'auto',
  })
}

/**
 * Generate category image URL with optimization
 */
export function getCategoryImageUrl(
  publicId: string | null | undefined
): string {
  if (!publicId) return '/placeholder-category.jpg'

  return generateCloudinaryUrl(publicId, {
    width: 400,
    height: 400,
    quality: 85,
    format: 'auto',
    crop: 'fill',
    gravity: 'auto',
  })
}

/**
 * Image lazy loading hook (for React components)
 */
export function useLazyImage(src: string | null | undefined, placeholder?: string) {
  if (typeof window === 'undefined') {
    return {
      src: src || '/placeholder.jpg',
      className: '',
      loading: 'eager' as const,
    }
  }

  return {
    src: src || '/placeholder.jpg',
    className: 'lazy-image',
    loading: 'lazy' as const,
  }
}

/**
 * Preload image (for optimization)
 */
export function preloadImage(src: string): void {
  if (typeof document === 'undefined') return

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  document.head.appendChild(link)
}

/**
 * Validate image URL is accessible
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Generate image with watermark
 */
export function addWatermark(publicId: string, watermarkText = 'Finstar'): string {
  const cloudName = frontendConfig.cloudinaryCloudName

  if (!cloudName || !publicId) return ''

  // Cloudinary watermark transformation
  const transforms = [
    'w_800,h_600,c_fill,g_auto',
    `l_text:Arial_80_bold:${encodeURIComponent(watermarkText)},o_30,g_south_east,x_20,y_20`,
  ].join('/')

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transforms}/${publicId}`
}

/**
 * Optimize image for web (automatic)
 */
export function optimizeForWeb(
  publicId: string,
  options: Partial<ImageOptions> = {}
): string {
  return generateCloudinaryUrl(publicId, {
    quality: 'auto',
    format: 'auto',
    crop: 'fill',
    gravity: 'auto',
    ...options,
  })
}

/**
 * Generate social media image (for sharing)
 */
export function generateSocialImage(
  publicId: string,
  platform: 'facebook' | 'twitter' | 'linkedin' = 'facebook'
): string {
  const sizeMap = {
    facebook: { width: 1200, height: 630 },
    twitter: { width: 1200, height: 675 },
    linkedin: { width: 1200, height: 627 },
  }

  return generateCloudinaryUrl(publicId, {
    ...sizeMap[platform],
    quality: 85,
    format: 'auto',
    crop: 'fill',
    gravity: 'auto',
  })
}

/**
 * Export image service
 */
export const imageService = {
  getImageUrl,
  generateResponsiveImageSet,
  getProductImageUrl,
  getBlogImageUrl,
  getCategoryImageUrl,
  useLazyImage,
  preloadImage,
  validateImageUrl,
  addWatermark,
  optimizeForWeb,
  generateSocialImage,
}

export default imageService
