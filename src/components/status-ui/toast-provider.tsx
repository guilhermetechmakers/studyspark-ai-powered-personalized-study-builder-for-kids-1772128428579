import * as React from 'react'
import { ToastContainer } from './toast-container'
import type { Toast, ToastAction } from './toast-item'

export interface AddToastOptions {
  type: Toast['type']
  title: string
  description?: string
  duration?: number
  action?: ToastAction
}

export interface ToastContextValue {
  toasts: Toast[]
  addToast: (options: AddToastOptions) => string
  dismissToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | null>(null)

function generateId() {
  return `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export function ToastProvider({
  children,
  position = 'top-right',
  maxToasts = 5,
}: {
  children: React.ReactNode
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  maxToasts?: number
}) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((options: AddToastOptions) => {
    const id = generateId()
    const toast: Toast = {
      id,
      type: options.type,
      title: options.title,
      description: options.description,
      duration: options.duration,
      action: options.action,
    }
    setToasts((prev) => {
      const list = Array.isArray(prev) ? prev : []
      const next = [...list, toast]
      return next.slice(-maxToasts)
    })
    return id
  }, [maxToasts])

  const dismissToast = React.useCallback((id: string) => {
    setToasts((prev) => (Array.isArray(prev) ? prev.filter((t) => t.id !== id) : []))
  }, [])

  const value = React.useMemo(
    () => ({ toasts, addToast, dismissToast }),
    [toasts, addToast, dismissToast]
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} position={position} />
    </ToastContext.Provider>
  )
}

export function useStatusToast() {
  const ctx = React.useContext(ToastContext)
  if (!ctx) {
    return null
  }
  return ctx
}
