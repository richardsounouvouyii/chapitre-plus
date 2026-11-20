import type { SupportedLevel } from '@/features/public/curriculumLevels'
import { isSupportedLevel } from '@/features/public/curriculumLevels'
import type { StudentResource } from './types'

/**
 * Documents mock — une série par classe, alignée sur la séance confirmée
 * du même niveau (voir bookings/mocks).
 */
const DEMO_RESOURCES: StudentResource[] = [
  // 3e — liée à Physique-Chimie confirmée
  {
    id: 'res-3e-prep',
    title: 'Fiche de préparation — circuits simples',
    category: 'PREPARATION',
    format: 'PDF',
    sizeLabel: '380 Ko',
    sessionLabel: 'Physique-Chimie · 3e',
    subject: 'Physique-Chimie',
    level: '3e',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-11-15T08:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-3e-ex',
    title: 'Exercices guidés — électricité',
    category: 'EXERCISE',
    format: 'PDF',
    sizeLabel: '520 Ko',
    sessionLabel: 'Physique-Chimie · 3e',
    subject: 'Physique-Chimie',
    level: '3e',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-12-06T14:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-3e-method',
    title: 'Méthode — résoudre une équation',
    category: 'METHOD',
    format: 'PDF',
    sizeLabel: '310 Ko',
    sessionLabel: 'Mathématiques · 3e',
    subject: 'Mathématiques',
    level: '3e',
    trainerName: 'Koffi Adjovi',
    visibleAt: '2026-12-02T09:00:00.000Z',
    bookingConfirmed: false,
  },
  {
    id: 'res-3e-corr',
    title: 'Correction — série circuits',
    category: 'CORRECTION',
    format: 'PDF',
    sizeLabel: '640 Ko',
    sessionLabel: 'Physique-Chimie · 3e',
    subject: 'Physique-Chimie',
    level: '3e',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-12-20T18:00:00.000Z',
    bookingConfirmed: true,
  },
  // Terminale C
  {
    id: 'res-tc-prep',
    title: 'Fiche de préparation — limites',
    category: 'PREPARATION',
    format: 'PDF',
    sizeLabel: '410 Ko',
    sessionLabel: 'Mathématiques · Terminale C',
    subject: 'Mathématiques',
    level: 'Terminale C',
    trainerName: 'Koffi Adjovi',
    visibleAt: '2026-11-15T08:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-tc-ex',
    title: 'Exercices — continuité',
    category: 'EXERCISE',
    format: 'PDF',
    sizeLabel: '560 Ko',
    sessionLabel: 'Mathématiques · Terminale C',
    subject: 'Mathématiques',
    level: 'Terminale C',
    trainerName: 'Koffi Adjovi',
    visibleAt: '2026-12-06T14:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-tc-locked',
    title: 'Méthode — forces (avant confirmation)',
    category: 'METHOD',
    format: 'PDF',
    sizeLabel: '290 Ko',
    sessionLabel: 'Physique-Chimie · Terminale C',
    subject: 'Physique-Chimie',
    level: 'Terminale C',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-12-02T09:00:00.000Z',
    bookingConfirmed: false,
  },
  // Terminale D
  {
    id: 'res-td-prep',
    title: 'Fiche de préparation — réactions redox',
    category: 'PREPARATION',
    format: 'PDF',
    sizeLabel: '420 Ko',
    sessionLabel: 'Physique-Chimie · Terminale D',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-11-15T08:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-td-ex',
    title: 'Exercices guidés — oxydoréduction',
    category: 'EXERCISE',
    format: 'PDF',
    sizeLabel: '680 Ko',
    sessionLabel: 'Physique-Chimie · Terminale D',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-12-06T14:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-td-sum',
    title: 'Résumé illustré — schéma bilan',
    category: 'SUMMARY',
    format: 'PNG',
    sizeLabel: '1,2 Mo',
    sessionLabel: 'Physique-Chimie · Terminale D',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-12-06T16:00:00.000Z',
    bookingConfirmed: true,
  },
  {
    id: 'res-td-corr',
    title: 'Correction complète — série A',
    category: 'CORRECTION',
    format: 'PDF',
    sizeLabel: '890 Ko',
    sessionLabel: 'Physique-Chimie · Terminale D',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    trainerName: 'Mariama Soule',
    visibleAt: '2026-12-20T18:00:00.000Z',
    bookingConfirmed: true,
  },
]

/** Documents mock filtrés par classe du profil élève. */
export function listStudentResources(level?: string): StudentResource[] {
  if (!level || !isSupportedLevel(level)) {
    return DEMO_RESOURCES.filter((item) => item.level === '3e')
  }
  return DEMO_RESOURCES.filter((item) => item.level === (level as SupportedLevel))
}

export function isResourceVisible(resource: StudentResource, now = new Date()): boolean {
  return resource.bookingConfirmed && new Date(resource.visibleAt).getTime() <= now.getTime()
}

export function canDownloadResource(resource: StudentResource, now = new Date()): boolean {
  return isResourceVisible(resource, now)
}
