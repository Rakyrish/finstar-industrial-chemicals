// Chatbot types
export type MessageRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  isStreaming?: boolean
  productSuggestions?: ChatProductSuggestion[]
}

export interface ChatProductSuggestion {
  id: number
  name: string
  slug: string
  image?: string
  category: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatRequest {
  message: string
  sessionId?: string
  context?: {
    currentPage?: string
    productSlug?: string
    categorySlug?: string
  }
}

export interface ChatResponse {
  message: string
  sessionId: string
  productSuggestions?: ChatProductSuggestion[]
}
