import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { APP_HOME_BY_ROLE } from '@/components/layout/app-shell/appNav'
import { type Role } from '@/lib/roles'
import { useAuthSession } from './AuthSessionProvider'

type RequireRoleSessionProps = {
  role: Role
  children: ReactNode
}

/**
 * Protège /dashboard/* : session requise + rôle exact.
 * Sans session → connexion ; autre rôle → espace de ce compte (pas d’élévation).
 */
export function RequireRoleSession({ role, children }: RequireRoleSessionProps) {
  const location = useLocation()
  const { session } = useAuthSession()

  if (!session) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  if (session.role !== role) {
    return <Navigate to={APP_HOME_BY_ROLE[session.role]} replace />
  }

  return children
}
