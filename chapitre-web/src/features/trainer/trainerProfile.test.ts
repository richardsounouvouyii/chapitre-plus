import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTrainerMockProfile,
  ensureDemoTrainerProfile,
  readTrainerMockProfile,
  setTrainerMockStatus,
  trainerDisplayName,
  writeTrainerMockProfile,
} from './trainerProfile'
import { canPublishPaidOffers, TRAINER_STATUSES } from './trainerStatus'

describe('trainerProfile mock', () => {
  beforeEach(() => {
    clearTrainerMockProfile()
  })

  it('crée un profil démo PENDING_VERIFICATION avec classes et matières MVP', () => {
    const profile = ensureDemoTrainerProfile('formateur.demo@chapitreplus.bj')
    expect(profile.status).toBe(TRAINER_STATUSES.PENDING_VERIFICATION)
    expect(canPublishPaidOffers(profile.status)).toBe(false)
    expect(trainerDisplayName(profile)).toBe('Koffi Mensah')
    expect(profile.levels).toEqual(['3e', 'Terminale C', 'Terminale D'])
    expect(profile.subjects).toEqual(['Mathématiques', 'Physique', 'Chimie'])
    expect(readTrainerMockProfile()?.email).toBe('formateur.demo@chapitreplus.bj')
  })

  it('ne réécrit pas un profil existant pour le même e-mail', () => {
    ensureDemoTrainerProfile('f@exemple.bj')
    setTrainerMockStatus(TRAINER_STATUSES.APPROVED)
    const again = ensureDemoTrainerProfile('f@exemple.bj')
    expect(again.status).toBe(TRAINER_STATUSES.APPROVED)
    expect(canPublishPaidOffers(again.status)).toBe(true)
  })

  it('persiste ville, bio, classes et matières', () => {
    ensureDemoTrainerProfile('f@exemple.bj')
    writeTrainerMockProfile({
      city: 'Porto-Novo',
      bio: 'Bio courte pour le dossier.',
      levels: ['3e'],
      subjects: ['Mathématiques', 'Physique'],
    })
    expect(readTrainerMockProfile()).toMatchObject({
      city: 'Porto-Novo',
      bio: 'Bio courte pour le dossier.',
      levels: ['3e'],
      subjects: ['Mathématiques', 'Physique'],
    })
  })

  it('clear efface le stockage', () => {
    ensureDemoTrainerProfile('f@exemple.bj')
    clearTrainerMockProfile()
    expect(readTrainerMockProfile()).toBeNull()
  })
})
