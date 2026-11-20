import {
  CalendarDays,
  Clock,
  GraduationCap,
  MapPin,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { STUDENT_PATHS } from '@/components/layout/app-shell/appNav'
import { StatusBadge } from '@/components/ui'
import { formatPriceXof } from '@/features/bookings/mocks'
import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
  type StudentBooking,
} from '@/features/bookings/types'

const STATUS_VARIANT: Record<
  BookingStatus,
  'info' | 'neutral' | 'success' | 'primary'
> = {
  PENDING_GUARDIAN_APPROVAL: 'info',
  PENDING_PAYMENT: 'primary',
  CONFIRMED: 'success',
  CANCELLED: 'neutral',
  REFUNDED: 'neutral',
}

const STATUS_HINT: Record<BookingStatus, string> = {
  PENDING_GUARDIAN_APPROVAL:
    'Le parent / tuteur doit approuver avant de pouvoir payer.',
  PENDING_PAYMENT:
    'Paiement en attente — le statut « payé » n’apparaîtra qu’après confirmation serveur.',
  CONFIRMED: 'Place confirmée. Présentez-vous au lieu indiqué à l’heure prévue.',
  CANCELLED: 'Cette inscription a été annulée.',
  REFUNDED: 'Remboursement enregistré selon la politique plateforme.',
}

function formatSlot(startsAt: string, endsAt: string): string {
  const start = new Date(startsAt)
  const end = new Date(endsAt)
  const day = start.toLocaleDateString('fr-BJ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const from = start.toLocaleTimeString('fr-BJ', { hour: '2-digit', minute: '2-digit' })
  const to = end.toLocaleTimeString('fr-BJ', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${from} – ${to}`
}

type StudentBookingCardProps = {
  item: StudentBooking
}

export function StudentBookingCard({ item }: StudentBookingCardProps) {
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
          <p className="mt-1 text-sm text-body/70">{item.chapter}</p>
          {item.fromDifficultyLabel ? (
            <p className="mt-1.5 text-xs text-body/45">Liée à : {item.fromDifficultyLabel}</p>
          ) : null}
        </div>
        <StatusBadge
          label={BOOKING_STATUS_LABELS[item.status]}
          variant={STATUS_VARIANT[item.status]}
          size="sm"
          className="shrink-0"
        />
      </div>

      <div className="grid gap-3 px-4 py-4 sm:grid-cols-2 sm:gap-x-6 sm:px-5 sm:py-5">
        <p className="flex items-start gap-2 text-sm text-body/80">
          <CalendarDays className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{formatSlot(item.startsAt, item.endsAt)}</span>
        </p>
        <p className="flex items-start gap-2 text-sm text-body/80">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {item.venueLabel}
            <span className="text-body/50"> · {item.city}</span>
          </span>
        </p>
        <p className="flex items-start gap-2 text-sm text-body/80">
          <UserRound className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>{item.trainerName}</span>
        </p>
        <p className="flex items-start gap-2 text-sm font-semibold text-heading">
          <Wallet className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            {formatPriceXof(item.priceXof)}
            <span className="ml-1 font-normal text-body/50">tarif figé</span>
          </span>
        </p>
      </div>

      <div className="flex flex-col gap-3 border-t border-border-light px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="flex items-start gap-2 text-xs leading-relaxed text-body/60">
          <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{STATUS_HINT[item.status]}</span>
        </p>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          {item.status === 'PENDING_PAYMENT' ? (
            <button
              type="button"
              className="btn btn-primary h-10 w-full px-4 sm:w-auto"
              disabled
              title="Paiement réel à la phase Payment"
            >
              Payer (bientôt)
            </button>
          ) : null}
          {item.status === 'CONFIRMED' ? (
            <Link
              to={STUDENT_PATHS.ressources}
              className="btn btn-outline btn-primary h-10 w-full px-4 sm:w-auto"
            >
              Ressources
            </Link>
          ) : null}
          {item.status === 'PENDING_GUARDIAN_APPROVAL' ? (
            <Link
              to={STUDENT_PATHS.profil}
              className="btn btn-outline btn-primary h-10 w-full px-4 sm:w-auto"
            >
              Voir le lien parent
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}
