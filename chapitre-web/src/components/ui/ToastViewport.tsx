import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { AlertTone } from './AlertBanner'
import { useToast, type ToastItem } from './toast-context'

const ICONS: Record<AlertTone, typeof Info> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: AlertCircle,
}

const TONE_CLASS: Record<AlertTone, string> = {
  info: 'bg-info text-info-content',
  success: 'bg-success text-success-content',
  warning: 'bg-warning text-warning-content',
  error: 'bg-error text-error-content',
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.tone]
  const [visible, setVisible] = useState(false)
  const label = toast.title ? `${toast.title} — ${toast.message}` : toast.message

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={cn(
        'pointer-events-auto relative flex max-w-[min(100%,36rem)] items-center gap-2.5 overflow-hidden rounded-full px-3.5 py-2.5 shadow-lg transition-all duration-300 sm:gap-3 sm:px-4',
        TONE_CLASS[toast.tone],
        visible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0',
      )}
      role="status"
    >
      <Icon className="size-4 shrink-0 sm:size-[1.125rem]" aria-hidden />
      <p className="min-w-0 flex-1 truncate text-sm font-medium leading-none">{label}</p>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-circle shrink-0 text-current hover:bg-current/15"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
      >
        <X className="size-3.5" />
      </button>
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-current/20"
        aria-hidden
      >
        <div
          className="h-full origin-left bg-current/85"
          style={{
            animation: `chapitre-toast-progress ${toast.durationMs}ms linear forwards`,
          }}
        />
      </div>
    </div>
  )
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  if (toasts.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes chapitre-toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      <div
        className="pointer-events-none fixed inset-x-0 top-14 z-[100] flex justify-center px-3 sm:top-16 sm:px-4"
        aria-live="polite"
      >
        <div className="flex w-full max-w-xl flex-col items-center gap-2">
          {toasts.map((toast) => (
            <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
          ))}
        </div>
      </div>
    </>
  )
}
