import { afterEach, describe, expect, it } from 'vitest'
import {
  clearStudentMockSession,
  hydrateStudentProfile,
  isStudentAuthenticated,
  readStudentMockSession,
  studentDisplayName,
  writeStudentMockSession,
} from './studentSession'

describe('studentSession', () => {
  afterEach(() => {
    clearStudentMockSession()
  })

  it('lit une session vide par défaut', () => {
    expect(readStudentMockSession()).toEqual({ pendingGuardianLink: false })
  })

  it('persiste tous les champs d’inscription utiles', () => {
    writeStudentMockSession({
      pendingGuardianLink: true,
      firstName: 'Amina',
      lastName: 'Houngbo',
      email: 'eleve@exemple.bj',
      level: '3e',
      city: 'Cotonou',
      schoolId: 'cotonou-nd',
      schoolName: 'Collège demo',
    })
    expect(readStudentMockSession()).toMatchObject({
      firstName: 'Amina',
      lastName: 'Houngbo',
      email: 'eleve@exemple.bj',
      level: '3e',
      city: 'Cotonou',
      schoolName: 'Collège demo',
      pendingGuardianLink: true,
    })
    expect(studentDisplayName(readStudentMockSession())).toBe('Amina Houngbo')
  })

  it('complète une session e-mail seul (hydrate)', () => {
    writeStudentMockSession({ pendingGuardianLink: false, email: 'seul@exemple.bj' })
    const profile = hydrateStudentProfile('seul@exemple.bj')
    expect(profile.email).toBe('seul@exemple.bj')
    expect(profile.firstName).toBeTruthy()
    expect(profile.level).toBeTruthy()
    expect(profile.city).toBeTruthy()
  })

  it('détecte une session authentifiée via e-mail', () => {
    expect(isStudentAuthenticated()).toBe(false)
    writeStudentMockSession({ email: 'eleve@exemple.bj', pendingGuardianLink: false })
    expect(isStudentAuthenticated()).toBe(true)
  })
})
