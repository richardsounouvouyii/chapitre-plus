import { useQuery } from '@tanstack/react-query'
import { CalendarDays, MapPin, RefreshCw, ShieldCheck, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'
import { AlertBanner, EmptyState, SkeletonCard, useToast } from '@/components/ui'
import { sessionCity, sessionInDateRange, type CatalogDateRange } from '@/mocks'
import {
  catalogTariffBadge,
  isCatalogInteractionsLocked,
  shouldShowCityFilter,
  shouldShowDateFilter,
} from './catalogLock'
import { compareLevels, isSupportedLevel } from './curriculumLevels'
import { CATALOG_SESSIONS_QUERY_KEY, fetchCatalogSessions } from './fetchCatalogSessions'
import { trainerDisplayName, trainerForSubject, trainerProfilePath } from './trainers'

const DATE_OPTIONS: { id: CatalogDateRange; label: string }[] = [
  { id: 'all', label: 'Toutes' },
  { id: 'week', label: 'Cette semaine' },
  { id: 'month', label: 'Ce mois' },
]

/** Même forme que « Créer un compte » / « Se connecter ». */
const chipClass = (active: boolean) =>
  [
    'btn btn-sm shrink-0',
    active ? 'btn-primary' : 'btn-outline btn-primary',
  ].join(' ')

/** Label fixe + pastilles en scroll horizontal sur mobile. */
const filterRowClass =
  'flex min-w-0 flex-1 gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'

function seatsLabel(seatsLeft: number): { text: string; className: string } {
  if (seatsLeft <= 0) {
    return { text: 'Complet', className: 'bg-error/10 text-error' }
  }
  if (seatsLeft <= 2) {
    return { text: 'Presque complet', className: 'bg-warning/15 text-warning' }
  }
  return { text: 'Places ouvertes', className: 'bg-success/15 text-success' }
}

export function CatalogPage() {
  const { pushToast, hasActiveToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const subject = searchParams.get('matiere') ?? 'Toutes'
  const rawLevel = searchParams.get('niveau') ?? 'Toutes'
  const level = rawLevel === 'Toutes' || isSupportedLevel(rawLevel) ? rawLevel : 'Toutes'
  const [city, setCity] = useState('Toutes')
  const [dateRange, setDateRange] = useState<CatalogDateRange>('all')

  const setCatalogFilters = (next: { subject?: string; level?: string }) => {
    const subjectValue = next.subject ?? subject
    const levelValue = next.level ?? level
    const params = new URLSearchParams(searchParams)
    if (subjectValue === 'Toutes') params.delete('matiere')
    else params.set('matiere', subjectValue)
    if (levelValue === 'Toutes' || !isSupportedLevel(levelValue)) params.delete('niveau')
    else params.set('niveau', levelValue)
    setSearchParams(params, { replace: true })
  }

  /** Refuse Terminale E / A / hors périmètre : nettoie l’URL (reste sur classes 3e · C · D). */
  useEffect(() => {
    if (rawLevel === 'Toutes' || isSupportedLevel(rawLevel)) return
    const params = new URLSearchParams(searchParams)
    params.delete('niveau')
    setSearchParams(params, { replace: true })
  }, [rawLevel, searchParams, setSearchParams])

  const { data, isPending, isFetching, isError, error, refetch } = useQuery({
    queryKey: CATALOG_SESSIONS_QUERY_KEY,
    queryFn: ({ signal }) => fetchCatalogSessions(signal),
  })

  const sessions = data?.sessions ?? []
  const source = data?.source ?? 'mock'
  const interactionsLocked = isCatalogInteractionsLocked(isFetching, hasActiveToast)
  const showSkeletons = isPending && sessions.length === 0
  const tariffBadge = catalogTariffBadge(source, sessions)

  const subjects = useMemo(
    () => ['Toutes', ...new Set(sessions.map((session) => session.subject))],
    [sessions],
  )

  const showCityFilter = shouldShowCityFilter(source, sessions.length)
  const showDateFilter = shouldShowDateFilter(source, sessions.length)
  const cities = useMemo(
    () => ['Toutes', ...new Set(sessions.map((session) => sessionCity(session.area)))],
    [sessions],
  )

  const levels = useMemo(() => {
    const pool =
      subject === 'Toutes' ? sessions : sessions.filter((session) => session.subject === subject)
    const values = new Set(
      pool.map((session) => session.level).filter((item) => isSupportedLevel(item)),
    )
    if (level !== 'Toutes' && isSupportedLevel(level)) values.add(level)
    return ['Toutes', ...[...values].sort(compareLevels)]
  }, [sessions, subject, level])

  const visibleSessions = useMemo(() => {
    return sessions
      .filter((session) => {
        if (!isSupportedLevel(session.level)) return false
        const subjectOk = subject === 'Toutes' || session.subject === subject
        const levelOk = level === 'Toutes' || session.level === level
        const cityOk = !showCityFilter || city === 'Toutes' || sessionCity(session.area) === city
        const dateOk = !showDateFilter || sessionInDateRange(session.startsAt, dateRange)
        return subjectOk && levelOk && cityOk && dateOk
      })
      .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
  }, [sessions, subject, level, city, dateRange, showCityFilter, showDateFilter])

  const reload = async () => {
    if (interactionsLocked) return
    const result = await refetch()
    if (result.isSuccess) {
      pushToast({
        tone: 'info',
        title: 'Actualisé',
        message: 'Liste des séances mise à jour (mock).',
      })
    }
  }

  return (
    <div className="bg-page" aria-busy={interactionsLocked}>
      <section className="border-b border-border-light bg-soft-blue/40">
        <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-heading md:text-3xl">
                  Catalogue des séances
                </h1>
                <span
                  className={
                    tariffBadge === 'Tarif validé'
                      ? 'badge badge-success badge-sm font-medium'
                      : 'badge badge-ghost badge-sm font-medium'
                  }
                >
                  {tariffBadge}
                </span>
              </div>
              <p className="mt-1 text-sm text-body/75">
                {showSkeletons
                  ? 'Chargement des séances…'
                  : `${visibleSessions.length} séance${visibleSessions.length > 1 ? 's' : ''} · tarif 300–1000 XOF`}
              </p>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-sm shrink-0 gap-2 disabled:opacity-50"
              onClick={() => {
                void reload()
              }}
              disabled={interactionsLocked}
            >
              <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
              Actualiser
            </button>
          </div>

          {!showSkeletons ? (
            <div className="mt-4 space-y-2">
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
                      disabled={interactionsLocked}
                      onClick={() => {
                        const levelStillValid =
                          level === 'Toutes' ||
                          item === 'Toutes' ||
                          sessions.some(
                            (session) => session.subject === item && session.level === level,
                          )
                        setCatalogFilters({
                          subject: item,
                          level: levelStillValid ? level : 'Toutes',
                        })
                      }}
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
                      disabled={interactionsLocked}
                      onClick={() => setCatalogFilters({ level: item })}
                      className={chipClass(item === level)}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              {showCityFilter ? (
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
                        disabled={interactionsLocked}
                        onClick={() => setCity(item)}
                        className={chipClass(item === city)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {showDateFilter ? (
                <div className="flex items-center gap-2">
                  <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-body/50">
                    Date
                  </span>
                  <div className={filterRowClass} role="tablist" aria-label="Filtrer par période">
                    {DATE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        role="tab"
                        aria-selected={option.id === dateRange}
                        disabled={interactionsLocked}
                        onClick={() => setDateRange(option.id)}
                        className={chipClass(option.id === dateRange)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-5 md:px-6">
        {isError ? (
          <AlertBanner tone="error" title="Impossible de charger le catalogue" className="mb-5">
            {error instanceof Error ? error.message : 'Erreur inconnue'}
          </AlertBanner>
        ) : null}

        <div
          className={[
            'grid gap-4 md:grid-cols-2 xl:grid-cols-3',
            interactionsLocked && !showSkeletons ? 'pointer-events-none opacity-55' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {showSkeletons
            ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
            : visibleSessions.length === 0
              ? (
                  <div className="md:col-span-2 xl:col-span-3">
                    <EmptyState
                      illustration={ILLUSTRATIONS.calendrier}
                      illustrationAlt="Illustration — calendrier"
                      title="Aucune séance pour ces filtres"
                      description={
                        subject === 'Toutes' && level === 'Toutes'
                          ? 'Essayez une autre matière ou actualisez la liste.'
                          : `Aucune séance publiée${subject === 'Toutes' ? '' : ` en ${subject}`}${level === 'Toutes' ? '' : ` · ${level}`}.`
                      }
                    />
                  </div>
                )
              : visibleSessions.map((session) => {
                  const seats = seatsLabel(session.seatsLeft)
                  const full = session.seatsLeft <= 0
                  const trainer = trainerForSubject(session.subject, session.level)
                  return (
                    <article
                      key={session.id}
                      className="flex flex-col rounded-2xl border border-border-light bg-surface p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                          {session.subject}
                        </p>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${seats.className}`}
                        >
                          {seats.text}
                        </span>
                      </div>
                      <h2 className="mt-2 text-lg font-bold text-heading">{session.title}</h2>
                      <p className="mt-1 text-sm text-body/70">{session.level}</p>

                      <ul className="mt-4 space-y-2 text-sm text-body/80">
                        <li className="flex items-center gap-2">
                          <MapPin className="size-4 shrink-0 text-primary" aria-hidden />
                          {session.area}
                        </li>
                        <li className="flex items-center gap-2">
                          <CalendarDays className="size-4 shrink-0 text-primary" aria-hidden />
                          {session.dateLabel}
                        </li>
                        <li className="flex items-center gap-2">
                          <Users className="size-4 shrink-0 text-primary" aria-hidden />
                          {full
                            ? `Complet · ${session.capacity} places`
                            : `${session.seatsLeft} libres / ${session.capacity}`}
                        </li>
                        <li className="flex items-center gap-2">
                          <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
                          <span>
                            <Link
                              to={trainerProfilePath(trainer.id)}
                              className="font-semibold text-heading hover:text-primary"
                            >
                              {trainerDisplayName(trainer)}
                            </Link>
                            {trainer.verified ? (
                              <span className="text-body/60"> · Vérifié</span>
                            ) : null}
                          </span>
                        </li>
                      </ul>

                      <div className="mt-5 flex items-end justify-between gap-3 border-t border-border-light pt-4">
                        <div>
                          <p className="text-xl font-bold text-heading">
                            {session.priceXof.toLocaleString('fr-FR')}{' '}
                            <span className="text-sm font-semibold text-body/60">XOF</span>
                          </p>
                          {full ? (
                            <p className="mt-0.5 text-xs font-medium text-error">Plus de place</p>
                          ) : null}
                        </div>
                        {interactionsLocked ? (
                          <span className="btn btn-primary btn-sm btn-disabled" aria-disabled="true">
                            Voir le détail
                          </span>
                        ) : (
                          <Link to={`/catalogue/${session.id}`} className="btn btn-primary btn-sm">
                            Voir le détail
                          </Link>
                        )}
                      </div>
                    </article>
                  )
                })}
        </div>
      </div>
    </div>
  )
}
