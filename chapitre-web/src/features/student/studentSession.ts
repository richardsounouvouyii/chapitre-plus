import { notifyAuthSessionChanged } from '@/features/auth/authSessionEvents'

const STORAGE_KEY = 'chapitre.studentMock.v1'

export type StudentMockSession = {
  /** Case « J’ai un parent / tuteur » cochée à l’inscription (mock). */
  pendingGuardianLink: boolean
  firstName?: string
  lastName?: string
  email?: string
  level?: string
  city?: string
  schoolId?: string
  schoolName?: string
  /** ISO UTC — date d’inscription mock. */
  registeredAt?: string
}

const DEMO_DEFAULTS = {
  firstName: 'Amina',
  lastName: 'Houngbo',
  level: '3e',
  city: 'Cotonou',
  schoolName: 'Collège Notre-Dame de Cotonou',
  schoolId: 'cotonou-nd',
} as const

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

export function readStudentMockSession(): StudentMockSession {
  if (!canUseStorage()) {
    return { pendingGuardianLink: false }
  }
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return { pendingGuardianLink: false }
    const parsed = JSON.parse(raw) as Partial<StudentMockSession>
    return {
      pendingGuardianLink: Boolean(parsed.pendingGuardianLink),
      firstName: pickString(parsed.firstName),
      lastName: pickString(parsed.lastName),
      email: pickString(parsed.email),
      level: pickString(parsed.level),
      city: pickString(parsed.city),
      schoolId: pickString(parsed.schoolId),
      schoolName: pickString(parsed.schoolName),
      registeredAt: pickString(parsed.registeredAt),
    }
  } catch {
    return { pendingGuardianLink: false }
  }
}

export function writeStudentMockSession(patch: Partial<StudentMockSession>): StudentMockSession {
  const current = readStudentMockSession()
  const next: StudentMockSession = {
    ...current,
    ...patch,
  }
  if (canUseStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  notifyAuthSessionChanged()
  return next
}

export function clearStudentMockSession(): void {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
  // Pas de notify ici : clearDemoAuthSession / writeDemoAuthSession notifient après.
}

export function studentDisplayName(session: StudentMockSession): string {
  const full = [session.firstName, session.lastName].filter(Boolean).join(' ').trim()
  if (full) return full
  if (session.email) return session.email.split('@')[0] ?? 'Élève'
  return 'Élève'
}

/** Session mock active = e-mail présent (posé à l’inscription / connexion). */
export function isStudentAuthenticated(session?: StudentMockSession): boolean {
  const current = session ?? readStudentMockSession()
  return Boolean(current.email)
}

/**
 * Complète les champs manquants (ex. ancienne session e-mail seul)
 * sans écraser une vraie inscription.
 */
export function hydrateStudentProfile(email?: string): StudentMockSession {
  const existing = readStudentMockSession()
  const mail = pickString(email) ?? existing.email
  const patch: Partial<StudentMockSession> = {
    email: mail,
    registeredAt: existing.registeredAt ?? new Date().toISOString(),
  }
  if (!existing.firstName) patch.firstName = DEMO_DEFAULTS.firstName
  if (!existing.lastName) patch.lastName = DEMO_DEFAULTS.lastName
  if (!existing.level) patch.level = DEMO_DEFAULTS.level
  if (!existing.city) patch.city = DEMO_DEFAULTS.city
  if (!existing.schoolName) {
    patch.schoolName = DEMO_DEFAULTS.schoolName
    patch.schoolId = existing.schoolId ?? DEMO_DEFAULTS.schoolId
  }
  if (existing.pendingGuardianLink === false && !existing.firstName && !existing.lastName) {
    patch.pendingGuardianLink = true
  }
  return writeStudentMockSession(patch)
}

/** Profil démo si connexion DEV sans inscription préalable. */
export function ensureDemoStudentProfile(email: string): StudentMockSession {
  return hydrateStudentProfile(email)
}
