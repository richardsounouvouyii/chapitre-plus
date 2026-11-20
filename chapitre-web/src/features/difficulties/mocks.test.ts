import { afterEach, describe, expect, it } from 'vitest'
import {
  clearDifficultyRequests,
  createDifficultyRequest,
  listDifficultyRequests,
} from './mocks'
import { DIFFICULTY_STATUSES } from './types'
import { subjectsForLevel } from './subjects'

describe('difficulties mocks', () => {
  afterEach(() => {
    clearDifficultyRequests()
  })

  it('crée une demande soumise et la liste', () => {
    expect(listDifficultyRequests()).toEqual([])
    const created = createDifficultyRequest({
      level: '3e',
      subject: 'Mathématiques',
      chapter: 'Équations',
      notion: 'Je ne comprends pas le discriminant.',
    })
    expect(created.status).toBe('SUBMITTED')
    expect(listDifficultyRequests()).toHaveLength(1)
  })

  it('filtre les demandes par classe du profil', () => {
    createDifficultyRequest({
      level: '3e',
      subject: 'Mathématiques',
      chapter: 'Équations',
      notion: 'Je ne comprends pas le discriminant.',
    })
    createDifficultyRequest({
      level: 'Terminale C',
      subject: 'Mathématiques',
      chapter: 'Limites',
      notion: 'Je bloque sur la définition formelle.',
    })
    expect(listDifficultyRequests('3e')).toHaveLength(1)
    expect(listDifficultyRequests('3e')[0]?.level).toBe('3e')
    expect(listDifficultyRequests('Terminale C')).toHaveLength(1)
    expect(listDifficultyRequests()).toHaveLength(2)
  })

  it('expose les matières par classe MVP', () => {
    expect(subjectsForLevel('3e')).toContain('Mathématiques')
    expect(subjectsForLevel('Terminale C')).toContain('Physique-Chimie')
  })

  it('expose les statuts cahier', () => {
    expect(DIFFICULTY_STATUSES).toContain('SUBMITTED')
    expect(DIFFICULTY_STATUSES).toContain('SCHEDULED')
  })
})
