import type { ReactNode } from 'react'

type AppPageHeaderProps = {
  title: string
  description?: string
  eyebrow: string
  actions?: ReactNode
}

/** En-tête commun des espaces connectés (élève, formateur, parent, admin). */
export function AppPageHeader({ title, description, eyebrow, actions }: AppPageHeaderProps) {
  return (
    <header className="flex flex-col gap-4 border-b border-border-light pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          {eyebrow}
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading md:text-[1.75rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body/70">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          {actions}
        </div>
      ) : null}
    </header>
  )
}
