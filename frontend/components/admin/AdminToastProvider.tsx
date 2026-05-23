"use client"

import * as Toast from '@radix-ui/react-toast'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'

type ToastVariant = 'default' | 'success' | 'error' | 'warning'

interface ToastItem {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
  open: boolean
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useAdminToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useAdminToast must be used inside AdminToastProvider')
  return context
}

export default function AdminToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((current) => [...current, { id, open: true, ...item }])
    window.setTimeout(() => {
      setToasts((current) => current.map((toastItem) => (toastItem.id === id ? { ...toastItem, open: false } : toastItem)))
    }, 4500)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((item) => (
          <Toast.Root
            key={item.id}
            className={`w-full rounded-2xl border p-4 shadow-card animate-slide-up ${item.variant === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : item.variant === 'error' ? 'border-red-500/30 bg-red-500/10' : item.variant === 'warning' ? 'border-amber-500/30 bg-amber-500/10' : 'border-surface-border bg-surface-card'}`}
            open={item.open}
            onOpenChange={(open) => {
              if (!open) {
                setToasts((current) => current.filter((toastItem) => toastItem.id !== item.id))
              }
            }}
          >
            <Toast.Title className="text-sm font-semibold text-text-primary">{item.title}</Toast.Title>
            {item.description ? <Toast.Description className="mt-1 text-sm text-text-secondary">{item.description}</Toast.Description> : null}
          </Toast.Root>
        ))}
        <Toast.Viewport className="fixed right-0 top-0 z-[199] flex w-full max-w-sm flex-col gap-3 p-4 outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  )
}