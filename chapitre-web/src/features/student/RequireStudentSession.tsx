import type { ReactNode } from 'react'
import { RequireRoleSession } from '@/features/auth/RequireRoleSession'
import { ROLES } from '@/lib/roles'

type RequireStudentSessionProps = {
  children: ReactNode
}

/** Alias : protège /dashboard/eleve/* via la garde multi-rôles. */
export function RequireStudentSession({ children }: RequireStudentSessionProps) {
  return <RequireRoleSession role={ROLES.STUDENT}>{children}</RequireRoleSession>
}
