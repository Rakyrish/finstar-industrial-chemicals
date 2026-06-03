/**
 * Cloudinary URL Builder
 * 
 * Generates highly optimized and transformed image URLs using Cloudinary's dynamic parameters.
 * Automatically adds auto-formatting (webp/avif), auto-quality compression, and responsive widths.
 */

export function getCloudinaryUrl(
  src: string | null | undefined,
  options: {
    width?: number
    height?: number
    crop?: 'fill' | 'scale' | 'fit' | 'thumb'
    quality?: number | 'auto'
    format?: 'auto' | 'webp' | 'avif'
  } = {}
): string {
  if (!src) {
    return '/images/placeholder-chemical.jpg'
  }

  // If the image is not hosted on Cloudinary, return the original URL unmodified
  if (!src.includes('res.cloudinary.com')) {
    return src
  }

  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
  } = options

  // Split Cloudinary URL to inject transformations
  // Format: https://res.cloudinary.com/<cloud_name>/image/upload/<transformations>/v<version>/<public_id>
  const parts = src.split('/upload/')
  if (parts.length !== 2) {
    return src
  }

  const transformations: string[] = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (width || height) transformations.push(`c_${crop}`)
  
  transformations.push(`q_${quality}`)
  transformations.push(`f_${format}`)

  const transformationStr = transformations.join(',')
  return `${parts[0]}/upload/${transformationStr}/${parts[1]}`
}
