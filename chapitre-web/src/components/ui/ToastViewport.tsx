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

const ALERT_CLASS: Record<AlertTone, string> = {
  info: 'alert-info',
  success: 'alert-success',
  warning: 'alert-warning',
  error: 'alert-error',
}

function ToastCard({ toast, onDismiss }: { toast: ToastItem; onDismiss: (id: string) => void }) {
  const Icon = ICONS[toast.tone]
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      className={cn(
        'alert w-80 max-w-[calc(100vw-2rem)] shadow-lg transition-all duration-300',
        ALERT_CLASS[toast.tone],
        visible ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0',
      )}
      role="status"
    >
      <Icon className="size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {toast.title ? <p className="font-semibold">{toast.title}</p> : null}
        <p className="text-sm opacity-90">{toast.message}</p>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-current/20">
          <div
            className="h-full origin-left rounded-full bg-current/70"
            style={{
              animation: `chapitre-toast-progress ${toast.durationMs}ms linear forwards`,
            }}
          />
        </div>
      </div>
      <button
        type="button"
        className="btn btn-ghost btn-xs btn-square"
        onClick={() => onDismiss(toast.id)}
        aria-label="Fermer la notification"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}

export function ToastViewport() {
  const { toasts, dismissToast } = useToast()

  return (
    <>
      <style>{`
        @keyframes chapitre-toast-progress {
          from { transform: scaleX(1); }
          to { transform: scaleX(0); }
        }
      `}</style>
      <div className="toast toast-end toast-bottom z-[100] gap-2">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </>
  )
}
