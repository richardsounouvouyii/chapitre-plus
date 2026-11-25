import { useId } from 'react'
import { ExternalLink, LogOut, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { PUBLIC_SITE_HOME } from './app-shell/appNav'

/** Actions profil : compte / déconnexion en primaire ; site public en lien discret. */
export function SessionActionsPanel() {
  const navigate = useNavigate()
  const { session, clearSession } = useAuthSession()
  const logoutHintId = useId()
  const accountHintId = useId()

  const handleLogout = () => {
    clearSession()
    void navigate(PUBLIC_SITE_HOME, { replace: true })
  }

  const handleSwitchAccount = () => {
    clearSession()
    void navigate('/connexion', { replace: true })
  }

  const accountLine = session
    ? `${session.email} · ${session.roleLabel}`
    : null

  return (
    <section className="border border-border-light bg-surface p-4 sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          onClick={handleSwitchAccount}
          className="btn btn-outline btn-primary h-11 gap-2 px-4"
          aria-describedby={accountLine ? accountHintId : undefined}
        >
          <Users className="size-4" aria-hidden />
          Changer de compte
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="btn btn-ghost h-11 gap-2 border border-error/25 px-4 font-semibold text-error"
          aria-describedby={logoutHintId}
        >
          <LogOut className="size-4" aria-hidden />
          Se déconnecter
        </button>
      </div>

      {accountLine ? (
        <p id={accountHintId} className="mt-3 truncate text-xs text-body/55">
          Compte actif : <span className="font-medium text-body/70">{accountLine}</span>
        </p>
      ) : null}

      <p id={logoutHintId} className="sr-only">
        Termine la session en cours (mock aujourd’hui, jeton Identity ensuite). Vous
        devrez vous reconnecter pour accéder à votre espace.
      </p>

      <p className={accountLine ? 'mt-2' : 'mt-3'}>
        <Link
          to={PUBLIC_SITE_HOME}
          className="inline-flex items-center gap-1.5 text-sm text-body/60 underline-offset-2 transition-colors hover:text-primary hover:underline"
        >
          <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          Voir le site (rester connecté)
        </Link>
      </p>
    </section>
  )
}
