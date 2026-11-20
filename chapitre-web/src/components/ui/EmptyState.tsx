import type { LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
  /** Icône Lucide (ignorée si `illustration` est fourni). */
  icon?: LucideIcon
  /** Illustration WebP / asset (préféré pour empty states visuels). */
  illustration?: string
  illustrationAlt?: string
}

export function EmptyState({
  icon: Icon,
  illustration,
  illustrationAlt = '',
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-box border border-base-300 bg-base-100 px-6 py-12 text-center">
      {illustration ? (
        <img
          src={illustration}
          alt={illustrationAlt}
          width={160}
          height={160}
          className="mb-1 size-36 object-contain sm:size-40"
          decoding="async"
        />
      ) : Icon ? (
        <Icon className="size-10 text-primary/70" aria-hidden />
      ) : null}
      <h2 className="text-lg font-semibold text-heading">{title}</h2>
      <p className="max-w-md text-sm text-base-content/70">{description}</p>
    </div>
  )
}
