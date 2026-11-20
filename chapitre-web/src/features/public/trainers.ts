import type { MockSession } from '@/mocks'
import type { TaughtSubject } from './curriculumLevels'

export type TrainerPreview = {
  id: string
  firstName: string
  lastName: string
  city: string
  /** Matière de la séance mock qui pointe vers ce formateur. */
  catalogSubject: string
  subjects: TaughtSubject[]
  verified: boolean
}

/**
 * Compte les séances publiées rattachées au formateur.
 * Mock : liaison par matière catalogue. Remplacer par trainerId quand scheduling-service sera prêt.
 */
export function countPublishedSessionsForTrainer(
  trainer: TrainerPreview,
  sessions: MockSession[],
): number {
  return sessions.filter((session) => {
    const teachesSubject = trainer.subjects.some((item) => item.name === session.subject)
    const teachesLevel = trainer.subjects.some(
      (item) => item.name === session.subject && item.levels.includes(session.level),
    )
    return (
      teachesSubject &&
      teachesLevel &&
      (session.tariffStatus === 'APPROVED' || session.tariffStatus === 'PROPOSED')
    )
  }).length
}

/** Identité mock — remplacée par trainer-service (nom, photo, matières, classes). */
export const TRAINERS: TrainerPreview[] = [
  {
    id: 'koffi-adjovi',
    firstName: 'Koffi',
    lastName: 'Adjovi',
    city: 'Cotonou',
    catalogSubject: 'Mathématiques',
    verified: true,
    subjects: [
      { name: 'Mathématiques', levels: ['3e', 'Terminale C', 'Terminale D'] },
      { name: 'Physique-Chimie', levels: ['Terminale C', 'Terminale D'] },
    ],
  },
  {
    id: 'amina-soglo',
    firstName: 'Amina',
    lastName: 'Soglo',
    city: 'Porto-Novo',
    catalogSubject: 'Français',
    verified: true,
    subjects: [
      { name: 'Français', levels: ['3e', 'Terminale C'] },
    ],
  },
  {
    id: 'yves-hounkpatin',
    firstName: 'Yves',
    lastName: 'Hounkpatin',
    city: 'Cotonou',
    catalogSubject: 'Physique-Chimie',
    verified: true,
    subjects: [
      { name: 'Physique-Chimie', levels: ['3e', 'Terminale C', 'Terminale D'] },
      { name: 'Mathématiques', levels: ['Terminale C', 'Terminale D'] },
      { name: 'SVT', levels: ['Terminale D'] },
    ],
  },
  {
    id: 'nadia-gbedo',
    firstName: 'Nadia',
    lastName: 'Gbedo',
    city: 'Parakou',
    catalogSubject: 'SVT',
    verified: true,
    subjects: [
      { name: 'SVT', levels: ['3e', 'Terminale D'] },
      { name: 'Physique-Chimie', levels: ['3e'] },
    ],
  },
  {
    id: 'sarah-lawson',
    firstName: 'Sarah',
    lastName: 'Lawson',
    city: 'Porto-Novo',
    catalogSubject: 'Anglais',
    verified: true,
    subjects: [
      { name: 'Anglais', levels: ['3e', 'Terminale C'] },
      { name: 'Français', levels: ['3e'] },
    ],
  },
]

export function trainerInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function trainerProfilePath(trainerId: string) {
  return `/formateurs/${trainerId}`
}

export function trainerForSubject(subject: string, level: string): TrainerPreview {
  const byCatalog = TRAINERS.find((trainer) => trainer.catalogSubject === subject)
  if (byCatalog) return byCatalog

  const byTeaching = TRAINERS.find((trainer) =>
    trainer.subjects.some((item) => item.name === subject && item.levels.includes(level)),
  )
  if (byTeaching) return byTeaching

  return {
    id: 'formateur-chapitre',
    firstName: 'Formateur',
    lastName: 'CHAPITRE+',
    city: 'Bénin',
    catalogSubject: subject,
    verified: true,
    subjects: [{ name: subject, levels: [level] }],
  }
}

export function trainerDisplayName(trainer: Pick<TrainerPreview, 'firstName' | 'lastName'>) {
  return `${trainer.firstName} ${trainer.lastName}`
}

/** Séances mock d’un formateur pour une classe donnée (profil). */
export function sessionsForTrainerLevel(
  trainer: TrainerPreview,
  level: string,
  sessions: MockSession[],
): MockSession[] {
  return sessions
    .filter((session) => {
      if (session.level !== level) return false
      return trainer.subjects.some(
        (item) => item.name === session.subject && item.levels.includes(level),
      )
    })
    .sort((left, right) => left.startsAt.localeCompare(right.startsAt))
}
