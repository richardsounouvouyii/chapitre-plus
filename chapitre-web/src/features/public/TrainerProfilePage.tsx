import { ArrowLeft, CalendarDays, MapPin, ShieldCheck } from 'lucide-react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'
import { EmptyState } from '@/components/ui'
import { MOCK_SESSIONS } from '@/mocks'
import { subjectsByLevel } from './curriculumLevels'
import { SubjectsByClass } from './SubjectsByClass'
import {
  countPublishedSessionsForTrainer,
  sessionsForTrainerLevel,
  TRAINERS,
  trainerInitials,
} from './trainers'

export function TrainerProfilePage() {
  const { trainerId } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const trainer = TRAINERS.find((item) => item.id === trainerId)
  const selectedLevel = searchParams.get('niveau') ?? undefined

  if (!trainer) {
    return (
      <div className="bg-page px-4 py-12 md:px-6">
        <div className="mx-auto max-w-3xl">
          <EmptyState
            illustration={ILLUSTRATIONS.livresDiplome}
            illustrationAlt="Illustration — livres et toque"
            title="Formateur introuvable"
            description="Ce profil n’est pas dans les données d’aperçu."
          />
          <div className="mt-6 flex justify-center">
            <Link to="/formateurs" className="btn btn-primary btn-sm gap-2">
              <ArrowLeft className="size-4" /> Retour aux formateurs
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const classes = subjectsByLevel(trainer.subjects)
  const publishedCount = countPublishedSessionsForTrainer(trainer, MOCK_SESSIONS)
  const levelIsTaught =
    selectedLevel != null && classes.some((group) => group.level === selectedLevel)
  const levelSessions =
    levelIsTaught && selectedLevel
      ? sessionsForTrainerLevel(trainer, selectedLevel, MOCK_SESSIONS)
      : []

  const selectLevel = (level: string) => {
    const params = new URLSearchParams(searchParams)
    if (selectedLevel === level) params.delete('niveau')
    else params.set('niveau', level)
    setSearchParams(params, { replace: true })
  }

  const catalogueHref =
    levelIsTaught && selectedLevel
      ? `/catalogue?niveau=${encodeURIComponent(selectedLevel)}`
      : '/catalogue'

  return (
    <div className="bg-page">
      <section className="border-b border-border-light bg-soft-blue/40">
        <div className="mx-auto max-w-3xl px-4 py-4 md:px-6 md:py-5">
          <Link to="/formateurs" className="btn btn-outline btn-primary btn-sm gap-2">
            <ArrowLeft className="size-4" /> Formateurs
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <span
              className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-content"
              aria-hidden
            >
              {trainerInitials(trainer.firstName, trainer.lastName)}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-heading md:text-3xl">
                  {trainer.firstName} {trainer.lastName}
                </h1>
                {trainer.verified ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
                    <ShieldCheck className="size-3.5" aria-hidden />
                    Vérifié
                  </span>
                ) : null}
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-body/70">
                <MapPin className="size-3.5 shrink-0 text-primary" aria-hidden />
                {trainer.city}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-heading">
                <CalendarDays className="size-3.5 shrink-0 text-primary" aria-hidden />
                {publishedCount === 0
                  ? 'Aucune séance publiée'
                  : `${publishedCount} séance${publishedCount > 1 ? 's' : ''} publiée${publishedCount > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-4 px-4 py-6 md:px-6">
        <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
          <p className="text-sm text-body/75">
            Le numéro de téléphone est communiqué après une réservation confirmée.
          </p>
          <p className="mt-2 text-sm text-body/60">Choisissez une classe pour voir ses séances.</p>
          <div className="mt-5 border-t border-border-light pt-4">
            <SubjectsByClass
              groups={classes}
              selectedLevel={levelIsTaught ? selectedLevel : undefined}
              onSelectLevel={selectLevel}
              showHint
              subjectLinks="none"
            />
          </div>
        </article>

        {levelIsTaught && selectedLevel ? (
          <article className="rounded-2xl border border-border-light bg-surface p-5 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wide text-body/50">
              Séances · {selectedLevel}
            </h2>
            {levelSessions.length === 0 ? (
              <p className="mt-3 text-sm text-body/75">
                Aucune séance publiée pour {selectedLevel} pour le moment.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {levelSessions.map((session) => (
                  <li key={session.id}>
                    <Link
                      to={`/catalogue/${session.id}`}
                      className="block rounded-xl bg-page px-3 py-3 transition hover:bg-soft-blue"
                    >
                      <p className="font-semibold text-heading">{session.title}</p>
                      <p className="mt-1 text-sm text-body/75">
                        {session.subject} · {session.dateLabel}
                      </p>
                      <p className="mt-1 text-sm font-medium text-heading">
                        {session.priceXof.toLocaleString('fr-FR')} XOF
                        {session.seatsLeft <= 0 ? (
                          <span className="ml-2 text-error">· Complet</span>
                        ) : (
                          <span className="ml-2 text-body/60">
                            · {session.seatsLeft} place{session.seatsLeft > 1 ? 's' : ''}
                          </span>
                        )}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Link to={catalogueHref} className="btn btn-primary btn-sm">
            {levelIsTaught && selectedLevel
              ? `Catalogue · ${selectedLevel}`
              : 'Voir le catalogue'}
          </Link>
          <Link to="/formateurs" className="btn btn-outline btn-primary btn-sm">
            Tous les formateurs
          </Link>
        </div>
      </div>
    </div>
  )
}
