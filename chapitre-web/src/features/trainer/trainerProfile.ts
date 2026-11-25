import type { SupportedLevel } from '@/features/public/curriculumLevels'
import {
  normalizeTrainerLevels,
  normalizeTrainerSubjects,
  TRAINER_LEVEL_OPTIONS,
  TRAINER_SUBJECT_OPTIONS,
  type TrainerSubjectOption,
} from './trainerCompetences'
import {
  isTrainerStatus,
  TRAINER_STATUSES,
  type TrainerStatus,
} from './trainerStatus'

/**
 * Mock espace connecté formateur uniquement.
 * Ne pas fusionner avec `features/public/trainers.ts` (vitrine `/formateurs`).
 */
const STORAGE_KEY = 'chapitre.trainerMock.v1'

export type TrainerMockProfile = {
  email: string
  firstName: string
  lastName: string
  city: string
  phone?: string
  /** Présentation personnelle (bio). */
  bio?: string
  /** Classes MVP : 3e · Terminale C · Terminale D. */
  levels: SupportedLevel[]
  /** Matières MVP formateur : Mathématiques · Physique · Chimie. */
  subjects: TrainerSubjectOption[]
  status: TrainerStatus
  /** ISO UTC — soumission / dernière maj dossier mock. */
  submittedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

const DEMO_DEFAULTS = {
  firstName: 'Koffi',
  lastName: 'Mensah',
  city: 'Cotonou',
  phone: '+229 01 90 00 00 01',
  bio: 'Formateur en mathématiques, physique et chimie — séances en présentiel à Cotonou.',
  levels: [...TRAINER_LEVEL_OPTIONS] as SupportedLevel[],
  subjects: [...TRAINER_SUBJECT_OPTIONS] as TrainerSubjectOption[],
  status: TRAINER_STATUSES.PENDING_VERIFICATION,
} as const

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function pickString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function parseProfile(raw: string): TrainerMockProfile | null {
  const parsed = JSON.parse(raw) as Partial<TrainerMockProfile>
  const email = pickString(parsed.email)
  if (!email) return null
  const status = isTrainerStatus(parsed.status)
    ? parsed.status
    : TRAINER_STATUSES.PENDING_VERIFICATION
  const levels = normalizeTrainerLevels(parsed.levels)
  const subjects = normalizeTrainerSubjects(parsed.subjects)
  return {
    email,
    firstName: pickString(parsed.firstName) ?? DEMO_DEFAULTS.firstName,
    lastName: pickString(parsed.lastName) ?? DEMO_DEFAULTS.lastName,
    city: pickString(parsed.city) ?? DEMO_DEFAULTS.city,
    phone: pickString(parsed.phone),
    bio: pickString(parsed.bio),
    levels: levels.length > 0 ? levels : [...DEMO_DEFAULTS.levels],
    subjects: subjects.length > 0 ? subjects : [...DEMO_DEFAULTS.subjects],
    status,
    submittedAt: pickString(parsed.submittedAt),
    reviewedAt: pickString(parsed.reviewedAt),
    rejectionReason: pickString(parsed.rejectionReason),
  }
}

export function readTrainerMockProfile(): TrainerMockProfile | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseProfile(raw)
  } catch {
    return null
  }
}

export function writeTrainerMockProfile(
  patch: Partial<TrainerMockProfile> & { email?: string },
): TrainerMockProfile {
  const current = readTrainerMockProfile()
  const email = pickString(patch.email) ?? current?.email
  if (!email) {
    throw new Error('writeTrainerMockProfile : e-mail requis')
  }

  const levels =
    patch.levels !== undefined
      ? normalizeTrainerLevels(patch.levels)
      : (current?.levels ?? [...DEMO_DEFAULTS.levels])
  const subjects =
    patch.subjects !== undefined
      ? normalizeTrainerSubjects(patch.subjects)
      : (current?.subjects ?? [...DEMO_DEFAULTS.subjects])

  const next: TrainerMockProfile = {
    email,
    firstName: pickString(patch.firstName) ?? current?.firstName ?? DEMO_DEFAULTS.firstName,
    lastName: pickString(patch.lastName) ?? current?.lastName ?? DEMO_DEFAULTS.lastName,
    city: pickString(patch.city) ?? current?.city ?? DEMO_DEFAULTS.city,
    phone: patch.phone !== undefined ? pickString(patch.phone) : current?.phone,
    bio: patch.bio !== undefined ? pickString(patch.bio) : current?.bio,
    levels,
    subjects,
    status: isTrainerStatus(patch.status)
      ? patch.status
      : (current?.status ?? DEMO_DEFAULTS.status),
    submittedAt:
      pickString(patch.submittedAt) ??
      current?.submittedAt ??
      new Date().toISOString(),
    reviewedAt:
      patch.reviewedAt !== undefined
        ? pickString(patch.reviewedAt)
        : current?.reviewedAt,
    rejectionReason:
      patch.rejectionReason !== undefined
        ? pickString(patch.rejectionReason)
        : current?.rejectionReason,
  }
  if (canUseStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}

export function clearTrainerMockProfile(): void {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function trainerDisplayName(profile: TrainerMockProfile): string {
  const full = [profile.firstName, profile.lastName].filter(Boolean).join(' ').trim()
  if (full) return full
  return profile.email.split('@')[0] ?? 'Formateur'
}

/** Profil démo à la connexion formateur (statut PENDING + compétences MVP). */
export function ensureDemoTrainerProfile(email: string): TrainerMockProfile {
  const existing = readTrainerMockProfile()
  if (existing?.email === email.trim()) {
    // Migration douce : anciennes sessions sans levels/subjects
    if (existing.levels.length === 0 || existing.subjects.length === 0) {
      return writeTrainerMockProfile({
        levels: existing.levels.length > 0 ? existing.levels : [...DEMO_DEFAULTS.levels],
        subjects:
          existing.subjects.length > 0 ? existing.subjects : [...DEMO_DEFAULTS.subjects],
      })
    }
    return existing
  }
  return writeTrainerMockProfile({
    email,
    firstName: DEMO_DEFAULTS.firstName,
    lastName: DEMO_DEFAULTS.lastName,
    city: DEMO_DEFAULTS.city,
    phone: DEMO_DEFAULTS.phone,
    bio: DEMO_DEFAULTS.bio,
    levels: [...DEMO_DEFAULTS.levels],
    subjects: [...DEMO_DEFAULTS.subjects],
    status: DEMO_DEFAULTS.status,
    submittedAt: new Date().toISOString(),
    reviewedAt: undefined,
    rejectionReason: undefined,
  })
}

/** Helper DEV / tests : force un statut mock. */
export function setTrainerMockStatus(
  status: TrainerStatus,
  extras?: Pick<TrainerMockProfile, 'rejectionReason' | 'reviewedAt'>,
): TrainerMockProfile | null {
  const current = readTrainerMockProfile()
  if (!current) return null
  return writeTrainerMockProfile({
    status,
    reviewedAt: extras?.reviewedAt ?? new Date().toISOString(),
    rejectionReason:
      status === TRAINER_STATUSES.REJECTED
        ? extras?.rejectionReason ?? 'Dossier incomplet (mock admin).'
        : undefined,
  })
}
