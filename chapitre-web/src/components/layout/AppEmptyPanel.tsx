import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type AppEmptyPanelProps = {
  icon: LucideIcon
  title: string
  description: string
  actions?: ReactNode
}

/** Empty state sobre pour les espaces app (sans illustration cartoon). */
export function AppEmptyPanel({
  icon: Icon,
  title,
  description,
  actions,
}: AppEmptyPanelProps) {
  return (
    <div className="border border-border-light bg-surface px-4 py-10 text-center sm:px-5 sm:py-12 md:px-8">
      <div className="mx-auto flex size-12 items-center justify-center bg-soft-blue text-primary">
        <Icon className="size-6" aria-hidden />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-heading">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-body/65">{description}</p>
      {actions ? (
        <div className="mt-6 flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center [&_.btn]:h-11 [&_.btn]:w-full sm:[&_.btn]:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
