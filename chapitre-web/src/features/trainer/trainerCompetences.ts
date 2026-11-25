import {
  isSupportedLevel,
  SUPPORTED_LEVELS,
  SUPPORTED_LEVELS_LABEL,
  type SupportedLevel,
} from '@/features/public/curriculumLevels'

/**
 * Périmètre compétences formateur (MVP mock).
 * Distinct du catalogue public complet (SVT, Français…) et de `TRAINERS` vitrine.
 * Physique et Chimie sont séparées ici à la demande produit ; le catalog-service
 * expose encore « Physique-Chimie » — mapping API plus tard.
 */
export const TRAINER_SUBJECT_OPTIONS = [
  'Mathématiques',
  'Physique',
  'Chimie',
] as const

export type TrainerSubjectOption = (typeof TRAINER_SUBJECT_OPTIONS)[number]

export const TRAINER_LEVEL_OPTIONS = SUPPORTED_LEVELS

export const TRAINER_LEVELS_HINT = SUPPORTED_LEVELS_LABEL

export function isTrainerSubject(value: string): value is TrainerSubjectOption {
  return (TRAINER_SUBJECT_OPTIONS as readonly string[]).includes(value)
}

export function normalizeTrainerLevels(values: unknown): SupportedLevel[] {
  if (!Array.isArray(values)) return []
  const next = values.filter((item): item is SupportedLevel => isSupportedLevel(String(item)))
  return TRAINER_LEVEL_OPTIONS.filter((level) => next.includes(level))
}

export function normalizeTrainerSubjects(values: unknown): TrainerSubjectOption[] {
  if (!Array.isArray(values)) return []
  const next = values.filter((item): item is TrainerSubjectOption =>
    isTrainerSubject(String(item)),
  )
  return TRAINER_SUBJECT_OPTIONS.filter((subject) => next.includes(subject))
}

export function formatTrainerLevels(levels: SupportedLevel[]): string {
  if (levels.length === 0) return 'Aucune classe sélectionnée'
  return levels.join(' · ')
}

export function formatTrainerSubjects(subjects: TrainerSubjectOption[]): string {
  if (subjects.length === 0) return 'Aucune matière sélectionnée'
  return subjects.join(' · ')
}
