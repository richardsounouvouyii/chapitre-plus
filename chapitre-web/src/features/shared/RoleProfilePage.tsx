import { BookOpen, GraduationCap, Mail, MapPin, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SessionActionsPanel } from '@/components/layout/SessionActionsPanel'
import { TRAINER_PATHS } from '@/components/layout/app-shell/appNav'
import { StatusBadge } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { TRAINER_LEVELS_HINT } from '@/features/trainer/trainerCompetences'
import {
  readTrainerMockProfile,
  trainerDisplayName,
} from '@/features/trainer/trainerProfile'
import {
  TRAINER_STATUS_LABELS,
  trainerStatusBadgeVariant,
} from '@/features/trainer/trainerStatus'
import { ROLE_LABELS, ROLES, type Role } from '@/lib/roles'

type RoleProfilePageProps = {
  role: Role
  spaceEyebrow: string
  description: string
}

/**
 * Profil formateur / parent / admin.
 * Aucune écriture de session : la garde RequireRoleSession doit déjà être active.
 */
export function RoleProfilePage({
  role,
  spaceEyebrow,
  description,
}: RoleProfilePageProps) {
  const { session } = useAuthSession()
  const trainerProfile =
    role === ROLES.TRAINER ? readTrainerMockProfile() : null

  // La garde parent garantit session.role === role ; fallback défensif d’affichage.
  const displayName = trainerProfile
    ? trainerDisplayName(trainerProfile)
    : (session?.displayName ?? ROLE_LABELS[role])
  const email = trainerProfile?.email ?? session?.email ?? '—'
  const initials = displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          {spaceEyebrow}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-heading">Profil</h1>
          {trainerProfile ? (
            <StatusBadge
              label={TRAINER_STATUS_LABELS[trainerProfile.status]}
              variant={trainerStatusBadgeVariant(trainerProfile.status)}
            />
          ) : null}
        </div>
        {description.trim() ? (
          <p className="mt-2 text-sm leading-relaxed text-body/70">{description}</p>
        ) : null}
      </header>

      <section className="mt-4 border border-border-light bg-surface">
        <div className="flex flex-wrap items-center gap-4 border-b border-border-light bg-page/60 px-4 py-4 sm:px-5">
          <span className="flex size-14 shrink-0 items-center justify-center bg-primary text-lg font-bold text-primary-content">
            {initials}
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-heading">{displayName}</h2>
            <p className="mt-0.5 text-sm text-body/60">{ROLE_LABELS[role]} · compte démo</p>
          </div>
        </div>
        <dl className="grid gap-px bg-border-light sm:grid-cols-2">
          <div className="bg-surface px-4 py-4 sm:px-5">
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
              <UserRound className="size-3.5 text-primary" aria-hidden />
              Nom affiché
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-heading">{displayName}</dd>
          </div>
          <div className="bg-surface px-4 py-4 sm:px-5">
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
              <Mail className="size-3.5 text-primary" aria-hidden />
              E-mail
            </dt>
            <dd className="mt-1.5 break-words text-sm font-semibold text-heading">{email}</dd>
          </div>
          {trainerProfile ? (
            <div className="bg-surface px-4 py-4 sm:px-5">
              <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
                <MapPin className="size-3.5 text-primary" aria-hidden />
                Ville
              </dt>
              <dd className="mt-1.5 text-sm font-semibold text-heading">
                {trainerProfile.city}
              </dd>
            </div>
          ) : null}
          <div
            className={`bg-surface px-4 py-4 sm:px-5 ${trainerProfile ? '' : 'sm:col-span-2'}`}
          >
            <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
              <ShieldCheck className="size-3.5 text-primary" aria-hidden />
              {trainerProfile ? 'Vérification' : 'Modification'}
            </dt>
            <dd className="mt-1.5 text-sm font-semibold text-heading">
              {trainerProfile
                ? TRAINER_STATUS_LABELS[trainerProfile.status]
                : 'Réservée à l’administrateur (Identity)'}
            </dd>
          </div>
        </dl>
      </section>

      {trainerProfile ? (
        <section
          className="mt-4 border border-border-light bg-surface p-4 sm:p-5"
          aria-label="Classes et matières enseignées"
        >
          <div className="mb-1 flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold text-heading">Enseignement</h2>
          </div>
          <p className="mb-4 text-xs text-body/55">{TRAINER_LEVELS_HINT}</p>

          <div className="space-y-4">
            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
                <GraduationCap className="size-3.5 text-primary" aria-hidden />
                Classes
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {trainerProfile.levels.length > 0 ? (
                  trainerProfile.levels.map((level) => (
                    <StatusBadge key={level} label={level} variant="primary" size="sm" />
                  ))
                ) : (
                  <p className="text-sm text-body/60">Aucune classe renseignée.</p>
                )}
              </div>
            </div>

            <div>
              <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
                <BookOpen className="size-3.5 text-primary" aria-hidden />
                Matières
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {trainerProfile.subjects.length > 0 ? (
                  trainerProfile.subjects.map((subject) => (
                    <StatusBadge key={subject} label={subject} variant="info" size="sm" />
                  ))
                ) : (
                  <p className="text-sm text-body/60">Aucune matière renseignée.</p>
                )}
              </div>
            </div>
          </div>

          <p className="mt-4">
            <Link
              to={TRAINER_PATHS.dossier}
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Modifier dans le dossier de validation
            </Link>
          </p>
        </section>
      ) : null}

      <div className="mt-4">
        <SessionActionsPanel />
      </div>
    </div>
  )
}
