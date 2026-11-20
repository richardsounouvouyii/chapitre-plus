/** États cahier difficulty-service — affichage mock uniquement. */
export const DIFFICULTY_STATUSES = [
  'SUBMITTED',
  'IN_REVIEW',
  'PROPOSED',
  'SCHEDULED',
  'CLOSED',
  'CANCELLED',
] as const

export type DifficultyStatus = (typeof DIFFICULTY_STATUSES)[number]

export const DIFFICULTY_STATUS_LABELS: Record<DifficultyStatus, string> = {
  SUBMITTED: 'Soumise',
  IN_REVIEW: 'Étudiée',
  PROPOSED: 'Proposition reçue',
  SCHEDULED: 'Planifiée',
  CLOSED: 'Clôturée',
  CANCELLED: 'Annulée',
}

export type DifficultyRequest = {
  id: string
  level: string
  subject: string
  chapter: string
  notion: string
  /** Préférences texte (créneaux, lieu…) — pas de fichier. */
  preferences?: string
  status: DifficultyStatus
  createdAt: string
}
