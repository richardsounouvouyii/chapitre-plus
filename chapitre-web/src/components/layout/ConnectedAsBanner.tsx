import { Link, useNavigate } from 'react-router-dom'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'

/**
 * Bandeau léger site public.
 * CTA Mon espace / Se déconnecter : mobile seulement (desktop → header).
 */
export function ConnectedAsBanner() {
  const navigate = useNavigate()
  const { session, clearSession } = useAuthSession()
  if (!session) return null

  return (
    <div className="border-b border-primary/15 bg-soft-blue/80 text-sm text-heading">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 md:px-6">
        <p className="min-w-0 text-xs sm:text-sm">
          <span className="text-body/60">Connecté en tant que </span>
          <span className="font-semibold">{session.displayName}</span>
          <span className="text-body/55"> · {session.roleLabel}</span>
        </p>
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            to={session.homePath}
            className="btn btn-primary btn-xs h-8 min-h-8 px-3 font-semibold"
          >
            Mon espace
          </Link>
          <button
            type="button"
            className="btn btn-ghost btn-xs h-8 min-h-8 px-2 font-semibold text-body/70"
            onClick={() => {
              clearSession()
              void navigate('/accueil', { replace: true })
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  )
}
