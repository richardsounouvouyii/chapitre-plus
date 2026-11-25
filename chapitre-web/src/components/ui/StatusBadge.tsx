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
        'badge h-auto min-h-0 border-0 font-medium leading-tight',
        VARIANTS[variant],
        size === 'xs' && 'px-2 py-1 text-[10px]',
        size === 'sm' && 'px-2.5 py-1.5 text-xs',
        size === 'md' && 'px-3 py-2 text-sm',
        className,
      )}
    >
      {label}
    </span>
  )
}
