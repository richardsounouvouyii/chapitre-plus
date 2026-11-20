import type { SupportedLevel } from '@/features/public/curriculumLevels'
import { isSupportedLevel } from '@/features/public/curriculumLevels'
import type { BookingStatus, StudentBooking } from './types'

type BookingSeed = {
  idSuffix: string
  subject: string
  chapter: string
  trainerName: string
  startsAt: string
  endsAt: string
  venueLabel: string
  city: string
  priceXof: number
  status: BookingStatus
}

/**
 * Une fiche de 3 réservations par classe (parent / paiement / confirmée)
 * pour coller au profil mono-classe de l’élève connecté.
 */
const SEEDS_BY_LEVEL: Record<SupportedLevel, BookingSeed[]> = {
  '3e': [
    {
      idSuffix: 'pending-parent',
      subject: 'Français',
      chapter: 'Analyse de texte — figures de style',
      trainerName: 'Aïcha Kpèdétin',
      startsAt: '2026-11-28T15:00:00.000Z',
      endsAt: '2026-11-28T17:00:00.000Z',
      venueLabel: 'Centre pédagogique Cadjehoun',
      city: 'Cotonou',
      priceXof: 3500,
      status: 'PENDING_GUARDIAN_APPROVAL',
    },
    {
      idSuffix: 'pending-pay',
      subject: 'Mathématiques',
      chapter: 'Équations du second degré',
      trainerName: 'Koffi Adjovi',
      startsAt: '2026-12-02T09:00:00.000Z',
      endsAt: '2026-12-02T11:00:00.000Z',
      venueLabel: 'Salle B2 — Lycée partenaire Calavi',
      city: 'Abomey-Calavi',
      priceXof: 4000,
      status: 'PENDING_PAYMENT',
    },
    {
      idSuffix: 'confirmed',
      subject: 'Physique-Chimie',
      chapter: 'Électricité — circuits simples',
      trainerName: 'Mariama Soule',
      startsAt: '2026-12-06T14:00:00.000Z',
      endsAt: '2026-12-06T16:00:00.000Z',
      venueLabel: 'Espace CHAPITRE+ — Godomey',
      city: 'Abomey-Calavi',
      priceXof: 3500,
      status: 'CONFIRMED',
    },
  ],
  'Terminale C': [
    {
      idSuffix: 'pending-parent',
      subject: 'Mathématiques',
      chapter: 'Fonctions affines',
      trainerName: 'Koffi Adjovi',
      startsAt: '2026-11-28T15:00:00.000Z',
      endsAt: '2026-11-28T17:00:00.000Z',
      venueLabel: 'Centre pédagogique Cadjehoun',
      city: 'Cotonou',
      priceXof: 5000,
      status: 'PENDING_GUARDIAN_APPROVAL',
    },
    {
      idSuffix: 'pending-pay',
      subject: 'Physique-Chimie',
      chapter: 'Mécanique — forces',
      trainerName: 'Mariama Soule',
      startsAt: '2026-12-02T09:00:00.000Z',
      endsAt: '2026-12-02T11:00:00.000Z',
      venueLabel: 'Salle B2 — Lycée partenaire Calavi',
      city: 'Abomey-Calavi',
      priceXof: 5000,
      status: 'PENDING_PAYMENT',
    },
    {
      idSuffix: 'confirmed',
      subject: 'Mathématiques',
      chapter: 'Limites et continuité',
      trainerName: 'Koffi Adjovi',
      startsAt: '2026-12-06T14:00:00.000Z',
      endsAt: '2026-12-06T16:00:00.000Z',
      venueLabel: 'Espace CHAPITRE+ — Godomey',
      city: 'Abomey-Calavi',
      priceXof: 5500,
      status: 'CONFIRMED',
    },
  ],
  'Terminale D': [
    {
      idSuffix: 'pending-parent',
      subject: 'SVT',
      chapter: 'Génétique mendélienne',
      trainerName: 'Aïcha Kpèdétin',
      startsAt: '2026-11-28T15:00:00.000Z',
      endsAt: '2026-11-28T17:00:00.000Z',
      venueLabel: 'Centre pédagogique Cadjehoun',
      city: 'Cotonou',
      priceXof: 4500,
      status: 'PENDING_GUARDIAN_APPROVAL',
    },
    {
      idSuffix: 'pending-pay',
      subject: 'Physique-Chimie',
      chapter: 'Réactions d’oxydoréduction',
      trainerName: 'Mariama Soule',
      startsAt: '2026-12-02T09:00:00.000Z',
      endsAt: '2026-12-02T11:00:00.000Z',
      venueLabel: 'Salle B2 — Lycée partenaire Calavi',
      city: 'Abomey-Calavi',
      priceXof: 4500,
      status: 'PENDING_PAYMENT',
    },
    {
      idSuffix: 'confirmed',
      subject: 'Physique-Chimie',
      chapter: 'Réactions d’oxydoréduction',
      trainerName: 'Mariama Soule',
      startsAt: '2026-12-06T14:00:00.000Z',
      endsAt: '2026-12-06T16:00:00.000Z',
      venueLabel: 'Espace CHAPITRE+ — Godomey',
      city: 'Abomey-Calavi',
      priceXof: 4500,
      status: 'CONFIRMED',
    },
  ],
}

function toBooking(level: SupportedLevel, seed: BookingSeed): StudentBooking {
  return {
    id: `bk-${level.replace(/\s+/g, '-').toLowerCase()}-${seed.idSuffix}`,
    sessionTitle: `${seed.subject} — ${seed.chapter}`,
    subject: seed.subject,
    level,
    chapter: seed.chapter,
    trainerName: seed.trainerName,
    startsAt: seed.startsAt,
    endsAt: seed.endsAt,
    venueLabel: seed.venueLabel,
    city: seed.city,
    priceXof: seed.priceXof,
    status: seed.status,
    fromDifficultyLabel: `Demande ${seed.subject} · ${level}`,
  }
}

/** Réservations mock filtrées par classe du profil élève. */
export function listStudentBookings(level?: string): StudentBooking[] {
  const resolved: SupportedLevel =
    level && isSupportedLevel(level) ? level : '3e'
  return SEEDS_BY_LEVEL[resolved].map((seed) => toBooking(resolved, seed))
}

export function formatPriceXof(amount: number): string {
  return `${amount.toLocaleString('fr-BJ')} XOF`
}
