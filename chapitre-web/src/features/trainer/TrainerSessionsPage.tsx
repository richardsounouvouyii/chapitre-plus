import { CalendarDays, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TRAINER_PATHS, trainerSessionPath } from '@/components/layout/app-shell/appNav'
import { StatusBadge, useToast } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import { canPublishPaidOffers } from './trainerStatus'
import { readTrainerMockProfile } from './trainerProfile'
import {
  ensureDemoTrainerSessions,
  formatSessionWhen,
  listTrainerSessions,
  PRICE_STATUS_LABELS,
  seatsLeft,
  SESSION_STATUS_LABELS,
  SESSION_STATUSES,
  submitTrainerSessionForApproval,
  type SessionStatus,
  type TrainerSession,
} from './trainerSessions'
import { formatVenueLabel, getVenueById } from './trainerVenues'

type FilterKey = 'ALL' | SessionStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'DRAFT', label: SESSION_STATUS_LABELS.DRAFT },
  { key: 'PENDING_APPROVAL', label: SESSION_STATUS_LABELS.PENDING_APPROVAL },
  { key: 'PUBLISHED', label: SESSION_STATUS_LABELS.PUBLISHED },
  { key: 'FULL', label: SESSION_STATUS_LABELS.FULL },
  { key: 'COMPLETED', label: SESSION_STATUS_LABELS.COMPLETED },
  { key: 'CANCELLED', label: SESSION_STATUS_LABELS.CANCELLED },
]

function statusBadgeVariant(
  status: SessionStatus,
): 'neutral' | 'warning' | 'success' | 'info' | 'error' {
  switch (status) {
    case SESSION_STATUSES.PUBLISHED:
      return 'success'
    case SESSION_STATUSES.PENDING_APPROVAL:
      return 'warning'
    case SESSION_STATUSES.DRAFT:
      return 'neutral'
    case SESSION_STATUSES.CANCELLED:
      return 'error'
    default:
      return 'info'
  }
}

export function TrainerSessionsPage() {
  const { session } = useAuthSession()
  const { pushToast } = useToast()
  const email = session?.email ?? DEMO_CREDENTIALS.TRAINER.email
  const profile = readTrainerMockProfile()
  const approved = profile ? canPublishPaidOffers(profile.status) : false

  const [filter, setFilter] = useState<FilterKey>('ALL')
  const [items, setItems] = useState<TrainerSession[]>([])

  const refresh = () => {
    setItems(ensureDemoTrainerSessions(email))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- email only
  }, [email])

  const visible = useMemo(
    () => (filter === 'ALL' ? items : items.filter((item) => item.status === filter)),
    [filter, items],
  )

  const onSubmitApproval = (id: string) => {
    if (!approved) {
      pushToast({
        tone: 'warning',
        title: 'Formateur non approuvé',
        message: 'Impossible d’envoyer une offre payante tant que le dossier n’est pas APPROVED.',
        durationMs: 4000,
      })
      return
    }
    const next = submitTrainerSessionForApproval(email, id, true)
    if (!next) {
      pushToast({
        tone: 'error',
        title: 'Action impossible',
        message: 'Seuls les brouillons peuvent être soumis.',
        durationMs: 3000,
      })
      return
    }
    setItems(listTrainerSessions(email))
    pushToast({
      tone: 'success',
      title: 'Soumis à l’admin',
      message: 'Tarif en statut proposé — publication après validation admin.',
      durationMs: 3500,
    })
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-heading">Séances</h1>
          <Link to={TRAINER_PATHS.seancesNouvelle} className="btn btn-primary h-10 gap-2 px-4">
            <Plus className="size-4" aria-hidden />
            Nouvelle séance
          </Link>
        </div>
        <p className="mt-2 text-sm text-body/65">
          Présentiel uniquement. Lieu catalogue + tarif XOF proposé — publication payante après
          admin.
        </p>
      </header>

      {!approved ? (
        <p className="mt-4 border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-heading">
          Dossier non approuvé : vous pouvez créer des <strong>brouillons</strong>, pas soumettre
          d’offre payante.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les séances">
        {FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={filter === item.key}
            className={`btn btn-sm h-9 ${filter === item.key ? 'btn-primary' : 'btn-ghost border border-border-light'}`}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="mt-6 border border-dashed border-border-light bg-page px-5 py-10 text-center">
          <CalendarDays className="mx-auto size-8 text-body/35" aria-hidden />
          <p className="mt-3 text-sm font-medium text-heading">Aucune séance</p>
          <p className="mt-1 text-sm text-body/60">Créez une séance à partir de vos disponibilités.</p>
          <Link to={TRAINER_PATHS.seancesNouvelle} className="btn btn-primary btn-sm mt-4">
            Créer une séance
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {visible.map((session) => {
            const venue = getVenueById(session.venueId)
            return (
              <li key={session.id} className="border border-border-light bg-surface p-4 sm:p-5">
                <div className="min-w-0">
                  <Link
                    to={trainerSessionPath(session.id)}
                    className="text-base font-semibold text-heading hover:text-primary hover:underline"
                  >
                    {session.title}
                  </Link>
                  <p className="mt-1 text-sm text-body/65">
                    {session.subject} · {session.level}
                  </p>
                  <p className="mt-1 text-sm text-body/55">{formatSessionWhen(session)}</p>
                  <p className="mt-1 text-sm text-body/55">
                    {venue ? formatVenueLabel(venue) : 'Lieu inconnu'}
                  </p>
                </div>
                <div className="mt-3 flex w-full items-center justify-between gap-2">
                  <StatusBadge
                    label={SESSION_STATUS_LABELS[session.status]}
                    variant={statusBadgeVariant(session.status)}
                  />
                  <StatusBadge
                    label={PRICE_STATUS_LABELS[session.priceStatus]}
                    variant={session.priceStatus === 'APPROVED' ? 'success' : 'warning'}
                    size="sm"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                  <span className="font-semibold text-heading">
                    {session.priceXof.toLocaleString('fr-BJ')} XOF
                  </span>
                  <span className="text-body/55">
                    Places : {seatsLeft(session)}/{session.capacity}
                  </span>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <Link
                      to={trainerSessionPath(session.id)}
                      className="btn btn-ghost btn-sm h-9 border border-border-light"
                    >
                      Détail
                    </Link>
                    {session.status === SESSION_STATUSES.DRAFT ? (
                      <button
                        type="button"
                        className="btn btn-outline btn-primary btn-sm h-9"
                        onClick={() => onSubmitApproval(session.id)}
                        disabled={!approved}
                      >
                        Soumettre
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
