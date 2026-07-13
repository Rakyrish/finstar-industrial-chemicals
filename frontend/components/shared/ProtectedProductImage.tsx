'use client'

import Image, { type ImageProps } from 'next/image'
import { cn } from '@/utils'
import { useImageProtection } from '@/hooks/useImageProtection'

/** next/image wrapper that applies the site's right-click/drag/long-press guards. */
export default function ProtectedProductImage(props: ImageProps) {
  const { getProtectionProps } = useImageProtection()
  const protectionProps = getProtectionProps()

  return (
    <Image
      {...props}
      className={cn(props.className, protectionProps.className)}
      onContextMenu={protectionProps.onContextMenu}
      onDragStart={protectionProps.onDragStart}
      draggable={protectionProps.draggable}
    />
  )
}
