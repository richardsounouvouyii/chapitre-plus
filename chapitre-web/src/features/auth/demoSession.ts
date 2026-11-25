import { APP_HOME_BY_ROLE } from '@/components/layout/app-shell/appNav'
import {
  clearStudentMockSession,
  isStudentAuthenticated,
  readStudentMockSession,
  studentDisplayName,
} from '@/features/student/studentSession'
import { clearTrainerAvailability } from '@/features/trainer/trainerAvailability'
import { clearTrainerMockProfile } from '@/features/trainer/trainerProfile'
import { ROLE_LABELS, ROLES, type Role } from '@/lib/roles'
import { notifyAuthSessionChanged } from './authSessionEvents'
import { DEMO_CREDENTIALS } from './demoAuth'

const STORAGE_KEY = 'chapitre.demoAuth.v1'

export type DemoAuthSession = {
  role: Role
  email: string
  displayName: string
}

const DISPLAY_BY_ROLE: Record<Role, string> = {
  STUDENT: 'Amina Houngbo',
  TRAINER: 'Koffi Mensah',
  PARENT: 'Fatou Diallo',
  ADMIN: 'Admin CHAPITRE+',
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

export function readDemoAuthSession(): DemoAuthSession | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<DemoAuthSession>
    if (!parsed.role || !parsed.email) return null
    if (!Object.values(ROLES).includes(parsed.role as Role)) return null
    return {
      role: parsed.role as Role,
      email: parsed.email,
      displayName: parsed.displayName?.trim() || DISPLAY_BY_ROLE[parsed.role as Role],
    }
  } catch {
    return null
  }
}

export function writeDemoAuthSession(input: {
  role: Role
  email?: string
  displayName?: string
}): DemoAuthSession {
  const email = (input.email || DEMO_CREDENTIALS[input.role].email).trim()
  const session: DemoAuthSession = {
    role: input.role,
    email,
    displayName: input.displayName?.trim() || DISPLAY_BY_ROLE[input.role],
  }
  if (canUseStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }
  // Une seule session active : éviter mocks métier d’autres rôles en parallèle.
  if (input.role !== ROLES.STUDENT) {
    clearStudentMockSession()
  }
  if (input.role !== ROLES.TRAINER) {
    clearTrainerMockProfile()
    clearTrainerAvailability()
  }
  notifyAuthSessionChanged()
  return session
}

export function clearDemoAuthSession(): void {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
  clearStudentMockSession()
  clearTrainerMockProfile()
  clearTrainerAvailability()
  notifyAuthSessionChanged()
}

export type ActivePublicSession = {
  role: Role
  email: string
  displayName: string
  roleLabel: string
  homePath: string
}

/**
 * Session visible sur le site public (bandeau / header).
 * Priorité : demoAuth explicite, sinon session élève mock.
 */
export function getActivePublicSession(): ActivePublicSession | null {
  const demo = readDemoAuthSession()
  if (demo) {
    return {
      ...demo,
      roleLabel: ROLE_LABELS[demo.role],
      homePath: APP_HOME_BY_ROLE[demo.role],
    }
  }
  const student = readStudentMockSession()
  if (isStudentAuthenticated(student)) {
    return {
      role: ROLES.STUDENT,
      email: student.email ?? DEMO_CREDENTIALS.STUDENT.email,
      displayName: studentDisplayName(student),
      roleLabel: ROLE_LABELS.STUDENT,
      homePath: APP_HOME_BY_ROLE.STUDENT,
    }
  }
  return null
}
