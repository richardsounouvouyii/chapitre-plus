import { cn } from '@/lib/utils'

const VARIANTS = {
  neutral: 'badge-ghost',
  info: 'badge-info',
  success: 'badge-success',
  warning: 'badge-warning',
  error: 'badge-error',
  primary: 'badge-primary',
  secondary: 'badge-secondary',
} as const

export type BadgeVariant = keyof typeof VARIANTS

type StatusBadgeProps = {
  label: string
  variant?: BadgeVariant
  size?: 'xs' | 'sm' | 'md'
  className?: string
}

export function StatusBadge({
  label,
  variant = 'neutral',
  size = 'sm',
  className,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'badge font-medium',
        VARIANTS[variant],
        size === 'xs' && 'badge-xs',
        size === 'sm' && 'badge-sm',
        size === 'md' && 'badge-md',
        className,
      )}
    >
      {label}
    </span>
  )
}
