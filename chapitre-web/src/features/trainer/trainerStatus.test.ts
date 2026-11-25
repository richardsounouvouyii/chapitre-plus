import { describe, expect, it } from 'vitest'
import {
  canPublishPaidOffers,
  isTrainerStatus,
  TRAINER_STATUSES,
  trainerStatusBadgeVariant,
} from './trainerStatus'

describe('trainerStatus', () => {
  it('n’autorise la publication payante qu’en APPROVED', () => {
    expect(canPublishPaidOffers(TRAINER_STATUSES.APPROVED)).toBe(true)
    expect(canPublishPaidOffers(TRAINER_STATUSES.PENDING_VERIFICATION)).toBe(false)
    expect(canPublishPaidOffers(TRAINER_STATUSES.REJECTED)).toBe(false)
    expect(canPublishPaidOffers(TRAINER_STATUSES.SUSPENDED)).toBe(false)
  })

  it('valide les valeurs d’enum', () => {
    expect(isTrainerStatus('APPROVED')).toBe(true)
    expect(isTrainerStatus('UNKNOWN')).toBe(false)
    expect(trainerStatusBadgeVariant(TRAINER_STATUSES.PENDING_VERIFICATION)).toBe(
      'warning',
    )
  })
})
