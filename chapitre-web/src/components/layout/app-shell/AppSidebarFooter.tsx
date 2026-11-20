import { ExternalLink, LogOut } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { ROLES, type Role } from '@/lib/roles'
import {
  clearStudentMockSession,
  readStudentMockSession,
  studentDisplayName,
} from '@/features/student/studentSession'
import { closeAppDrawer, PUBLIC_SITE_HOME } from './appNav'

type AppSidebarFooterProps = {
  role: Role
}

export function AppSidebarFooter({ role }: AppSidebarFooterProps) {
  const navigate = useNavigate()
  const studentSession = role === ROLES.STUDENT ? readStudentMockSession() : null

  const goToPublicSite = () => {
    closeAppDrawer()
    void navigate(PUBLIC_SITE_HOME)
  }

  const handleLogout = () => {
    if (role === ROLES.STUDENT) clearStudentMockSession()
    closeAppDrawer()
    void navigate(PUBLIC_SITE_HOME)
  }

  return (
    <div className="mt-auto border-t border-border-light p-4">
      {studentSession?.email || studentSession?.firstName || studentSession?.level ? (
        <div className="mb-3 bg-page px-3 py-2.5">
          <p className="truncate text-sm font-semibold text-heading">
            {studentDisplayName(studentSession)}
          </p>
          <p className="truncate text-xs text-body/55">
            {[studentSession.level, studentSession.email].filter(Boolean).join(' · ') ||
              'Compte élève'}
          </p>
        </div>
      ) : null}

      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={goToPublicSite}
          className="app-shell-focus btn btn-outline btn-primary flex h-10 w-full cursor-pointer items-center justify-center gap-2 px-3 text-sm font-semibold"
        >
          <ExternalLink className="size-4 shrink-0" aria-hidden />
          Retour au site
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="app-shell-focus flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-sm font-medium text-body/70 transition-colors hover:bg-page hover:text-heading"
        >
          <LogOut className="size-4 shrink-0" aria-hidden />
          Déconnexion
        </button>
        {/* Fallback accessibilité : lien réel pour crawlers / no-JS partiel */}
        <Link to={PUBLIC_SITE_HOME} className="sr-only">
          Retour au site public
        </Link>
      </div>
    </div>
  )
}
