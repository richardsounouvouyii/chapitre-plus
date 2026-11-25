import { BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Role } from '@/lib/roles'
import { APP_HOME_BY_ROLE } from './appNav'

type AppSidebarBrandProps = {
  role: Role
}

/** Logo de l’espace app → accueil du rôle (SPA, sans rechargement). */
export function AppSidebarBrand({ role }: AppSidebarBrandProps) {
  const homeTo = APP_HOME_BY_ROLE[role]

  return (
    <div className="border-b border-border-light px-5 py-5">
      <Link
        to={homeTo}
        className="app-shell-focus flex w-full cursor-pointer items-center gap-2.5 text-left"
        aria-label="Accueil de l’espace CHAPITRE+"
      >
        <span className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-content">
          <BookOpen className="size-5" aria-hidden />
        </span>
        <span>
          <span className="block text-sm font-bold tracking-tight text-heading">CHAPITRE+</span>
          <span className="block text-[11px] font-medium text-body/50">Renforcement scolaire</span>
        </span>
      </Link>
    </div>
  )
}
