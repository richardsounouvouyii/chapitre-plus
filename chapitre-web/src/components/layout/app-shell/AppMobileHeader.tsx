import { BookOpen, ExternalLink } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROLE_LABELS, type Role } from '@/lib/roles'
import { APP_HOME_BY_ROLE, PUBLIC_SITE_HOME } from './appNav'

type AppMobileHeaderProps = {
  role: Role
}

export function AppMobileHeader({ role }: AppMobileHeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const homeTo = APP_HOME_BY_ROLE[role]

  const handleBrandClick = () => {
    if (location.pathname === homeTo) {
      navigate(0)
      return
    }
    void navigate(homeTo)
  }

  return (
    <div className="navbar sticky top-0 z-20 border-b border-border-light bg-surface/95 px-3 backdrop-blur lg:hidden">
      <label
        htmlFor="app-drawer"
        className="btn btn-ghost btn-square app-shell-focus"
        aria-label="Ouvrir le menu"
      >
        <BookOpen className="size-5 text-primary" />
      </label>
      <button
        type="button"
        onClick={handleBrandClick}
        className="app-shell-focus ml-1 cursor-pointer font-semibold tracking-tight text-primary"
        aria-label="Actualiser l’accueil de l’espace"
      >
        CHAPITRE+
      </button>
      <div className="ml-auto flex items-center gap-1">
        <span className="hidden text-xs font-medium text-body/55 xs:inline sm:inline">
          {ROLE_LABELS[role]}
        </span>
        <button
          type="button"
          onClick={() => void navigate(PUBLIC_SITE_HOME)}
          className="app-shell-focus btn btn-ghost btn-sm h-9 gap-1.5 px-2 text-xs font-semibold text-primary"
          aria-label="Retour au site public"
        >
          <ExternalLink className="size-3.5" aria-hidden />
          Site
        </button>
      </div>
    </div>
  )
}
