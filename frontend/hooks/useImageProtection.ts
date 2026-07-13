'use client'

import { useEffect, useState, type DragEvent, type MouseEvent } from 'react'
import { getProtectionSettings, type ProtectionSettings } from '@/services/protectionService'

// Module-level cache/inflight promise so every <ProductCard>/image instance
// on a page shares one fetch instead of each firing its own request.
let cachedSettings: ProtectionSettings | null = null
let inflight: Promise<ProtectionSettings> | null = null

function loadSettings(): Promise<ProtectionSettings> {
  if (cachedSettings) return Promise.resolve(cachedSettings)
  if (!inflight) {
    inflight = getProtectionSettings().then((settings) => {
      cachedSettings = settings
      return settings
    })
  }
  return inflight
}

export interface ImageProtectionProps {
  onContextMenu?: (e: MouseEvent) => void
  onDragStart?: (e: DragEvent) => void
  draggable?: boolean
  className?: string
}

export function useImageProtection() {
  const [settings, setSettings] = useState<ProtectionSettings | null>(cachedSettings)

  useEffect(() => {
    let mounted = true
    loadSettings().then((s) => {
      if (mounted) setSettings(s)
    })
    return () => {
      mounted = false
    }
  }, [])

  const rightClick = settings?.rightClickProtectionEnabled ?? false
  const drag = settings?.dragProtectionEnabled ?? false
  const longPress = settings?.longPressProtectionEnabled ?? false

  function getProtectionProps(): ImageProtectionProps {
    const props: ImageProtectionProps = {}

    // Android/Chrome fires a `contextmenu` event on touch-and-hold, so
    // blocking it also covers the mobile long-press "save image" menu.
    // iOS Safari's native callout has no JS event — only CSS defeats it.
    if (rightClick || longPress) {
      props.onContextMenu = (e) => e.preventDefault()
    }
    if (drag) {
      props.draggable = false
      props.onDragStart = (e) => e.preventDefault()
    }
    if (longPress) {
      props.className = 'protected-image-no-callout'
    }

    return props
  }

  return {
    settings,
    rightClickProtectionEnabled: rightClick,
    dragProtectionEnabled: drag,
    longPressProtectionEnabled: longPress,
    seoMetadataProtectionEnabled: settings?.seoMetadataProtectionEnabled ?? false,
    getProtectionProps,
  }
}
