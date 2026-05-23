"use client"

import * as Dialog from '@radix-ui/react-dialog'

export default function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-slate-950/70 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[101] w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-surface-border bg-surface-card p-6 shadow-card outline-none">
          <Dialog.Title className="text-xl font-bold text-text-primary">{title}</Dialog.Title>
          <Dialog.Description className="mt-3 text-sm text-text-secondary">{description}</Dialog.Description>
          <div className="mt-6 flex flex-wrap justify-end gap-3">
            <Dialog.Close className="btn-secondary">{cancelLabel}</Dialog.Close>
            <button type="button" onClick={onConfirm} className="btn-primary">
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}