import {
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  UserRound,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import { ROLES, type Role } from '@/lib/roles'

export type AppNavItem = {
  to: string
  label: string
  shortLabel?: string
  icon: LucideIcon
}

/** Site public (hors dashboard). */
export const PUBLIC_SITE_HOME = '/accueil'

/** Ferme le drawer mobile daisyUI. */
export function closeAppDrawer(): void {
  const toggle = document.getElementById('app-drawer') as HTMLInputElement | null
  if (toggle) toggle.checked = false
}

/** Chemins centralisés — ne pas hardcoder `/dashboard/...` ailleurs. */
export const STUDENT_PATHS = {
  home: '/dashboard/eleve',
  demandes: '/dashboard/eleve/demandes',
  demandesNouvelle: '/dashboard/eleve/demandes/nouvelle',
  seances: '/dashboard/eleve/seances',
  ressources: '/dashboard/eleve/ressources',
  profil: '/dashboard/eleve/profil',
} as const

export const TRAINER_PATHS = {
  home: '/dashboard/formateur',
  seances: '/dashboard/formateur/seances',
  documents: '/dashboard/formateur/documents',
  profil: '/dashboard/formateur/profil',
} as const

export const PARENT_PATHS = {
  home: '/dashboard/parent',
  enfants: '/dashboard/parent/enfants',
  paiements: '/dashboard/parent/paiements',
} as const

export const ADMIN_PATHS = {
  home: '/dashboard/admin',
  formateurs: '/dashboard/admin/formateurs',
  seances: '/dashboard/admin/seances',
} as const

/** Accueil de l’espace connecté (logo sidebar) — pas le site public. */
export const APP_HOME_BY_ROLE: Record<Role, string> = {
  STUDENT: STUDENT_PATHS.home,
  TRAINER: TRAINER_PATHS.home,
  PARENT: PARENT_PATHS.home,
  ADMIN: ADMIN_PATHS.home,
}

export const APP_NAV_BY_ROLE: Record<Role, AppNavItem[]> = {
  [ROLES.STUDENT]: [
    { to: STUDENT_PATHS.home, label: 'Accueil', icon: Home },
    { to: STUDENT_PATHS.demandes, label: 'Demandes', icon: ClipboardList },
    { to: STUDENT_PATHS.seances, label: 'Séances', icon: CalendarDays },
    { to: STUDENT_PATHS.ressources, label: 'Ressources', shortLabel: 'Docs', icon: FileText },
    { to: STUDENT_PATHS.profil, label: 'Profil', icon: UserRound },
  ],
  [ROLES.TRAINER]: [
    { to: TRAINER_PATHS.home, label: 'Tableau de bord', shortLabel: 'Accueil', icon: Home },
    { to: TRAINER_PATHS.seances, label: 'Séances', icon: CalendarDays },
    { to: TRAINER_PATHS.documents, label: 'Documents', shortLabel: 'Docs', icon: FileText },
    { to: TRAINER_PATHS.profil, label: 'Profil', icon: UserRound },
  ],
  [ROLES.PARENT]: [
    { to: PARENT_PATHS.home, label: 'Tableau de bord', shortLabel: 'Accueil', icon: Home },
    { to: PARENT_PATHS.enfants, label: 'Enfants', icon: UserRound },
    { to: PARENT_PATHS.paiements, label: 'Paiements', icon: Wallet },
  ],
  [ROLES.ADMIN]: [
    { to: ADMIN_PATHS.home, label: 'Vue d’ensemble', shortLabel: 'Accueil', icon: Home },
    { to: ADMIN_PATHS.formateurs, label: 'Formateurs', icon: UserRound },
    { to: ADMIN_PATHS.seances, label: 'Séances', icon: CalendarDays },
  ],
}

export function mobileNavItemsForRole(role: Role): AppNavItem[] {
  return APP_NAV_BY_ROLE[role]
}

export function isAppNavEnd(to: string): boolean {
  return to.split('/').length <= 3
}
