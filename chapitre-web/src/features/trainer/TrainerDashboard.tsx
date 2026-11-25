import {
  Ban,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  FileText,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { TRAINER_PATHS } from '@/components/layout/app-shell/appNav'
import { StatusBadge } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { formatTrainerLevels, formatTrainerSubjects } from './trainerCompetences'
import { hasActiveAvailability, readTrainerAvailability } from './trainerAvailability'
import { readTrainerMockProfile, trainerDisplayName } from './trainerProfile'
import {
  canPublishPaidOffers,
  TRAINER_STATUS_LABELS,
  trainerStatusBadgeVariant,
  TRAINER_STATUSES,
} from './trainerStatus'

const NEXT_STEPS = [
  {
    to: TRAINER_PATHS.dossier,
    title: 'Dossier',
    text: 'Identité, bio, classes et matières.',
    icon: ShieldCheck,
  },
  {
    to: TRAINER_PATHS.disponibilites,
    title: 'Disponibilités',
    text: 'Jours et créneaux de séance.',
    icon: CalendarClock,
  },
  {
    to: TRAINER_PATHS.seances,
    title: 'Séances',
    text: 'Création après validation admin.',
    icon: CalendarDays,
  },
  {
    to: TRAINER_PATHS.documents,
    title: 'Supports',
    text: 'PDF / images pour les inscrits.',
    icon: FileText,
  },
] as const

function SummaryCard({
  label,
  value,
  hint,
  to,
  badge,
}: {
  label: string
  value: string
  hint?: string
  to?: string
  badge?: { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'neutral' }
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-body/45">{label}</p>
        {badge ? (
          <StatusBadge label={badge.label} variant={badge.variant} size="sm" className="shrink-0" />
        ) : null}
      </div>
      <p className="mt-2.5 text-sm font-semibold leading-snug text-heading">{value}</p>
      {hint ? <p className="mt-1.5 text-xs leading-relaxed text-body/55">{hint}</p> : null}
    </>
  )

  if (to) {
    return (
      <Link
        to={to}
        className="block border border-border-light bg-surface p-4 sm:p-5 transition-colors hover:border-primary/35 hover:bg-soft-blue/20"
      >
        {body}
      </Link>
    )
  }

  return <div className="border border-border-light bg-surface p-4 sm:p-5">{body}</div>
}

export function TrainerDashboard() {
  const { session } = useAuthSession()
  const profile = readTrainerMockProfile()
  const availability = readTrainerAvailability()
  const status = profile?.status ?? TRAINER_STATUSES.PENDING_VERIFICATION
  const displayName = profile
    ? trainerDisplayName(profile)
    : (session?.displayName ?? 'Formateur')
  const slotCount = availability?.slots.filter((slot) => slot.isActive).length ?? 0
  const hasDispo = hasActiveAvailability(availability)
  const offersOk = canPublishPaidOffers(status)
  const levelsLabel = profile?.levels.length
    ? formatTrainerLevels(profile.levels)
    : 'Non renseigné'
  const subjectsLabel = profile?.subjects.length
    ? formatTrainerSubjects(profile.subjects)
    : 'Non renseigné'

  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading md:text-3xl">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-body/60">
          {displayName}
          {profile?.city ? ` · ${profile.city}` : ''}
        </p>
      </header>

      <section className="mt-6" aria-label="Résumé">
        <h2 className="sr-only">Résumé du compte</h2>
        <ul className="grid grid-cols-2 gap-3">
          <li>
            <SummaryCard
              label="Statut"
              value={TRAINER_STATUS_LABELS[status]}
              hint={
                status === TRAINER_STATUSES.REJECTED && profile?.rejectionReason
                  ? `Motif : ${profile.rejectionReason}`
                  : status === TRAINER_STATUSES.PENDING_VERIFICATION
                    ? 'Dossier en examen par l’admin.'
                    : status === TRAINER_STATUSES.APPROVED
                      ? 'Compte vérifié.'
                      : undefined
              }
              to={TRAINER_PATHS.dossier}
              badge={{
                label:
                  status === TRAINER_STATUSES.APPROVED
                    ? 'OK'
                    : status === TRAINER_STATUSES.PENDING_VERIFICATION
                      ? 'En cours'
                      : 'Attention',
                variant: trainerStatusBadgeVariant(status),
              }}
            />
          </li>
          <li>
            <SummaryCard
              label="Offres payantes"
              value={offersOk ? 'Autorisées' : 'Bloquées'}
              hint={
                offersOk
                  ? 'Séance tarifée possible.'
                  : 'Après approbation admin uniquement.'
              }
              badge={{
                label: offersOk ? 'OK' : 'Non',
                variant: offersOk ? 'success' : 'warning',
              }}
            />
          </li>
          <li>
            <SummaryCard
              label="Disponibilités"
              value={
                hasDispo
                  ? slotCount > 1
                    ? `${slotCount} créneaux`
                    : '1 créneau'
                  : 'Aucun créneau'
              }
              hint={hasDispo ? 'Prêt à planifier.' : 'Ajoutez au moins un créneau.'}
              to={TRAINER_PATHS.disponibilites}
              badge={{
                label: hasDispo ? 'OK' : 'À faire',
                variant: hasDispo ? 'success' : 'warning',
              }}
            />
          </li>
          <li>
            <SummaryCard
              label="Enseignement"
              value={subjectsLabel}
              hint={`Classes : ${levelsLabel}`}
              to={TRAINER_PATHS.dossier}
              badge={{
                label: profile?.subjects.length ? 'OK' : 'À faire',
                variant: profile?.subjects.length ? 'info' : 'warning',
              }}
            />
          </li>
        </ul>

        <p className="mt-3 flex items-center gap-2 text-xs text-body/55">
          {offersOk ? (
            <CheckCircle2 className="size-3.5 shrink-0 text-success" aria-hidden />
          ) : (
            <Ban className="size-3.5 shrink-0 text-warning" aria-hidden />
          )}
          {offersOk
            ? 'Publication payante possible.'
            : 'Publication payante impossible tant que le statut n’est pas Approuvé.'}
          <GraduationCap className="ml-auto hidden size-3.5 sm:block" aria-hidden />
        </p>
      </section>

      <section className="mt-8" aria-label="Raccourcis">
        <h2 className="mb-3 text-base font-semibold text-heading">Raccourcis</h2>
        <ul className="grid grid-cols-2 gap-3">
          {NEXT_STEPS.map(({ to, title, text, icon: Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className="flex h-full cursor-pointer flex-col border border-border-light bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-soft-blue/25"
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="mt-3 font-semibold text-heading">{title}</span>
                <span className="mt-1.5 text-sm leading-relaxed text-body/65">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
