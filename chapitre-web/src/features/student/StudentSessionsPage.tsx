import { useMemo, useState } from 'react'
import { CalendarDays, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppEmptyPanel } from '@/components/layout/AppEmptyPanel'
import { STUDENT_PATHS } from '@/components/layout/app-shell/appNav'
import { listStudentBookings } from '@/features/bookings/mocks'
import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
  type StudentBooking,
} from '@/features/bookings/types'
import { isSupportedLevel } from '@/features/public/curriculumLevels'
import { readStudentMockSession } from './studentSession'
import { StudentBookingCard } from './StudentBookingCard'
import { StudentPageHeader } from './StudentPageHeader'

type FilterKey = 'ALL' | BookingStatus

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Toutes' },
  { key: 'PENDING_GUARDIAN_APPROVAL', label: BOOKING_STATUS_LABELS.PENDING_GUARDIAN_APPROVAL },
  { key: 'PENDING_PAYMENT', label: BOOKING_STATUS_LABELS.PENDING_PAYMENT },
  { key: 'CONFIRMED', label: BOOKING_STATUS_LABELS.CONFIRMED },
]

function sortBookings(items: StudentBooking[]): StudentBooking[] {
  const rank: Record<BookingStatus, number> = {
    PENDING_GUARDIAN_APPROVAL: 0,
    PENDING_PAYMENT: 1,
    CONFIRMED: 2,
    CANCELLED: 3,
    REFUNDED: 4,
  }
  return [...items].sort((a, b) => {
    const byStatus = rank[a.status] - rank[b.status]
    if (byStatus !== 0) return byStatus
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()
  })
}

export function StudentSessionsPage() {
  const [filter, setFilter] = useState<FilterKey>('ALL')
  const session = readStudentMockSession()
  const level =
    session.level && isSupportedLevel(session.level) ? session.level : undefined
  const bookings = listStudentBookings(level)
  const sorted = useMemo(() => sortBookings(bookings), [bookings])
  const visible = useMemo(
    () => (filter === 'ALL' ? sorted : sorted.filter((item) => item.status === filter)),
    [filter, sorted],
  )

  const counts = useMemo(() => {
    const base: Record<FilterKey, number> = {
      ALL: bookings.length,
      PENDING_GUARDIAN_APPROVAL: 0,
      PENDING_PAYMENT: 0,
      CONFIRMED: 0,
      CANCELLED: 0,
      REFUNDED: 0,
    }
    for (const item of bookings) base[item.status] += 1
    return base
  }, [bookings])

  const countLabel =
    visible.length === 0
      ? 'Aucune séance'
      : visible.length === 1
        ? '1 séance'
        : `${visible.length} séances`

  return (
    <div className="animate-fade-up">
      <StudentPageHeader
        title="Séances"
        description="Vos inscriptions en présentiel. Prix en XOF entiers — le statut « payé » n’apparaît qu’après confirmation serveur."
        actions={
          <Link
            to={STUDENT_PATHS.demandesNouvelle}
            className="btn btn-primary h-11 w-full gap-2 px-4 sm:w-auto"
          >
            <Plus className="size-4" aria-hidden />
            Nouvelle demande
          </Link>
        }
      />

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les séances">
        {FILTERS.map(({ key, label }) => {
          const active = filter === key
          const n = counts[key]
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(key)}
              className={[
                'border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-content'
                  : 'border-border-light bg-surface text-body/70 hover:border-primary/40 hover:bg-soft-blue/40',
              ].join(' ')}
            >
              {label}
              <span className={active ? 'ml-1.5 opacity-90' : 'ml-1.5 text-body/45'}>{n}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border border-border-light bg-page px-4 py-2.5">
        <p className="text-sm font-medium text-heading">{countLabel}</p>
        <p className="text-xs text-body/50">Tri : actions en attente d’abord</p>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-4">
          <AppEmptyPanel
            icon={CalendarDays}
            title="Aucune séance inscrite"
            description="Déclarez une difficulté pour recevoir une proposition de séance, ou attendez une inscription confirmée."
            actions={
              <Link to={STUDENT_PATHS.demandesNouvelle} className="btn btn-primary px-4">
                Déclarer une difficulté
              </Link>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4">
          <AppEmptyPanel
            icon={CalendarDays}
            title="Aucune séance dans ce filtre"
            description="Changez de filtre pour voir vos autres inscriptions."
            actions={
              <button
                type="button"
                className="btn btn-outline btn-primary px-4"
                onClick={() => setFilter('ALL')}
              >
                Voir toutes
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {visible.map((item) => (
            <li key={item.id}>
              <StudentBookingCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
