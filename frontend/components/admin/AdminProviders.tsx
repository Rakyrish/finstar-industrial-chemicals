"use client"

import { SWRConfig } from 'swr'
import type { AdminSession } from '@/types/admin'
import AdminAuthProvider from './AdminAuthProvider'
import AdminToastProvider from './AdminToastProvider'

const fetcher = async (url: string) => {
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error(`Failed to load ${url}`)
  return response.json()
}

export default function AdminProviders({
  children,
  initialSession,
}: {
  children: React.ReactNode
  initialSession: AdminSession | null
}) {
  return (
    <SWRConfig
      value={{
        fetcher,
        revalidateOnFocus: false,
        refreshInterval: 30000,
        shouldRetryOnError: true,
        errorRetryCount: 1,
      }}
    >
      <AdminAuthProvider initialSession={initialSession}>
        <AdminToastProvider>{children}</AdminToastProvider>
      </AdminAuthProvider>
    </SWRConfig>
  )
}