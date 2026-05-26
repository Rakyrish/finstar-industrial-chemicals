import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    totalSessions: 0,
    totalMessages: 0,
    avgMessagesPerSession: 0,
    dailyTrend: [],
    topQuestions: [],
    mentionedProducts: [],
    conversations: [],
    count: 0,
    results: [],
  })
}
