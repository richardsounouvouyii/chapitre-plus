import {
  GraduationCap,
  KeyRound,
  Mail,
  MapPin,
  School,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppEmptyPanel } from '@/components/layout/AppEmptyPanel'
import { SessionActionsPanel } from '@/components/layout/SessionActionsPanel'
import { StatusBadge } from '@/components/ui'
import {
  hydrateStudentProfile,
  readStudentMockSession,
  studentDisplayName,
  type StudentMockSession,
} from './studentSession'
import { StudentPageHeader } from './StudentPageHeader'

function formatRegisteredAt(iso?: string): string | undefined {
  if (!iso) return undefined
  return new Date(iso).toLocaleDateString('fr-BJ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function ProfileField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail
  label: string
  value: string
}) {
  return (
    <div className="bg-surface px-4 py-4 sm:px-5">
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-body/45">
        <Icon className="size-3.5 text-primary" aria-hidden />
        {label}
      </dt>
      <dd className="mt-1.5 break-words text-sm font-semibold text-heading">{value}</dd>
    </div>
  )
}

function hasIdentity(session: StudentMockSession): boolean {
  return Boolean(
    session.email ||
      session.firstName ||
      session.lastName ||
      session.level ||
      session.city ||
      session.schoolName,
  )
}

export function StudentProfilePage() {
  const [session, setSession] = useState(() => readStudentMockSession())

  useEffect(() => {
    setSession(hydrateStudentProfile(readStudentMockSession().email))
  }, [])

  const profileReady = hasIdentity(session)
  const displayName = studentDisplayName(session)
  const registeredLabel = formatRegisteredAt(session.registeredAt)
  const initials =
    `${session.firstName?.[0] ?? displayName[0] ?? 'É'}${session.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div className="animate-fade-up">
      <StudentPageHeader
        title="Profil"
        description="Informations de votre compte (lecture seule). Seul un administrateur peut les modifier."
      />

      {profileReady ? (
        <div className="mt-6 space-y-4">
          <section className="border border-border-light bg-surface">
            <div className="flex flex-wrap items-center gap-4 border-b border-border-light bg-page/60 px-4 py-4 sm:px-5">
              <span className="flex size-14 shrink-0 items-center justify-center bg-primary text-lg font-bold text-primary-content">
                {initials}
              </span>
              <div className="min-w-0">
                <h2 className="text-xl font-bold text-heading">{displayName}</h2>
                <p className="mt-0.5 text-sm text-body/60">Compte élève CHAPITRE+</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {session.level ? (
                    <StatusBadge label={session.level} variant="primary" size="sm" />
                  ) : null}
                  <StatusBadge
                    label={
                      session.pendingGuardianLink
                        ? 'Parent / tuteur déclaré'
                        : 'Sans parent déclaré'
                    }
                    variant={session.pendingGuardianLink ? 'info' : 'neutral'}
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <div className="px-4 py-3 sm:px-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-body/45">
                Identité
              </h3>
            </div>
            <dl className="grid gap-px border-t border-border-light bg-border-light sm:grid-cols-2">
              <ProfileField
                icon={UserRound}
                label="Prénom"
                value={session.firstName ?? '—'}
              />
              <ProfileField icon={UserRound} label="Nom" value={session.lastName ?? '—'} />
              <ProfileField icon={Mail} label="E-mail" value={session.email ?? '—'} />
              <ProfileField
                icon={ShieldCheck}
                label="Inscrit le"
                value={registeredLabel ?? '—'}
              />
            </dl>

            <div className="border-t border-border-light px-4 py-3 sm:px-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-body/45">
                Scolarité & lieu
              </h3>
            </div>
            <dl className="grid gap-px border-t border-border-light bg-border-light sm:grid-cols-2">
              <ProfileField
                icon={GraduationCap}
                label="Classe"
                value={session.level ?? '—'}
              />
              <ProfileField icon={MapPin} label="Ville" value={session.city ?? '—'} />
              <ProfileField
                icon={School}
                label="Établissement"
                value={session.schoolName ?? 'Non renseigné (facultatif)'}
              />
              <ProfileField
                icon={Users}
                label="Parent / tuteur"
                value={
                  session.pendingGuardianLink
                    ? 'Oui — lien Identity à venir'
                    : 'Non déclaré à l’inscription'
                }
              />
            </dl>

            <div className="border-t border-border-light px-4 py-3 sm:px-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-body/45">
                Sécurité
              </h3>
            </div>
            <dl className="grid gap-px border-t border-border-light bg-border-light sm:grid-cols-2">
              <ProfileField
                icon={KeyRound}
                label="Mot de passe"
                value="•••••••• (non affiché)"
              />
              <ProfileField
                icon={ShieldCheck}
                label="Modification"
                value="Réservée à l’administrateur"
              />
            </dl>
          </section>

          <SessionActionsPanel />
        </div>
      ) : (
        <div className="mt-6">
          <AppEmptyPanel
            icon={UserRound}
            title="Profil non renseigné"
            description="Inscrivez-vous puis connectez-vous pour afficher prénom, nom, e-mail, ville, classe, établissement et parent."
            actions={
              <Link to="/inscription" className="btn btn-primary px-4">
                Créer un compte élève
              </Link>
            }
          />
        </div>
      )}
    </div>
  )
}
