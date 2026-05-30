"use client"

import { MessageCircle } from 'lucide-react'
import { getWhatsAppUrl } from '@/lib/config'
import { cn } from '@/utils'
import { useEffect, useState } from 'react'

interface WhatsAppButtonProps {
  message?: string
  className?: string
  variant?: 'floating' | 'inline'
}

export default function WhatsAppButton({ message = 'Hello, I would like to inquire about...', className, variant = 'floating' }: WhatsAppButtonProps) {
  const [whatsappLink, setWhatsappLink] = useState('')

  useEffect(() => {
    setWhatsappLink(getWhatsAppUrl(message))
  }, [message])

  const handleClick = async () => {
    // Optionally track the click in analytics
    try {
      await fetch('/api/v1/analytics/whatsapp-click/', { method: 'POST' }).catch(() => {})
    } catch (e) {
      // ignore
    }
    if (whatsappLink) {
      window.open(whatsappLink, '_blank', 'noopener,noreferrer')
    }
  }

  if (!whatsappLink) return null

  if (variant === 'inline') {
    return (
      <button 
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 font-semibold text-white shadow-lg transition-all hover:bg-[#128C7E] active:scale-95",
          className
        )}
      >
        <MessageCircle className="h-5 w-5" />
        Chat on WhatsApp
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "fixed bottom-24 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-xl transition-all hover:scale-110 hover:bg-[#128C7E] active:scale-95 md:bottom-8 md:right-8",
        "animate-[bounce_2s_infinite]",
        className
      )}
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  )
}
