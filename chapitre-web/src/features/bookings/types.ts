/** États cahier booking-service — affichage mock uniquement. */
export const BOOKING_STATUSES = [
  'PENDING_GUARDIAN_APPROVAL',
  'PENDING_PAYMENT',
  'CONFIRMED',
  'CANCELLED',
  'REFUNDED',
] as const

export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING_GUARDIAN_APPROVAL: 'En attente parent',
  PENDING_PAYMENT: 'En attente de paiement',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
}

export type StudentBooking = {
  id: string
  sessionTitle: string
  subject: string
  level: string
  chapter: string
  trainerName: string
  startsAt: string
  endsAt: string
  venueLabel: string
  city: string
  priceXof: number
  status: BookingStatus
  /** Lien mock vers la demande d’origine (difficulty). */
  fromDifficultyLabel?: string
}
