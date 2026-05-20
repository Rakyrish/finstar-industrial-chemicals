import { post } from '@/lib/api'
import type { ChatRequest, ChatResponse } from '@/types'

export const chatService = {
  /** Send a chat message and get AI response */
  async sendMessage(data: ChatRequest): Promise<ChatResponse> {
    return post<ChatResponse>('/chatbot/message/', data)
  },

  /** Clear a chat session */
  async clearSession(sessionId: string): Promise<void> {
    await post(`/chatbot/session/${sessionId}/clear/`)
  },
}
