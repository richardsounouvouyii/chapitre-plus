import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

const STYLES = {
  info: { className: 'alert-info text-info-content', Icon: Info },
  success: { className: 'alert-success text-success-content', Icon: CheckCircle2 },
  warning: { className: 'alert-warning text-warning-content', Icon: AlertTriangle },
  error: { className: 'alert-error text-error-content', Icon: AlertCircle },
} as const

export type AlertTone = keyof typeof STYLES

type AlertBannerProps = {
  tone?: AlertTone
  title?: string
  children: ReactNode
  onClose?: () => void
  className?: string
}

export function AlertBanner({
  tone = 'info',
  title,
  children,
  onClose,
  className,
}: AlertBannerProps) {
  const { className: toneClass, Icon } = STYLES[tone]

  return (
    <div role="alert" className={cn('alert', toneClass, className)}>
      <Icon className="size-5 shrink-0" aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <h3 className="font-semibold">{title}</h3> : null}
        <div className="text-sm opacity-90">{children}</div>
      </div>
      {onClose ? (
        <button
          type="button"
          className="btn btn-ghost btn-xs btn-square"
          onClick={onClose}
          aria-label="Fermer"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
