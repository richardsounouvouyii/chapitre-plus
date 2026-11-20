import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AlertTone } from './AlertBanner'

export type ToastInput = {
  title?: string
  message: string
  tone?: AlertTone
  durationMs?: number
}

export type ToastItem = ToastInput & {
  id: string
  createdAt: number
  durationMs: number
  tone: AlertTone
}

type ToastContextValue = {
  toasts: ToastItem[]
  pushToast: (toast: ToastInput) => string
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 4200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }, [])

  const pushToast = useCallback(
    (toast: ToastInput) => {
      const id = crypto.randomUUID()
      const durationMs = toast.durationMs ?? DEFAULT_DURATION
      const item: ToastItem = {
        id,
        createdAt: Date.now(),
        durationMs,
        tone: toast.tone ?? 'info',
        title: toast.title,
        message: toast.message,
      }
      setToasts((current) => [...current, item].slice(-4))
      window.setTimeout(() => dismissToast(id), durationMs)
      return id
    },
    [dismissToast],
  )

  const value = useMemo(
    () => ({ toasts, pushToast, dismissToast }),
    [toasts, pushToast, dismissToast],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé dans ToastProvider')
  }
  return context
}
