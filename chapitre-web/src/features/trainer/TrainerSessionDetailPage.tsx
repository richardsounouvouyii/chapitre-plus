import { ArrowLeft, CalendarDays, MapPin, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { TRAINER_PATHS, trainerSessionPath } from '@/components/layout/app-shell/appNav'
import { StatusBadge, useToast } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import { canPublishPaidOffers } from './trainerStatus'
import { readTrainerMockProfile } from './trainerProfile'
import {
  canCancelTrainerSession,
  cancelTrainerSession,
  completeTrainerSession,
  formatSessionWhen,
  getTrainerSession,
  PRICE_STATUS_LABELS,
  seatsLeft,
  SESSION_STATUS_LABELS,
  SESSION_STATUSES,
  submitTrainerSessionForApproval,
  type SessionStatus,
  type TrainerSession,
} from './trainerSessions'
import { formatVenueLabel, getVenueById } from './trainerVenues'

function statusBadgeVariant(
  status: SessionStatus,
): 'neutral' | 'warning' | 'success' | 'info' | 'error' {
  switch (status) {
    case SESSION_STATUSES.PUBLISHED:
    case SESSION_STATUSES.COMPLETED:
      return 'success'
    case SESSION_STATUSES.PENDING_APPROVAL:
    case SESSION_STATUSES.FULL:
      return 'warning'
    case SESSION_STATUSES.DRAFT:
      return 'neutral'
    case SESSION_STATUSES.CANCELLED:
      return 'error'
    default:
      return 'info'
  }
}

export function TrainerSessionDetailPage() {
  const { sessionId } = useParams()
  const { session } = useAuthSession()
  const { pushToast } = useToast()
  const email = session?.email ?? DEMO_CREDENTIALS.TRAINER.email
  const profile = readTrainerMockProfile()
  const approved = profile ? canPublishPaidOffers(profile.status) : false

  const [item, setItem] = useState<TrainerSession | null>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [confirmCancel, setConfirmCancel] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setItem(null)
      return
    }
    setItem(getTrainerSession(email, sessionId))
    setConfirmCancel(false)
    setCancelReason('')
  }, [email, sessionId])

  if (!sessionId || !item) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-up py-10 text-center">
        <p className="text-sm font-medium text-heading">Séance introuvable</p>
        <p className="mt-1 text-sm text-body/60">Elle n’existe pas dans le store mock actuel.</p>
        <Link to={TRAINER_PATHS.seances} className="btn btn-primary btn-sm mt-4 gap-2">
          <ArrowLeft className="size-4" aria-hidden />
          Retour aux séances
        </Link>
      </div>
    )
  }

  const venue = getVenueById(item.venueId)
  const left = seatsLeft(item)
  const cancelable = canCancelTrainerSession(item)
  const completable =
    item.status === SESSION_STATUSES.PUBLISHED || item.status === SESSION_STATUSES.FULL

  const onSubmitApproval = () => {
    if (!approved) {
      pushToast({
        tone: 'warning',
        title: 'Formateur non approuvé',
        message: 'Soumission réservée aux dossiers APPROVED.',
        durationMs: 4000,
      })
      return
    }
    const next = submitTrainerSessionForApproval(email, item.id, true)
    if (!next) {
      pushToast({
        tone: 'error',
        title: 'Action impossible',
        message: 'Seuls les brouillons peuvent être soumis.',
        durationMs: 3000,
      })
      return
    }
    setItem(next)
    pushToast({
      tone: 'success',
      title: 'Soumis à l’admin',
      message: 'Publication payante après validation du tarif.',
      durationMs: 3500,
    })
  }

  const onCancel = () => {
    const next = cancelTrainerSession(email, item.id, cancelReason)
    if (!next) {
      pushToast({
        tone: 'error',
        title: 'Annulation refusée',
        message: 'Cette séance ne peut plus être annulée.',
        durationMs: 3000,
      })
      return
    }
    setItem(next)
    setConfirmCancel(false)
    pushToast({
      tone: 'success',
      title: 'Séance annulée',
      message: 'Statut CANCELLED (mock — pas de remboursement réel).',
      durationMs: 3500,
    })
  }

  const onComplete = () => {
    const next = completeTrainerSession(email, item.id)
    if (!next) {
      pushToast({
        tone: 'error',
        title: 'Clôture impossible',
        message: 'Réservée aux séances publiées ou complètes.',
        durationMs: 3000,
      })
      return
    }
    setItem(next)
    pushToast({
      tone: 'success',
      title: 'Séance clôturée',
      message: 'Statut COMPLETED (mock).',
      durationMs: 3000,
    })
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <Link
          to={TRAINER_PATHS.seances}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          Séances
        </Link>
        <div className="mt-3 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
            Détail séance
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading">{item.title}</h1>
          <p className="mt-2 text-sm text-body/65">
            {item.subject} · {item.level}
          </p>
        </div>
        <div className="mt-3 flex w-full items-center justify-between gap-2">
          <StatusBadge
            label={SESSION_STATUS_LABELS[item.status]}
            variant={statusBadgeVariant(item.status)}
          />
          <StatusBadge
            label={PRICE_STATUS_LABELS[item.priceStatus]}
            variant={item.priceStatus === 'APPROVED' ? 'success' : 'warning'}
            size="sm"
          />
        </div>
      </header>

      <dl className="mt-6 space-y-4 border border-border-light bg-surface p-4 sm:p-5">
        <div className="flex gap-3">
          <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary/70" aria-hidden />
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-body/45">Quand</dt>
            <dd className="mt-1 text-sm font-medium text-heading">{formatSessionWhen(item)}</dd>
          </div>
        </div>
        <div className="flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 text-primary/70" aria-hidden />
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-body/45">Lieu</dt>
            <dd className="mt-1 text-sm font-medium text-heading">
              {venue ? formatVenueLabel(venue) : 'Lieu inconnu'}
            </dd>
            {venue ? (
              <p className="mt-0.5 text-sm text-body/55">{venue.address}</p>
            ) : null}
          </div>
        </div>
        <div className="flex gap-3">
          <Users className="mt-0.5 size-5 shrink-0 text-primary/70" aria-hidden />
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-body/45">
              Capacité
            </dt>
            <dd className="mt-1 text-sm font-medium text-heading">
              {left} place{left > 1 ? 's' : ''} libre{left > 1 ? 's' : ''} / {item.capacity}
            </dd>
            <p className="mt-0.5 text-sm text-body/55">
              {item.seatsTaken} inscription{item.seatsTaken > 1 ? 's' : ''} mock
            </p>
          </div>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-body/45">Tarif</dt>
          <dd className="mt-1 text-base font-semibold text-heading">
            {item.priceXof.toLocaleString('fr-BJ')} XOF
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-body/45">Notes</dt>
          <dd className="mt-1 text-sm text-body/75 whitespace-pre-wrap">
            {item.notes?.trim() ? item.notes : 'Aucune note.'}
          </dd>
        </div>
        {item.cancelReason ? (
          <div className="border-t border-border-light pt-4">
            <dt className="text-xs font-semibold uppercase tracking-wide text-error/80">
              Motif d’annulation
            </dt>
            <dd className="mt-1 text-sm text-heading">{item.cancelReason}</dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 flex flex-wrap gap-2">
        {item.status === SESSION_STATUSES.DRAFT ? (
          <button
            type="button"
            className="btn btn-primary h-10 px-4"
            onClick={onSubmitApproval}
            disabled={!approved}
          >
            Soumettre à l’admin
          </button>
        ) : null}
        {item.status === SESSION_STATUSES.PUBLISHED ||
        item.status === SESSION_STATUSES.FULL ||
        item.status === SESSION_STATUSES.COMPLETED ? (
          <Link
            to={`${TRAINER_PATHS.documents}?sessionId=${encodeURIComponent(item.id)}`}
            className="btn btn-outline btn-primary h-10 px-4"
          >
            Supports liés
          </Link>
        ) : null}
        {completable ? (
          <button type="button" className="btn btn-outline h-10 px-4" onClick={onComplete}>
            Clôturer (mock)
          </button>
        ) : null}
        {cancelable ? (
          <button
            type="button"
            className="btn btn-outline btn-error h-10 px-4"
            onClick={() => setConfirmCancel((value) => !value)}
          >
            {confirmCancel ? 'Masquer l’annulation' : 'Annuler la séance'}
          </button>
        ) : null}
      </div>

      {confirmCancel && cancelable ? (
        <div className="mt-4 border border-error/25 bg-error/5 p-4">
          <label htmlFor="cancel-reason" className="mb-1 block text-sm font-semibold text-heading">
            Motif (optionnel)
          </label>
          <textarea
            id="cancel-reason"
            className="textarea textarea-bordered min-h-20 w-full rounded-none border border-slate-300 bg-white"
            maxLength={300}
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Ex. centre indisponible, chevauchement…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn btn-error h-10 px-4" onClick={onCancel}>
              Confirmer l’annulation
            </button>
            <button
              type="button"
              className="btn btn-ghost h-10 px-4"
              onClick={() => {
                setConfirmCancel(false)
                setCancelReason('')
              }}
            >
              Ne pas annuler
            </button>
          </div>
          <p className="mt-2 text-xs text-body/55">
            Mock uniquement : pas de notification parent ni remboursement réel.
          </p>
        </div>
      ) : null}

      <p className="mt-6 text-xs text-body/45">
        Réf. mock · <span className="font-mono">{item.id}</span>
        {' · '}
        <span className="font-mono">{trainerSessionPath(item.id)}</span>
      </p>
    </div>
  )
}
