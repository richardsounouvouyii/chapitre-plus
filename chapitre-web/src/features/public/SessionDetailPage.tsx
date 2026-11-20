import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { AlertBanner, EmptyState, StatusBadge, useToast } from '@/components/ui'
import { MOCK_SESSIONS } from '@/mocks'

export function SessionDetailPage() {
  const { sessionId } = useParams()
  const { pushToast } = useToast()
  const session = MOCK_SESSIONS.find((item) => item.id === sessionId)

  if (!session) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <EmptyState
          icon={CalendarDays}
          title="Séance introuvable"
          description="Cette séance n’existe pas dans les données mock actuelles."
        />
        <Link to="/catalogue" className="btn btn-ghost mt-6 gap-2">
          <ArrowLeft className="size-4" /> Retour au catalogue
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 md:px-8">
      <Link to="/catalogue" className="btn btn-ghost btn-sm mb-6 gap-2">
        <ArrowLeft className="size-4" /> Catalogue
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-medium text-primary">
          {session.subject} · {session.level}
        </p>
        <StatusBadge label={`${session.priceXof.toLocaleString('fr-FR')} XOF`} variant="primary" />
        <StatusBadge
          label={session.seatsLeft <= 2 ? 'Presque complet' : 'Ouvert'}
          variant={session.seatsLeft <= 2 ? 'warning' : 'success'}
        />
      </div>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">{session.title}</h1>
      <div className="mt-6 space-y-3 text-base-content/80">
        <p className="flex items-center gap-2">
          <CalendarDays className="size-4" /> {session.dateLabel}
        </p>
        <p className="flex items-center gap-2">
          <MapPin className="size-4" /> {session.area}
        </p>
        <p>{session.seatsLeft} places restantes · {session.trainer}</p>
      </div>

      <AlertBanner tone="warning" title="Réservation bientôt disponible" className="mt-8">
        La confirmation réelle dépend de Booking + Payment (webhook serveur). Ici : aperçu UI
        uniquement.
      </AlertBanner>

      <button
        type="button"
        className="btn btn-primary mt-6"
        onClick={() =>
          pushToast({
            tone: 'warning',
            title: 'Pas encore disponible',
            message: 'La réservation sera activée après les phases Booking et Payment.',
            durationMs: 4500,
          })
        }
      >
        Réserver (aperçu)
      </button>
    </div>
  )
}
