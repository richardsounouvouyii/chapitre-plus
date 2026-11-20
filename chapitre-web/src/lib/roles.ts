export const ROLES = {
  STUDENT: 'STUDENT',
  TRAINER: 'TRAINER',
  PARENT: 'PARENT',
  ADMIN: 'ADMIN',
} as const

export type Role = (typeof ROLES)[keyof typeof ROLES]

export const ROLE_LABELS: Record<Role, string> = {
  STUDENT: 'Élève',
  TRAINER: 'Formateur',
  PARENT: 'Parent / tuteur',
  ADMIN: 'Administrateur',
}
