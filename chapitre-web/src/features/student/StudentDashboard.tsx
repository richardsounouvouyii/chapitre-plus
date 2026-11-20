import {
  ArrowRight,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  MapPin,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppEmptyPanel } from '@/components/layout/AppEmptyPanel'
import { STUDENT_PATHS } from '@/components/layout/app-shell/appNav'
import { SkeletonList, StatusBadge } from '@/components/ui'
import { listStudentBookings } from '@/features/bookings/mocks'
import {
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from '@/features/bookings/types'
import { listDifficultyRequests } from '@/features/difficulties/mocks'
import {
  DIFFICULTY_STATUS_LABELS,
  type DifficultyStatus,
} from '@/features/difficulties/types'
import { canDownloadResource, listStudentResources } from '@/features/resources/mocks'
import { isSupportedLevel } from '@/features/public/curriculumLevels'
import { readStudentMockSession, studentDisplayName } from './studentSession'

const QUICK_LINKS = [
  {
    to: STUDENT_PATHS.demandes,
    label: 'Mes demandes',
    hint: 'Décrire une difficulté en texte — matière, chapitre, notion.',
    cta: 'Ouvrir',
    icon: ClipboardList,
  },
  {
    to: STUDENT_PATHS.seances,
    label: 'Mes séances',
    hint: 'Inscriptions confirmées et prochaines dates en présentiel.',
    cta: 'Voir l’agenda',
    icon: CalendarDays,
  },
  {
    to: STUDENT_PATHS.ressources,
    label: 'Ressources',
    hint: 'Supports PDF et images partagés par le formateur.',
    cta: 'Consulter',
    icon: FileText,
  },
] as const

const DELAY = ['animate-delay-1', 'animate-delay-2', 'animate-delay-3'] as const

type ActivityItem = {
  id: string
  kind: 'difficulty' | 'booking'
  title: string
  subtitle: string
  statusLabel: string
  statusVariant: 'info' | 'neutral' | 'success' | 'primary'
  at: number
  to: string
}

const DIFFICULTY_VARIANT: Record<DifficultyStatus, ActivityItem['statusVariant']> = {
  SUBMITTED: 'info',
  IN_REVIEW: 'primary',
  PROPOSED: 'primary',
  SCHEDULED: 'success',
  CLOSED: 'neutral',
  CANCELLED: 'neutral',
}

const BOOKING_VARIANT: Record<BookingStatus, ActivityItem['statusVariant']> = {
  PENDING_GUARDIAN_APPROVAL: 'info',
  PENDING_PAYMENT: 'primary',
  CONFIRMED: 'success',
  CANCELLED: 'neutral',
  REFUNDED: 'neutral',
}

function formatActivityWhen(isoMs: number): string {
  return new Date(isoMs).toLocaleDateString('fr-BJ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const session = readStudentMockSession()
  const level =
    session.level && isSupportedLevel(session.level) ? session.level : undefined
  const difficulties = listDifficultyRequests(level)
  const bookings = listStudentBookings(level)
  const resourcesAvailable = listStudentResources(level).filter((item) =>
    canDownloadResource(item),
  ).length

  const recentActivity = useMemo(() => {
    const fromDifficulties: ActivityItem[] = difficulties.map((item) => ({
      id: `diff-${item.id}`,
      kind: 'difficulty',
      title: item.subject,
      subtitle: item.chapter,
      statusLabel: DIFFICULTY_STATUS_LABELS[item.status],
      statusVariant: DIFFICULTY_VARIANT[item.status],
      at: new Date(item.createdAt).getTime(),
      to: STUDENT_PATHS.demandes,
    }))
    const fromBookings: ActivityItem[] = bookings.map((item) => ({
      id: `bk-${item.id}`,
      kind: 'booking',
      title: item.subject,
      subtitle: `${item.venueLabel} · ${item.city}`,
      statusLabel: BOOKING_STATUS_LABELS[item.status],
      statusVariant: BOOKING_VARIANT[item.status],
      at: new Date(item.startsAt).getTime(),
      to: STUDENT_PATHS.seances,
    }))
    return [...fromDifficulties, ...fromBookings]
      .sort((a, b) => b.at - a.at)
      .slice(0, 5)
  }, [bookings, difficulties])

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 420)
    return () => window.clearTimeout(timer)
  }, [])

  const helloName = session.firstName || studentDisplayName(session)
  const hasMeta = Boolean(session.level || session.city || session.schoolName)

  return (
    <div className="animate-fade-up">
      <section className="relative overflow-hidden border border-border-light bg-surface">
        <div className="pointer-events-none absolute -right-16 -top-20 size-56 bg-soft-blue/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 size-48 bg-primary/5 blur-3xl" />
        <div className="relative px-4 py-5 sm:px-5 sm:py-6 md:px-8 md:py-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 max-w-2xl">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary/75">
                <GraduationCap className="size-3.5" aria-hidden />
                Espace élève
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading md:text-3xl">
                Bonjour{helloName && helloName !== 'Élève' ? `, ${helloName}` : ''}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-body/70 md:text-[0.95rem]">
                Suivez vos demandes de renforcement, vos séances en présentiel et les documents
                autorisés — en un seul endroit.
              </p>
              {hasMeta ? (
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-body/55">
                  {session.level ? (
                    <span className="inline-flex items-center gap-1 font-semibold text-primary/80">
                      <GraduationCap className="size-3.5" aria-hidden />
                      {session.level}
                    </span>
                  ) : null}
                  {session.city ? (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden />
                      {session.city}
                    </span>
                  ) : null}
                  {session.schoolName ? <span>{session.schoolName}</span> : null}
                </p>
              ) : null}
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link
                to={STUDENT_PATHS.demandesNouvelle}
                className="btn btn-primary h-11 w-full px-4 sm:w-auto"
              >
                Déclarer une difficulté
              </Link>
              <Link
                to={STUDENT_PATHS.seances}
                className="btn btn-outline btn-primary h-11 w-full px-4 sm:w-auto"
              >
                Mes séances
              </Link>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-px border border-border-light bg-border-light sm:grid-cols-3">
            {[
              { label: 'Demandes', value: difficulties.length, to: STUDENT_PATHS.demandes },
              { label: 'Séances', value: bookings.length, to: STUDENT_PATHS.seances },
              { label: 'Ressources', value: resourcesAvailable, to: STUDENT_PATHS.ressources },
            ].map((stat) => (
              <Link
                key={stat.label}
                to={stat.to}
                className="bg-surface px-4 py-3.5 transition-colors hover:bg-soft-blue/40"
              >
                <dt className="text-xs font-medium text-body/55">{stat.label}</dt>
                <dd className="mt-1 text-2xl font-bold tabular-nums text-heading">{stat.value}</dd>
              </Link>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-6 sm:mt-8" aria-label="Raccourcis">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-heading">Parcours</h2>
          <p className="hidden text-xs text-body/50 sm:block">Actions principales</p>
        </div>
        <ul className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {QUICK_LINKS.map(({ to, label, hint, cta, icon: Icon }, index) => (
            <li key={to} className={`animate-fade-up ${DELAY[index]}`}>
              <Link
                to={to}
                className="group flex h-full flex-col border border-border-light bg-surface p-4 transition-colors hover:border-primary/40 hover:bg-soft-blue/25 sm:p-5"
              >
                <span className="flex size-10 items-center justify-center bg-soft-blue text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="mt-3 text-base font-semibold text-heading sm:mt-4">{label}</span>
                <span className="mt-1.5 flex-1 text-sm leading-relaxed text-body/65">{hint}</span>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary sm:mt-4">
                  {cta}
                  <ArrowRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 sm:mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-heading">Activité récente</h2>
          {!loading && recentActivity.length > 0 ? (
            <span className="text-xs font-medium text-body/45">
              {recentActivity.length} élément{recentActivity.length > 1 ? 's' : ''}
            </span>
          ) : null}
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : recentActivity.length === 0 ? (
          <AppEmptyPanel
            icon={ClipboardList}
            title="Rien à afficher pour l’instant"
            description="Dès qu’une demande ou une séance sera enregistrée, elle apparaîtra ici avec son statut."
            actions={
              <>
                <Link to={STUDENT_PATHS.demandesNouvelle} className="btn btn-primary px-4">
                  Nouvelle demande
                </Link>
                <Link to={STUDENT_PATHS.seances} className="btn btn-outline btn-primary px-4">
                  Mes séances
                </Link>
              </>
            }
          />
        ) : (
          <ul className="divide-y divide-border-light border border-border-light bg-surface">
            {recentActivity.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 transition-colors hover:bg-soft-blue/30 sm:px-5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-heading">{item.title}</p>
                    <p className="mt-0.5 truncate text-xs text-body/55">
                      {item.kind === 'difficulty' ? 'Demande' : 'Séance'} · {item.subtitle}
                      {' · '}
                      {formatActivityWhen(item.at)}
                    </p>
                  </div>
                  <StatusBadge
                    label={item.statusLabel}
                    variant={item.statusVariant}
                    size="sm"
                    className="shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
