import type { BadgeVariant } from '@/components/ui'

/** Aligné sur trainer-service (`TrainerStatus`). */
export const TRAINER_STATUSES = {
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  SUSPENDED: 'SUSPENDED',
} as const

export type TrainerStatus = (typeof TRAINER_STATUSES)[keyof typeof TRAINER_STATUSES]

export const TRAINER_STATUS_LABELS: Record<TrainerStatus, string> = {
  PENDING_VERIFICATION: 'En attente de vérification',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  SUSPENDED: 'Suspendu',
}

export function isTrainerStatus(value: unknown): value is TrainerStatus {
  return (
    typeof value === 'string' &&
    (Object.values(TRAINER_STATUSES) as string[]).includes(value)
  )
}

/** Offre payante / publication : uniquement APPROVED (RG cahier). */
export function canPublishPaidOffers(status: TrainerStatus): boolean {
  return status === TRAINER_STATUSES.APPROVED
}

export function trainerStatusBadgeVariant(status: TrainerStatus): BadgeVariant {
  switch (status) {
    case TRAINER_STATUSES.APPROVED:
      return 'success'
    case TRAINER_STATUSES.PENDING_VERIFICATION:
      return 'warning'
    case TRAINER_STATUSES.REJECTED:
    case TRAINER_STATUSES.SUSPENDED:
      return 'error'
    default:
      return 'neutral'
  }
}

export function trainerStatusAlertTone(
  status: TrainerStatus,
): 'info' | 'success' | 'warning' | 'error' {
  switch (status) {
    case TRAINER_STATUSES.APPROVED:
      return 'success'
    case TRAINER_STATUSES.PENDING_VERIFICATION:
      return 'warning'
    case TRAINER_STATUSES.REJECTED:
    case TRAINER_STATUSES.SUSPENDED:
      return 'error'
    default:
      return 'info'
  }
}

export function trainerStatusMessage(status: TrainerStatus): string {
  switch (status) {
    case TRAINER_STATUSES.APPROVED:
      return 'Votre dossier est approuvé. Vous pouvez préparer des séances et des supports (publication payante autorisée).'
    case TRAINER_STATUSES.PENDING_VERIFICATION:
      return 'Dossier en cours d’examen. Un formateur non validé ne peut pas publier d’offre payante.'
    case TRAINER_STATUSES.REJECTED:
      return 'Dossier rejeté. Complétez ou corrigez les informations puis attendez une nouvelle décision admin.'
    case TRAINER_STATUSES.SUSPENDED:
      return 'Compte suspendu. Les nouvelles offres payantes sont bloquées jusqu’à décision admin.'
    default:
      return ''
  }
}
