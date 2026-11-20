import { CalendarDays, MapPin, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'
import { EmptyState } from '@/components/ui'
import { MOCK_SESSIONS } from '@/mocks'
import { subjectsByLevel, SUPPORTED_LEVELS, SUPPORTED_LEVELS_LABEL } from './curriculumLevels'
import { SubjectsByClass } from './SubjectsByClass'
import {
  countPublishedSessionsForTrainer,
  TRAINERS,
  trainerInitials,
  trainerProfilePath,
} from './trainers'

const chipClass = (active: boolean) =>
  ['btn btn-sm shrink-0', active ? 'btn-primary' : 'btn-outline btn-primary'].join(' ')

const filterRowClass =
  'flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

export function TrainersPage() {
  const [city, setCity] = useState('Toutes')
  const [subject, setSubject] = useState('Toutes')
  const [level, setLevel] = useState('Toutes')

  const cities = useMemo(
    () => ['Toutes', ...new Set(TRAINERS.map((trainer) => trainer.city))],
    [],
  )

  const subjects = useMemo(
    () => [
      'Toutes',
      ...new Set(TRAINERS.flatMap((trainer) => trainer.subjects.map((item) => item.name))),
    ],
    [],
  )

  const levels = useMemo(() => ['Toutes', ...SUPPORTED_LEVELS], [])

  const visibleTrainers = useMemo(() => {
    return TRAINERS.filter((trainer) => {
      const cityOk = city === 'Toutes' || trainer.city === city
      const subjectOk =
        subject === 'Toutes' || trainer.subjects.some((item) => item.name === subject)
      const levelOk =
        level === 'Toutes' ||
        trainer.subjects.some(
          (item) =>
            item.levels.includes(level) && (subject === 'Toutes' || item.name === subject),
        )
      return cityOk && subjectOk && levelOk
    })
  }, [city, subject, level])

  const setSubjectFilter = (next: string) => {
    setSubject(next)
    if (level === 'Toutes') return
    const stillValid =
      next === 'Toutes' ||
      TRAINERS.some((trainer) =>
        trainer.subjects.some((item) => item.name === next && item.levels.includes(level)),
      )
    if (!stillValid) setLevel('Toutes')
  }

  return (
    <div className="bg-page">
      <section className="border-b border-border-light bg-soft-blue/40">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-heading md:text-3xl">
              Formateurs vérifiés
            </h1>
            <span className="badge badge-success badge-sm font-medium">Présentiel</span>
          </div>
          <p className="mt-1 text-sm text-body/75">
            {visibleTrainers.length} formateur{visibleTrainers.length > 1 ? 's' : ''} · matières
            par classe
          </p>
          <p className="mt-1 text-sm font-medium text-heading">{SUPPORTED_LEVELS_LABEL}</p>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-body/50">
                Ville
              </span>
              <div className={filterRowClass} role="tablist" aria-label="Filtrer par ville">
                {cities.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={item === city}
                    onClick={() => setCity(item)}
                    className={chipClass(item === city)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-body/50">
                Matière
              </span>
              <div className={filterRowClass} role="tablist" aria-label="Filtrer par matière">
                {subjects.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={item === subject}
                    onClick={() => setSubjectFilter(item)}
                    className={chipClass(item === subject)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-body/50">
                Classe
              </span>
              <div className={filterRowClass} role="tablist" aria-label="Filtrer par classe">
                {levels.map((item) => (
                  <button
                    key={item}
                    type="button"
                    role="tab"
                    aria-selected={item === level}
                    onClick={() => setLevel(item)}
                    className={chipClass(item === level)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-6 md:px-6">
        {visibleTrainers.length === 0 ? (
          <EmptyState
            illustration={ILLUSTRATIONS.livresDiplome}
            illustrationAlt="Illustration — livres et toque"
            title="Aucun formateur pour ces filtres"
            description="Essayez une autre ville, matière ou classe (3e, Terminale C ou D)."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleTrainers.map((trainer) => {
              const classes = subjectsByLevel(trainer.subjects)
              const publishedCount = countPublishedSessionsForTrainer(trainer, MOCK_SESSIONS)
              return (
                <article
                  key={trainer.id}
                  className="flex flex-col rounded-2xl border border-border-light bg-surface p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-content"
                      aria-hidden
                    >
                      {trainerInitials(trainer.firstName, trainer.lastName)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-bold text-heading">
                          {trainer.firstName} {trainer.lastName}
                        </h2>
                        {trainer.verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-xs font-semibold text-success">
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

                  {/* Une ligne = une classe + ses matières (pas deux listes séparées). */}
                  <div className="mt-4 border-t border-border-light pt-4">
                    <SubjectsByClass
                      groups={classes}
                      selectedLevel={level === 'Toutes' ? undefined : level}
                      profileId={trainer.id}
                      showHint
                      subjectLinks="none"
                    />
                  </div>

                  <Link
                    to={
                      level === 'Toutes'
                        ? trainerProfilePath(trainer.id)
                        : `${trainerProfilePath(trainer.id)}?niveau=${encodeURIComponent(level)}`
                    }
                    className="btn btn-primary btn-sm mt-5 w-full"
                  >
                    Voir le profil
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
