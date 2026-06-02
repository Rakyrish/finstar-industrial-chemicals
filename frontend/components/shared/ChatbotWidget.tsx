'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  BriefcaseBusiness,
  CornerDownLeft,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  X,
} from 'lucide-react'
import { chatService } from '@/services/chatService'
import { frontendConfig, getWhatsAppUrl } from '@/lib/config'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

type SupportView = 'desk' | 'chat'

const FALLBACK_PHONE = '+254 726 417966'
const FALLBACK_EMAIL = 'info@finstarindustrial.com'
const PHONE_DISPLAY = frontendConfig.phoneNumber || FALLBACK_PHONE
const EMAIL_DISPLAY = frontendConfig.companyEmail || FALLBACK_EMAIL

const QUICK_SUGGESTIONS = [
  { label: 'Find a product', text: 'Do you supply citric acid in Kenya, Uganda, Tanzania, or Rwanda?' },
  { label: 'Request pricing', text: 'How do I request bulk pricing and availability for acetone?' },
  { label: 'Safety documents', text: 'Can I get SDS and COA documents for caustic soda?' },
]

function timeLabel(date: Date) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<SupportView>('desk')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello, I am the Finstar Chemicals AI Assistant. I can help with product availability, quote preparation, SDS/COA guidance, and chemical category discovery for Kenya, Uganda, Tanzania, and Rwanda.',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const whatsappLink = getWhatsAppUrl('Hello Finstar, I need help with industrial chemical pricing, availability, or product guidance.')
  const phoneHref = `tel:${PHONE_DISPLAY.replace(/[^\d+]/g, '')}`
  const emailHref = `mailto:${EMAIL_DISPLAY}?subject=${encodeURIComponent('Industrial chemical inquiry')}`

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, view])

  const openDesk = () => {
    setIsOpen((current) => !current)
    setView('desk')
  }

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await chatService.sendMessage({
        message: textToSend,
        sessionId,
        context: { currentPage: typeof window !== 'undefined' ? window.location.pathname : '/' },
      })

      if (response.sessionId) setSessionId(response.sessionId)

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
        },
      ])

      if (response.productSuggestions && response.productSuggestions.length > 0) {
        setMessages((prev) => [
          ...prev,
          {
            id: `${crypto.randomUUID()}-suggestions`,
            role: 'assistant',
            content: `__product_suggestions__:${JSON.stringify(response.productSuggestions)}`,
            timestamp: new Date(),
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content:
            'I had trouble reaching the AI service. You can still contact the Finstar team on WhatsApp or call for urgent pricing, stock, SDS, and COA requests.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const supportRows = [
    {
      title: 'WhatsApp',
      description: 'Quick response for pricing, quotations, and follow-up',
      badge: 'Recommended',
      icon: MessageCircle,
      iconClass: 'bg-emerald-100 text-emerald-600',
      action: () => {
        if (whatsappLink) window.open(whatsappLink, '_blank', 'noopener,noreferrer')
      },
    },
    {
      title: 'Call Us',
      description: PHONE_DISPLAY,
      badge: 'Direct',
      icon: Phone,
      iconClass: 'bg-blue-100 text-blue-600',
      href: phoneHref,
    },
    {
      title: 'Email',
      description: EMAIL_DISPLAY,
      icon: Mail,
      iconClass: 'bg-violet-100 text-violet-600',
      href: emailHref,
    },
    {
      title: 'AI Assistant',
      description: 'Product guidance, quotation prep, and category discovery',
      icon: Bot,
      iconClass: 'bg-orange-100 text-orange-600',
      action: () => setView('chat'),
    },
  ]

  return (
    <>
      <button
        onClick={openDesk}
        className="fixed bottom-6 right-6 z-[60] flex h-16 w-16 items-center justify-center rounded-full bg-[#ff6b00] text-white shadow-[0_16px_35px_rgba(255,107,0,0.38)] ring-4 ring-white/10 transition-transform duration-200 hover:scale-105 active:scale-95"
        aria-label={isOpen ? 'Close Finstar support desk' : 'Open Finstar support desk'}
        aria-expanded={isOpen}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-7 w-7" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageCircle className="h-7 w-7" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.96 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 z-[60] flex h-[min(620px,calc(100vh-112px))] w-[392px] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-[24px] border border-white/70 bg-[#f7f9fd] shadow-[0_24px_80px_rgba(4,22,63,0.35)]"
            role="dialog"
            aria-label="Finstar support desk"
          >
            <header className="relative shrink-0 overflow-hidden bg-gradient-to-br from-[#123a86] via-[#1c75a6] to-[#a16f4f] px-6 py-5 text-white">
              <div className="absolute -left-7 top-0 h-16 w-16 rounded-full bg-[#ff6b00]" />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="mt-10 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)] sm:mt-8" />
                  <div>
                    <h2 className="text-lg font-bold leading-tight">Finstar Sales Desk</h2>
                    <p className="mt-1 text-sm leading-5 text-white/85">
                      Industrial chemical support for Kenya, Uganda, Tanzania, and Rwanda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl bg-white/20 p-2 text-white transition-colors hover:bg-white/30"
                  aria-label="Close support desk"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            {view === 'desk' ? (
              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                {supportRows.map(({ title, description, badge, icon: Icon, iconClass, href, action }) => {
                  const content = (
                    <>
                      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block text-sm font-bold text-slate-900">{title}</span>
                        <span className="mt-0.5 block text-sm leading-5 text-slate-400">{description}</span>
                      </span>
                      {badge && (
                        <span className="shrink-0 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-white">
                          {badge}
                        </span>
                      )}
                    </>
                  )

                  const classes =
                    'flex min-h-[74px] w-full items-center gap-4 rounded-2xl bg-white px-4 py-3 shadow-[0_10px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(15,23,42,0.08)]'

                  if (href) {
                    return (
                      <a key={title} href={href} className={classes}>
                        {content}
                      </a>
                    )
                  }

                  return (
                    <button key={title} type="button" onClick={action} className={classes}>
                      {content}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex min-h-0 flex-1 flex-col bg-slate-50">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <button
                    onClick={() => setView('desk')}
                    className="text-xs font-semibold uppercase tracking-wide text-slate-400 transition-colors hover:text-[#ff6b00]"
                  >
                    Support Options
                  </button>
                  <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                    <BriefcaseBusiness className="h-4 w-4 text-[#ff6b00]" />
                    AI Assistant
                  </span>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-4">
                  {messages.map((m) => {
                    if (m.content.startsWith('__product_suggestions__:')) {
                      try {
                        const suggestions = JSON.parse(m.content.replace('__product_suggestions__:', '')) as Array<{
                          id: number
                          name: string
                          slug: string
                          category: string
                        }>
                        return (
                          <div key={m.id} className="flex flex-wrap gap-2">
                            <p className="w-full text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Related products
                            </p>
                            {suggestions.map((s) => (
                              <a
                                key={s.id}
                                href={`/products/${s.slug}`}
                                className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#ff6b00] transition hover:bg-orange-100"
                              >
                                {s.name}
                              </a>
                            ))}
                          </div>
                        )
                      } catch {
                        return null
                      }
                    }

                    return (
                      <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={`max-w-[86%] rounded-2xl px-3.5 py-3 text-sm leading-relaxed ${
                            m.role === 'user'
                              ? 'rounded-tr-md bg-[#ff6b00] text-white shadow-[0_10px_24px_rgba(255,107,0,0.22)]'
                              : 'rounded-tl-md border border-slate-200 bg-white text-slate-600 shadow-sm'
                          }`}
                        >
                          {m.role === 'assistant' && (
                            <span className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#ff6b00]">
                              <Bot className="h-3 w-3" />
                              Finstar Chem-AI
                            </span>
                          )}
                          <p className="whitespace-pre-line">{m.content}</p>
                          <span className={`mt-1 block text-right text-[10px] ${m.role === 'user' ? 'text-orange-100' : 'text-slate-400'}`}>
                            {timeLabel(m.timestamp)}
                          </span>
                        </div>
                      </div>
                    )
                  })}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[86%] items-center gap-2 rounded-2xl rounded-tl-md border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-500 shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-[#ff6b00]" />
                        Checking catalogue and company product context...
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {messages.length === 1 && (
                  <div className="border-t border-slate-200 bg-white px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {QUICK_SUGGESTIONS.map((s) => (
                        <button
                          key={s.label}
                          onClick={() => handleSend(s.text)}
                          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-orange-200 hover:text-[#ff6b00]"
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <footer className="border-t border-slate-200 bg-white p-3">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault()
                      handleSend(input)
                    }}
                    className="flex items-center gap-2"
                  >
                    <div className="relative flex flex-1 items-center">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about chemicals, stock, SDS, or quotes..."
                        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 pr-9 text-sm text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white"
                        disabled={loading}
                      />
                      <CornerDownLeft className="absolute right-3 h-3.5 w-3.5 text-slate-300" />
                    </div>
                    <button
                      type="submit"
                      disabled={!input.trim() || loading}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#ff6b00] text-white shadow-[0_10px_22px_rgba(255,107,0,0.26)] transition hover:bg-orange-500 disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </footer>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
