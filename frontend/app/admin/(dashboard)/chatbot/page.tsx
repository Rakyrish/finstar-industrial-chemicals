import ChatbotAnalyticsScreen from '@/components/admin/screens/ChatbotAnalyticsScreen'

export default function ChatbotPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Chatbot Analytics</h1>
        <p className="text-sm text-text-secondary mt-1">
          Monitor conversations, unresolved questions, and AI performance metrics.
        </p>
      </div>
      <ChatbotAnalyticsScreen />
    </div>
  )
}