/**
 * Public image-protection settings.
 * Connects to Django REST API at /api/v1/watermark/protection-settings/
 * Unauthenticated — exposes only the 4 client-side enforcement toggles,
 * never the watermark design fields or the master watermark_enabled switch.
 */
import { get } from '@/lib/api'

export interface ProtectionSettings {
  rightClickProtectionEnabled: boolean
  dragProtectionEnabled: boolean
  longPressProtectionEnabled: boolean
  seoMetadataProtectionEnabled: boolean
}

const FALLBACK: ProtectionSettings = {
  rightClickProtectionEnabled: false,
  dragProtectionEnabled: false,
  longPressProtectionEnabled: false,
  seoMetadataProtectionEnabled: false,
}

export async function getProtectionSettings(): Promise<ProtectionSettings> {
  try {
    return await get<ProtectionSettings>('/watermark/protection-settings/')
  } catch {
    return FALLBACK
  }
}
