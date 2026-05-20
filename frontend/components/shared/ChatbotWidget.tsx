'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, X, Send, Loader2, Sparkles, FlaskConical, CornerDownLeft } from 'lucide-react'
import { chatService } from '@/services/chatService'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_SUGGESTIONS = [
  { label: 'Check stock levels', text: 'What is the current stock level for Sulphuric Acid?' },
  { label: 'Request chemical quote info', text: 'How do I request a bulk quote for Technical Grade Acetone?' },
  { label: 'MSDS Safety lookup', text: 'Where can I download the MSDS/SDS sheet for Caustic Soda?' },
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am Finstar AI, your industrial chemical assistant. Ask me about stock levels, technical specifications, CAS numbers, or safety sheets!',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return

    const userMessage: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Map existing messages to ChatMessage interface for API
      const apiMessages = messages.concat(userMessage).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      const response = await chatService.sendMessage(apiMessages)

      const botMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    } catch (err) {
      const errorMessage: Message = {
        id: Math.random().toString(),
        role: 'assistant',
        content: 'I apologize, but I experienced a connection issue. Please check your internet or try again shortly.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] w-14 h-14 rounded-full bg-amber-gradient text-white flex items-center justify-center shadow-glow-amber hover:scale-105 transition-transform duration-200"
        aria-label="Open AI assistant chatbot"
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
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-surface animate-pulse" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Chat dialogue window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed bottom-24 right-6 z-[60] w-[380px] max-w-[90vw] h-[520px] glass-card overflow-hidden border border-surface-border shadow-card-hover flex flex-col"
            role="dialog"
            aria-label="Finstar chemical database assistant"
          >
            {/* Header */}
            <header className="px-4 py-3 bg-surface-muted/50 border-b border-surface-border flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-gradient flex items-center justify-center text-white shrink-0 shadow-glow-amber">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-text-primary flex items-center gap-1.5 leading-none">
                    Finstar AI Assistant
                  </h3>
                  <span className="text-[9px] text-emerald-400 font-medium tracking-wide flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Online Sourcing Lab
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-md text-text-muted hover:text-text-primary transition-colors"
                aria-label="Minimize chatbot window"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            {/* Messages box area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface/30">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-amber-500 text-white rounded-tr-sm shadow-glow-amber'
                        : 'bg-surface-card border border-surface-border text-text-secondary rounded-tl-sm'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-amber-400 font-semibold mb-1">
                        <FlaskConical className="w-3 h-3" /> Finstar Chem-AI
                      </div>
                    )}
                    <p className="whitespace-pre-line">{m.content}</p>
                    <span className={`block text-[8px] mt-1 text-right ${m.role === 'user' ? 'text-amber-100/70' : 'text-text-muted'}`}>
                      {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3.5 rounded-2xl bg-surface-card border border-surface-border text-xs text-text-muted rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                    <span>Querying sourcing engine...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            {messages.length === 1 && (
              <div className="px-4 py-2 border-t border-surface-border bg-surface-muted/10 shrink-0 space-y-1">
                <span className="text-[9px] text-text-muted uppercase tracking-wider block mb-1">Suggestions:</span>
                <div className="flex flex-wrap gap-1">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button
                      key={s.label}
                      onClick={() => handleSend(s.text)}
                      className="badge-muted text-[10px] text-left hover:border-amber-500/30 hover:text-text-primary cursor-pointer transition-all duration-150"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar footer */}
            <footer className="p-3 border-t border-surface-border bg-surface-card shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend(input)
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1 flex items-center">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask stock, MSDS safety, quote advice..."
                    className="input-base py-2.5 pl-3.5 pr-8 text-xs bg-surface-muted/50 focus:bg-surface-card"
                    disabled={loading}
                  />
                  <CornerDownLeft className="absolute right-2.5 w-3 h-3 text-text-muted opacity-50" />
                </div>
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="p-2.5 rounded-xl bg-amber-500 text-white hover:bg-amber-400 disabled:opacity-40 disabled:hover:bg-amber-500 transition-colors shadow-glow-amber shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
