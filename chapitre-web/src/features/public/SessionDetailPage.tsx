import { ArrowLeft, BookOpen, CalendarDays, MapPin, ShieldCheck, Users } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'
import { EmptyState, useToast } from '@/components/ui'
import { MOCK_SESSIONS, type MockSession } from '@/mocks'
import { subjectsByLevel } from './curriculumLevels'
import { SubjectsByClass } from './SubjectsByClass'
import { trainerForSubject, trainerInitials, trainerProfilePath } from './trainers'

function TrainerCard({ session }: { session: MockSession }) {
  const trainer = trainerForSubject(session.subject, session.level)
  const classes = subjectsByLevel(trainer.subjects)

  return (
    <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-body/50">Formateur</h2>
        {trainer.verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
            <ShieldCheck className="size-3.5" aria-hidden />
            Vérifié
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex items-center gap-4">
        <span
          className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-content"
          aria-hidden
        >
          {trainerInitials(trainer.firstName, trainer.lastName)}
        </span>
        <div className="min-w-0">
          <p className="text-xl font-bold leading-tight text-heading">{trainer.firstName}</p>
          <p className="text-xl font-bold leading-tight text-heading">{trainer.lastName}</p>
          <p className="mt-1 text-sm text-body/70">{trainer.city}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl bg-page px-3 py-2.5 text-sm text-body/75">
        Le numéro de téléphone est communiqué après une réservation confirmée.
      </p>

      <div className="mt-5 space-y-3 border-t border-border-light pt-4 text-sm">
        <div className="rounded-xl bg-soft-blue px-3 py-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Aujourd’hui — cette séance
          </p>
          <p className="mt-1 text-base font-bold text-heading">
            {session.subject} · {session.level}
          </p>
        </div>
        <SubjectsByClass
          groups={classes}
          highlight={{ subject: session.subject, level: session.level }}
          preview
          profileId={trainer.id}
          showHint
          subjectLinks="catalog"
        />
      </div>

      <Link
        to={trainerProfilePath(trainer.id)}
        className="btn btn-outline btn-primary btn-sm mt-5 w-full"
      >
        Voir le profil formateur
      </Link>
    </article>
  )
}

export function SessionDetailPage() {
  const { sessionId } = useParams()
  const { pushToast } = useToast()
  const session = MOCK_SESSIONS.find((item) => item.id === sessionId)
  const full = session != null && session.seatsLeft <= 0

  if (!session) {
    return (
      <div className="bg-page px-4 py-12 md:px-6">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            illustration={ILLUSTRATIONS.calendrier}
            illustrationAlt="Illustration — calendrier"
            title="Séance introuvable"
            description="Cette séance n’existe pas dans les données mock actuelles."
          />
          <div className="mt-6 flex justify-center">
            <Link to="/catalogue" className="btn btn-primary btn-sm gap-2">
              <ArrowLeft className="size-4" /> Retour au catalogue
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const seatsText = full
    ? `Complet · ${session.capacity} places`
    : `${session.seatsLeft} libres / ${session.capacity}`

  const status = full
    ? { label: 'Complet', className: 'bg-error/10 text-error' }
    : session.seatsLeft <= 2
      ? { label: 'Presque complet', className: 'bg-warning/15 text-warning' }
      : { label: 'Places ouvertes', className: 'bg-success/15 text-success' }

  const reserve = () =>
    pushToast({
      tone: 'warning',
      title: 'Pas encore disponible',
      message: 'La réservation sera activée après les phases Booking et Payment.',
      durationMs: 4500,
    })

  const reserveButton: ReactNode = full ? (
    <Link to="/catalogue" className="btn btn-primary">
      Autres séances
    </Link>
  ) : (
    <button type="button" className="btn btn-primary" onClick={reserve}>
      Réserver
    </button>
  )

  const desktopActions: ReactNode = (
    <div className="flex items-center justify-between gap-4">
      <Link to="/catalogue" className="btn btn-outline btn-primary">
        Retour au catalogue
      </Link>
      {reserveButton}
    </div>
  )

  return (
    <div className="bg-page pb-4 lg:pb-8">
      <section className="border-b border-border-light bg-soft-blue/40">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-6 md:py-5">
          <Link to="/catalogue" className="btn btn-outline btn-primary btn-sm gap-2">
            <ArrowLeft className="size-4" /> Catalogue
          </Link>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {session.subject} · {session.level}
            </p>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.className}`}
            >
              {status.label}
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-heading md:text-4xl">
            {session.title}
          </h1>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-6 px-4 pt-6 pb-2 md:grid-cols-[1.35fr_1fr] md:px-6 md:py-8">
        <div className="order-1 space-y-4">
          <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-body/50">
              Infos pratiques
            </h2>

            <div className="mt-4 rounded-2xl bg-primary px-4 py-4 text-primary-content">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary-content/80">
                Tarif de cette séance
              </p>
              <p className="mt-1 text-4xl font-bold leading-none">
                {session.priceXof.toLocaleString('fr-FR')}
                <span className="ml-2 text-lg font-semibold">XOF</span>
              </p>
              <p className="mt-2 text-xs text-primary-content/80">
                Figé à la confirmation · {session.subject} · {session.level}
              </p>
            </div>

            <ul className="mt-4 space-y-3 text-sm text-body/85 md:text-base">
              <li className="flex items-start gap-3">
                <BookOpen className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-heading">Matière & niveau</p>
                  <p>
                    {session.subject} — {session.level}
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-heading">Date & horaire</p>
                  <p>{session.dateLabel}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-heading">Lieu</p>
                  <p>{session.area}</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Users className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden />
                <div>
                  <p className="font-semibold text-heading">Places</p>
                  <p>{seatsText}</p>
                </div>
              </li>
            </ul>

            <div className="mt-5 border-t border-border-light pt-4">{desktopActions}</div>
          </article>

          {full ? (
            <div className="rounded-2xl bg-error/10 px-4 py-3 text-sm text-error">
              <p className="font-semibold">Séance complète</p>
              <p className="mt-1 opacity-90">Plus de place sur cette séance.</p>
            </div>
          ) : null}
        </div>

        <aside className="order-2 md:sticky md:top-24 md:self-start">
          <TrainerCard session={session} />
        </aside>
      </div>

      <div className="fixed inset-x-0 z-40 border-t border-border-light bg-surface px-4 py-3 shadow-[0_-8px_24px_rgba(7,27,73,0.08)] lg:hidden bottom-[var(--public-mobile-nav-h,3.7rem)]">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-body/50">
              Tarif séance
            </p>
            <p className="text-2xl font-bold leading-none text-heading">
              {session.priceXof.toLocaleString('fr-FR')}{' '}
              <span className="text-sm font-semibold text-body/60">XOF</span>
            </p>
          </div>
          <div className="shrink-0">{reserveButton}</div>
        </div>
      </div>
    </div>
  )
}
