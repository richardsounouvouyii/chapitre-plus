import { CalendarDays, Check, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ADMIN_PATHS } from '@/components/layout/app-shell/appNav'
import { StatusBadge, useToast } from '@/components/ui'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import {
  approveTrainerSessionPrice,
  ensureDemoTrainerSessions,
  formatSessionWhen,
  getStoredTrainerEmail,
  listPendingAdminApprovals,
  listStoredTrainerSessions,
  PRICE_STATUS_LABELS,
  rejectTrainerSessionPrice,
  SESSION_STATUS_LABELS,
  SESSION_STATUSES,
  type TrainerSession,
} from '@/features/trainer/trainerSessions'
import { formatVenueLabel, getVenueById } from '@/features/trainer/trainerVenues'

export function AdminSessionsPage() {
  const { pushToast } = useToast()
  const [pending, setPending] = useState<TrainerSession[]>([])
  const [publishedCount, setPublishedCount] = useState(0)
  const [trainerEmail, setTrainerEmail] = useState<string | null>(null)

  const refresh = () => {
    ensureDemoTrainerSessions(DEMO_CREDENTIALS.TRAINER.email)
    setTrainerEmail(getStoredTrainerEmail())
    setPending(listPendingAdminApprovals())
    setPublishedCount(
      listStoredTrainerSessions().filter((item) => item.status === SESSION_STATUSES.PUBLISHED)
        .length,
    )
  }

  useEffect(() => {
    refresh()
  }, [])

  const onApprove = (session: TrainerSession) => {
    const next = approveTrainerSessionPrice(session.trainerEmail, session.id)
    if (!next) {
      pushToast({
        tone: 'error',
        title: 'Approbation impossible',
        message: 'Seules les séances en attente avec tarif proposé peuvent être publiées.',
        durationMs: 3500,
      })
      return
    }
    refresh()
    pushToast({
      tone: 'success',
      title: 'Tarif approuvé',
      message: `« ${next.title} » → PUBLISHED · ${next.priceXof.toLocaleString('fr-BJ')} XOF`,
      durationMs: 4000,
    })
  }

  const onReject = (session: TrainerSession) => {
    const next = rejectTrainerSessionPrice(session.trainerEmail, session.id)
    if (!next) {
      pushToast({
        tone: 'error',
        title: 'Rejet impossible',
        message: 'Séance non éligible.',
        durationMs: 3000,
      })
      return
    }
    refresh()
    pushToast({
      tone: 'warning',
      title: 'Renvoyée en brouillon',
      message: 'Le formateur pourra resoumettre un tarif.',
      durationMs: 3500,
    })
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace administrateur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading">
          Séances & tarifs
        </h1>
        <p className="mt-2 text-sm text-body/65">
          Approuver le tarif proposé avant publication payante (mock — pas d’API).
        </p>
      </header>

      <div className="mt-5 flex flex-wrap gap-3 text-sm">
        <span className="border border-border-light bg-surface px-3 py-2">
          En attente : <strong>{pending.length}</strong>
        </span>
        <span className="border border-border-light bg-surface px-3 py-2">
          Publiées : <strong>{publishedCount}</strong>
        </span>
        {trainerEmail ? (
          <span className="border border-border-light bg-surface px-3 py-2 text-body/65">
            Formateur mock : {trainerEmail}
          </span>
        ) : null}
      </div>

      {pending.length === 0 ? (
        <div className="mt-6 border border-dashed border-border-light bg-page px-5 py-10 text-center">
          <CalendarDays className="mx-auto size-8 text-body/35" aria-hidden />
          <p className="mt-3 text-sm font-medium text-heading">Aucune demande de tarif</p>
          <p className="mt-1 text-sm text-body/60">
            Connectez-vous en formateur APPROVED et soumettez une séance, puis revenez ici.
          </p>
          <Link to={ADMIN_PATHS.home} className="btn btn-ghost btn-sm mt-4">
            Vue d’ensemble
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {pending.map((session) => {
            const venue = getVenueById(session.venueId)
            return (
              <li key={session.id} className="border border-border-light bg-surface p-4 sm:p-5">
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-heading">{session.title}</h2>
                  <p className="mt-1 text-sm text-body/65">
                    {session.subject} · {session.level}
                  </p>
                  <p className="mt-1 text-sm text-body/55">{formatSessionWhen(session)}</p>
                  <p className="mt-1 text-sm text-body/55">
                    {venue ? formatVenueLabel(venue) : 'Lieu inconnu'}
                  </p>
                  <p className="mt-1 text-xs text-body/45">{session.trainerEmail}</p>
                </div>
                <div className="mt-3 flex w-full items-center justify-between gap-2">
                  <StatusBadge
                    label={SESSION_STATUS_LABELS[session.status]}
                    variant="warning"
                  />
                  <StatusBadge
                    label={PRICE_STATUS_LABELS[session.priceStatus]}
                    variant="warning"
                    size="sm"
                  />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span className="text-base font-semibold text-heading">
                    {session.priceXof.toLocaleString('fr-BJ')} XOF
                  </span>
                  <div className="ml-auto flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-sm h-9 gap-1.5"
                      onClick={() => onApprove(session)}
                    >
                      <Check className="size-4" aria-hidden />
                      Approuver → PUBLISHED
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-error btn-sm h-9 gap-1.5"
                      onClick={() => onReject(session)}
                    >
                      <X className="size-4" aria-hidden />
                      Rejeter
                    </button>
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
