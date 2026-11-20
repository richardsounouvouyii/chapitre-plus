import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isStudentAuthenticated, readStudentMockSession } from './studentSession'

type RequireStudentSessionProps = {
  children: ReactNode
}

/** Bloque /dashboard/eleve/* si l’élève n’est pas connecté (mock session). */
export function RequireStudentSession({ children }: RequireStudentSessionProps) {
  const location = useLocation()
  const session = readStudentMockSession()

  if (!isStudentAuthenticated(session)) {
    return (
      <Navigate
        to="/connexion"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    )
  }

  return children
}
