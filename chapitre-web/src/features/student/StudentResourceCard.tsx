import { Download, FileImage, FileText, Lock, UserRound } from 'lucide-react'
import { StatusBadge, useToast } from '@/components/ui'
import { canDownloadResource } from '@/features/resources/mocks'
import {
  RESOURCE_CATEGORY_LABELS,
  type ResourceFormat,
  type StudentResource,
} from '@/features/resources/types'

function FormatIcon({ format }: { format: ResourceFormat }) {
  if (format === 'PDF') {
    return <FileText className="size-5 text-primary" aria-hidden />
  }
  return <FileImage className="size-5 text-primary" aria-hidden />
}

function formatVisibleAt(iso: string): string {
  return new Date(iso).toLocaleString('fr-BJ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type StudentResourceCardProps = {
  item: StudentResource
}

export function StudentResourceCard({ item }: StudentResourceCardProps) {
  const { pushToast } = useToast()
  const unlocked = canDownloadResource(item)

  const lockReason = !item.bookingConfirmed
    ? 'Réservation confirmée requise pour télécharger.'
    : `Disponible à partir du ${formatVisibleAt(item.visibleAt)}.`

  const handleDownload = () => {
    if (!unlocked) return
    pushToast({
      tone: 'info',
      title: 'Téléchargement mock',
      message: `${item.title} (${item.format}) — URL signée réelle à la phase Resource.`,
      durationMs: 3500,
    })
  }

  return (
    <article className="border border-border-light bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-light bg-page/60 px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center bg-soft-blue">
            <FormatIcon format={item.format} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-snug text-heading">{item.title}</h2>
            <p className="mt-1 text-sm text-body/65">{item.sessionLabel}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            label={RESOURCE_CATEGORY_LABELS[item.category]}
            variant="primary"
            size="sm"
          />
          <StatusBadge
            label={item.format}
            variant="neutral"
            size="sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="space-y-1.5 text-sm text-body/75">
          <p className="flex items-center gap-2">
            <UserRound className="size-4 shrink-0 text-primary" aria-hidden />
            {item.trainerName}
          </p>
          <p className="text-xs text-body/50">
            {item.sizeLabel}
            {unlocked
              ? ` · visible depuis le ${formatVisibleAt(item.visibleAt)}`
              : ` · ${lockReason}`}
          </p>
        </div>

        {unlocked ? (
          <button
            type="button"
            onClick={handleDownload}
            className="btn btn-primary h-10 w-full gap-2 px-4 sm:w-auto"
            aria-label={`Télécharger uniquement : ${item.title}`}
          >
            <Download className="size-4" aria-hidden />
            Télécharger ce document
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="btn btn-ghost h-10 w-full gap-2 px-4 sm:w-auto"
            title={lockReason}
            aria-label={`Document verrouillé : ${item.title}`}
          >
            <Lock className="size-4" aria-hidden />
            Pas encore disponible
          </button>
        )}
      </div>
    </article>
  )
}
