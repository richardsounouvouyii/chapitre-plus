import { useId } from 'react'
import { ExternalLink, LogOut, Users } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { ROLE_LABELS, type Role } from '@/lib/roles'
import { closeAppDrawer, PUBLIC_SITE_HOME } from './appNav'

type AppSidebarFooterProps = {
  role: Role
}

export function AppSidebarFooter({ role }: AppSidebarFooterProps) {
  const navigate = useNavigate()
  const { session, clearSession } = useAuthSession()
  const logoutHintId = useId()

  const title =
    session?.role === role ? session.displayName : ROLE_LABELS[role]
  const roleLabel = session?.role === role ? session.roleLabel : ROLE_LABELS[role]
  const email = session?.role === role ? session.email : null
  const accountLine = email ? `${email} · ${roleLabel}` : roleLabel

  const goToPublicSite = () => {
    closeAppDrawer()
    void navigate(PUBLIC_SITE_HOME)
  }

  const handleLogout = () => {
    clearSession()
    closeAppDrawer()
    void navigate(PUBLIC_SITE_HOME)
  }

  const handleSwitchAccount = () => {
    clearSession()
    closeAppDrawer()
    void navigate('/connexion')
  }

  return (
    <div className="mt-2 border-t border-border-light p-4">
      <div className="mb-3 bg-page px-3 py-2.5">
        <p className="truncate text-sm font-semibold text-heading">{title}</p>
        <p className="truncate text-xs text-body/55">{accountLine}</p>
      </div>

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleSwitchAccount}
          className="app-shell-focus btn btn-outline btn-primary flex h-10 w-full cursor-pointer items-center justify-center gap-2 px-3 text-sm font-semibold"
        >
          <Users className="size-4 shrink-0" aria-hidden />
          Changer de compte
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="app-shell-focus flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm font-medium text-error/90 transition-colors hover:bg-page"
          aria-describedby={logoutHintId}
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Se déconnecter
        </button>
      </div>

      <p id={logoutHintId} className="sr-only">
        Termine la session en cours (mock aujourd’hui, jeton Identity ensuite). Vous
        devrez vous reconnecter pour accéder à votre espace.
      </p>

      <p className="mt-2">
        <button
          type="button"
          onClick={goToPublicSite}
          className="app-shell-focus inline-flex items-center gap-1.5 text-sm text-body/60 underline-offset-2 transition-colors hover:text-primary hover:underline"
          title="Navigation publique sans effacer la session"
        >
          <ExternalLink className="size-3.5 shrink-0" aria-hidden />
          Voir le site (rester connecté)
        </button>
      </p>

      <Link to={PUBLIC_SITE_HOME} className="sr-only" onClick={closeAppDrawer}>
        Retour au site public
      </Link>
    </div>
  )
}
