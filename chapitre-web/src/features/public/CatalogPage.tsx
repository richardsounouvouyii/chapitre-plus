import { MapPin, RefreshCw, Users } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertBanner, SkeletonCard, StatusBadge, useToast } from '@/components/ui'
import { MOCK_SESSIONS } from '@/mocks'

export function CatalogPage() {
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const timer = window.setTimeout(() => {
      // Simulation chargement API — remplacer par TanStack Query + scheduling-service.
      setLoading(false)
      pushToast({
        tone: 'success',
        title: 'Catalogue chargé',
        message: 'Séances mock prêtes à parcourir.',
        durationMs: 3200,
      })
    }, 900)
    return () => window.clearTimeout(timer)
  }, [pushToast])

  const reload = () => {
    setLoading(true)
    setError(null)
    window.setTimeout(() => {
      setLoading(false)
      pushToast({
        tone: 'info',
        title: 'Actualisé',
        message: 'Liste des séances mise à jour (mock).',
      })
    }, 700)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Catalogue des séances</h1>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-base-content/70">
            Données
            <StatusBadge label="mock" variant="warning" />
            — branchées à l’API scheduling plus tard.
          </p>
        </div>
        <button type="button" className="btn btn-outline btn-sm gap-2" onClick={reload} disabled={loading}>
          <RefreshCw className={loading ? 'size-4 animate-spin' : 'size-4'} />
          Actualiser
        </button>
      </div>

      {error ? (
        <AlertBanner
          tone="error"
          title="Impossible de charger le catalogue"
          className="mt-6"
          onClose={() => setError(null)}
        >
          {error}
        </AlertBanner>
      ) : (
        <AlertBanner tone="info" title="Mode démonstration" className="mt-6">
          Les places et tarifs affichés sont fictifs. La réservation réelle arrive avec Booking +
          Payment.
        </AlertBanner>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} />)
          : MOCK_SESSIONS.map((session) => (
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
                <Link
                  to={`/catalogue/${session.id}`}
                  className="btn btn-primary btn-sm mt-auto pt-4"
                >
                  Voir le détail
                </Link>
              </article>
            ))}
      </div>
    </div>
  )
}
