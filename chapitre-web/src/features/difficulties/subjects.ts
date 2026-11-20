import type { SupportedLevel } from '@/features/public/curriculumLevels'

/** Matières mock par classe — remplacé par catalog-service plus tard. */
export const SUBJECTS_BY_LEVEL: Record<SupportedLevel, string[]> = {
  '3e': [
    'Mathématiques',
    'Physique-Chimie',
    'SVT',
    'Français',
    'Histoire-Géographie',
    'Anglais',
  ],
  'Terminale C': ['Mathématiques', 'Physique-Chimie', 'SVT', 'Anglais'],
  'Terminale D': ['Mathématiques', 'Physique-Chimie', 'SVT', 'Anglais'],
}

export function subjectsForLevel(level: SupportedLevel): string[] {
  return SUBJECTS_BY_LEVEL[level] ?? []
}
