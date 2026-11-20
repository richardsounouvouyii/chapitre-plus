import { BookOpen } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { APP_HOME_BY_ROLE } from './appNav'
import type { Role } from '@/lib/roles'

type AppSidebarBrandProps = {
  role: Role
}

/**
 * Logo de l’espace app : reste dans le dashboard (accueil rôle).
 * Si déjà sur cet accueil → actualise la vue. Ne renvoie pas vers le site public.
 */
export function AppSidebarBrand({ role }: AppSidebarBrandProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const homeTo = APP_HOME_BY_ROLE[role]

  const handleClick = () => {
    if (location.pathname === homeTo) {
      navigate(0)
      return
    }
    void navigate(homeTo)
  }

  return (
    <div className="border-b border-border-light px-5 py-5">
      <button
        type="button"
        onClick={handleClick}
        className="app-shell-focus flex w-full cursor-pointer items-center gap-2.5 text-left"
        aria-label="Actualiser l’accueil de l’espace"
      >
        <span className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-content">
          <BookOpen className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-bold tracking-tight text-heading">CHAPITRE+</span>
          <span className="block text-[11px] font-medium text-body/50">Renforcement scolaire</span>
        </span>
      </button>
    </div>
  )
}
