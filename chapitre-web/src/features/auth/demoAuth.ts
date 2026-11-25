import type { Role } from '@/lib/roles'
import { ROLE_LABELS, ROLES } from '@/lib/roles'
import { APP_HOME_BY_ROLE } from '@/components/layout/app-shell/appNav'

/** Routes mock des espaces connectés (auth réelle = Identity). */
export const DEMO_ROLE_HOME: Record<Role, string> = { ...APP_HOME_BY_ROLE }

/** Identifiants fictifs — préremplissent le formulaire en démo (DEV only). */
export const DEMO_CREDENTIALS: Record<Role, { email: string; password: string }> = {
  STUDENT: { email: 'eleve.demo@chapitreplus.bj', password: 'demo-eleve-2026' },
  TRAINER: { email: 'formateur.demo@chapitreplus.bj', password: 'demo-formateur-2026' },
  PARENT: { email: 'parent.demo@chapitreplus.bj', password: 'demo-parent-2026' },
  ADMIN: { email: 'admin.demo@chapitreplus.bj', password: 'demo-admin-2026' },
}

export const DEMO_ROLE_ENTRIES: { role: Role; hint: string }[] = [
  { role: ROLES.STUDENT, hint: 'Demandes, séances, ressources' },
  { role: ROLES.TRAINER, hint: 'Dossier, statut, séances, documents' },
  { role: ROLES.PARENT, hint: 'Enfants, autorisations, paiements' },
  { role: ROLES.ADMIN, hint: 'Validation, tarifs, audit' },
]

export function demoRoleLabel(role: Role) {
  return ROLE_LABELS[role]
}
