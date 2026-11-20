import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'
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
  hasActiveToast: boolean
  pushToast: (toast: ToastInput) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 3200

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timersRef = useRef<Map<string, number>>(new Map())

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer != null) {
      window.clearTimeout(timer)
      timersRef.current.delete(id)
    }
  }, [])

  const dismissToast = useCallback(
    (id: string) => {
      clearTimer(id)
      setToasts((current) => current.filter((toast) => toast.id !== id))
    },
    [clearTimer],
  )

  const clearToasts = useCallback(() => {
    for (const id of timersRef.current.keys()) {
      clearTimer(id)
    }
    setToasts([])
  }, [clearTimer])

  useEffect(() => {
    return () => {
      for (const timer of timersRef.current.values()) {
        window.clearTimeout(timer)
      }
      timersRef.current.clear()
    }
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

      // Un seul toast à la fois : remplace le précédent (évite l’empilement).
      setToasts((current) => {
        for (const existing of current) {
          clearTimer(existing.id)
        }
        return [item]
      })

      const timer = window.setTimeout(() => dismissToast(id), durationMs)
      timersRef.current.set(id, timer)
      return id
    },
    [clearTimer, dismissToast],
  )

  const value = useMemo(
    () => ({
      toasts,
      hasActiveToast: toasts.length > 0,
      pushToast,
      dismissToast,
      clearToasts,
    }),
    [toasts, pushToast, dismissToast, clearToasts],
  )

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

/** Ferme les toasts au changement de route (évite qu’ils suivent sur la page suivante). */
export function DismissToastsOnNavigate() {
  const { pathname } = useLocation()
  const { clearToasts } = useToast()

  useEffect(() => {
    clearToasts()
  }, [pathname, clearToasts])

  return null
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast doit être utilisé dans ToastProvider')
  }
  return context
}
