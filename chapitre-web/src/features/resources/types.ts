/** Catégories cahier resource-service. */
export const RESOURCE_CATEGORIES = [
  'PREPARATION',
  'EXERCISE',
  'SUMMARY',
  'METHOD',
  'CORRECTION',
] as const

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number]

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  PREPARATION: 'Préparation',
  EXERCISE: 'Exercice',
  SUMMARY: 'Résumé',
  METHOD: 'Méthode',
  CORRECTION: 'Correction',
}

export const RESOURCE_FORMATS = ['PDF', 'JPG', 'PNG', 'WEBP'] as const
export type ResourceFormat = (typeof RESOURCE_FORMATS)[number]

export type StudentResource = {
  id: string
  title: string
  category: ResourceCategory
  format: ResourceFormat
  sizeLabel: string
  sessionLabel: string
  subject: string
  /** Classe de la séance liée — filtre profil élève. */
  level: string
  trainerName: string
  /** ISO UTC — invisible avant cette date (RG fenêtre). */
  visibleAt: string
  /** Réservation confirmée requise pour télécharger. */
  bookingConfirmed: boolean
}
