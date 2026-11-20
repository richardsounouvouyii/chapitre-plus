import { BookOpen, CalendarClock, GraduationCap, Layers } from 'lucide-react'
import { StatusBadge } from '@/components/ui'
import {
  DIFFICULTY_STATUS_LABELS,
  type DifficultyRequest,
  type DifficultyStatus,
} from '@/features/difficulties/types'

const STATUS_VARIANT: Record<
  DifficultyStatus,
  'info' | 'neutral' | 'success' | 'primary'
> = {
  SUBMITTED: 'info',
  IN_REVIEW: 'primary',
  PROPOSED: 'primary',
  SCHEDULED: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'neutral',
}

function formatSubmittedAt(iso: string): string {
  return new Date(iso).toLocaleString('fr-BJ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type DifficultyRequestCardProps = {
  item: DifficultyRequest
}

export function DifficultyRequestCard({ item }: DifficultyRequestCardProps) {
  return (
    <article className="border border-border-light bg-surface">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-light bg-page/60 px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-heading">{item.subject}</h2>
            <span className="inline-flex items-center gap-1 bg-soft-blue px-2 py-0.5 text-xs font-semibold text-primary">
              <GraduationCap className="size-3.5" aria-hidden />
              {item.level}
            </span>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-body/50">
            <CalendarClock className="size-3.5 shrink-0" aria-hidden />
            Déposée le {formatSubmittedAt(item.createdAt)}
          </p>
        </div>
        <StatusBadge
          label={DIFFICULTY_STATUS_LABELS[item.status]}
          variant={STATUS_VARIANT[item.status]}
          size="sm"
          className="shrink-0"
        />
      </div>

      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
            <BookOpen className="size-3.5" aria-hidden />
            Chapitre
          </p>
          <p className="mt-1 text-sm font-medium leading-snug text-heading">{item.chapter}</p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
            <Layers className="size-3.5" aria-hidden />
            Notion / difficulté
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-body/80">
            {item.notion}
          </p>
        </div>

        {item.preferences ? (
          <div className="border-t border-border-light pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-body/45">
              Préférences
            </p>
            <p className="mt-1 text-sm text-body/70">{item.preferences}</p>
          </div>
        ) : null}
      </div>
    </article>
  )
}
