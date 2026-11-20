import { useQuery } from '@tanstack/react-query'
import { MapPin, RefreshCw, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AlertBanner, SkeletonCard, StatusBadge, useToast } from '@/components/ui'
import { isCatalogInteractionsLocked } from './catalogLock'
import { CATALOG_SESSIONS_QUERY_KEY, fetchCatalogSessions } from './fetchCatalogSessions'

export function CatalogPage() {
  const { pushToast, hasActiveToast } = useToast()

  const {
    data: sessions = [],
    isPending,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: CATALOG_SESSIONS_QUERY_KEY,
    queryFn: ({ signal }) => fetchCatalogSessions(signal),
  })

  const interactionsLocked = isCatalogInteractionsLocked(isFetching, hasActiveToast)
  const showSkeletons = isPending && sessions.length === 0

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
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8" aria-busy={interactionsLocked}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Catalogue des séances</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-base-content/70">
            Données
            <StatusBadge label="mock" variant="warning" />
            — branchées à l’API scheduling plus tard.
          </p>
        </div>
        <button
          type="button"
          className="btn btn-outline btn-sm gap-2"
          onClick={() => {
            void reload()
          }}
          disabled={interactionsLocked}
        >
          <RefreshCw className={isFetching ? 'size-4 animate-spin' : 'size-4'} />
          Actualiser
        </button>
      </div>

      {isError ? (
        <AlertBanner tone="error" title="Impossible de charger le catalogue" className="mt-6">
          {error instanceof Error ? error.message : 'Erreur inconnue'}
        </AlertBanner>
      ) : (
        <AlertBanner tone="info" title="Mode démonstration" className="mt-6">
          Les places et tarifs affichés sont fictifs. La réservation réelle arrive avec Booking +
          Payment.
        </AlertBanner>
      )}

      <div
        className={[
          'mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3',
          interactionsLocked && !showSkeletons ? 'pointer-events-none opacity-55' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {showSkeletons
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
          : sessions.map((session) => (
              <article
                key={session.id}
                className="flex flex-col rounded-box border border-base-300 bg-base-100 p-5"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    {session.subject} · {session.level}
                  </p>
                  <StatusBadge
                    label={session.seatsLeft <= 2 ? 'Presque complet' : 'Places ouvertes'}
                    variant={session.seatsLeft <= 2 ? 'warning' : 'success'}
                    size="xs"
                  />
                </div>
                <h2 className="mt-2 text-lg font-semibold">{session.title}</h2>
                <p className="mt-3 flex items-center gap-2 text-sm text-base-content/70">
                  <MapPin className="size-4" /> {session.area}
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-base-content/70">
                  <Users className="size-4" /> {session.seatsLeft} places · {session.trainer}
                </p>
                <p className="mt-4 text-sm">{session.dateLabel}</p>
                <p className="mt-1 text-lg font-semibold">
                  {session.priceXof.toLocaleString('fr-FR')} XOF
                </p>
                {interactionsLocked ? (
                  <span
                    className="btn btn-primary btn-sm mt-auto pt-4 btn-disabled"
                    aria-disabled="true"
                  >
                    Voir le détail
                  </span>
                ) : (
                  <Link
                    to={`/catalogue/${session.id}`}
                    className="btn btn-primary btn-sm mt-auto pt-4"
                  >
                    Voir le détail
                  </Link>
                )}
              </article>
            ))}
      </div>
    </div>
  )
}
