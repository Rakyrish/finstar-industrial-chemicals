import ResourceScreen from '@/components/admin/screens/ResourceScreen'
import { adminConversations } from '@/lib/admin/mock-data'

export default function ChatbotPage() {
  return (
    <ResourceScreen
      resource="chatbot"
      title="Chatbot monitoring"
      description="Monitor conversations, unresolved questions, and channel performance across the customer assistant."
      fallback={{ results: adminConversations, count: adminConversations.length }}
      searchKeys={['customerName', 'question', 'status', 'channel']}
      filters={[{ key: 'status', label: 'Status', options: ['open', 'resolved', 'escalated'] }]}
      exportHref="#"
      emptyTitle="No chatbot conversations"
      emptyDescription="Web chat and support conversations will be listed here for review and export."
      columns={[
        { key: 'customerName', label: 'Customer' },
        { key: 'channel', label: 'Channel' },
        { key: 'question', label: 'Question' },
        { key: 'messageCount', label: 'Messages' },
        { key: 'status', label: 'Status' },
      ]}
    />
  )
}