import { beforeEach, describe, expect, it } from 'vitest'
import { ROLES } from '@/lib/roles'
import {
  clearDemoAuthSession,
  getActivePublicSession,
  readDemoAuthSession,
  writeDemoAuthSession,
} from './demoSession'
import { clearStudentMockSession, writeStudentMockSession } from '@/features/student/studentSession'
import {
  ensureDemoTrainerProfile,
  readTrainerMockProfile,
} from '@/features/trainer/trainerProfile'

describe('demoSession', () => {
  beforeEach(() => {
    clearDemoAuthSession()
  })

  it('écrit et lit une session formateur', () => {
    writeDemoAuthSession({ role: ROLES.TRAINER, email: 'f@exemple.bj' })
    expect(readDemoAuthSession()).toMatchObject({
      role: ROLES.TRAINER,
      email: 'f@exemple.bj',
    })
    expect(getActivePublicSession()?.homePath).toBe('/dashboard/formateur')
  })

  it('clear efface aussi la session élève', () => {
    writeStudentMockSession({ email: 'e@exemple.bj', firstName: 'Amina' })
    writeDemoAuthSession({ role: ROLES.STUDENT, email: 'e@exemple.bj' })
    clearDemoAuthSession()
    expect(readDemoAuthSession()).toBeNull()
    expect(getActivePublicSession()).toBeNull()
  })

  it('clear efface aussi le profil formateur mock', () => {
    ensureDemoTrainerProfile('f@exemple.bj')
    writeDemoAuthSession({ role: ROLES.TRAINER, email: 'f@exemple.bj' })
    expect(readTrainerMockProfile()).not.toBeNull()
    clearDemoAuthSession()
    expect(readTrainerMockProfile()).toBeNull()
  })

  it('retombe sur la session élève si pas de demoAuth', () => {
    clearStudentMockSession()
    writeStudentMockSession({
      email: 'eleve@exemple.bj',
      firstName: 'Amina',
      lastName: 'Houngbo',
      pendingGuardianLink: false,
    })
    // sans writeDemoAuthSession
    window.sessionStorage.removeItem('chapitre.demoAuth.v1')
    const active = getActivePublicSession()
    expect(active?.role).toBe(ROLES.STUDENT)
    expect(active?.displayName).toContain('Amina')
  })
})
