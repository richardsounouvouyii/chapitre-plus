/** Données fictives front-only — à remplacer par l'API (scheduling/booking). */
export type MockSession = {
  id: string
  title: string
  subject: string
  level: string
  /** Ville — quartier, ex. « Cotonou — Akpakpa ». */
  area: string
  dateLabel: string
  /** Tarif XOF entier (300–1000 en démo). */
  priceXof: number
  /** Places encore libres. */
  seatsLeft: number
  /** Capacité totale de la séance. */
  capacity: number
  trainer: string
  /** Début de séance, UTC, pour le tri. */
  startsAt: string
  /** Tarif figé après approbation admin (scheduling). */
  tariffStatus: 'PROPOSED' | 'APPROVED'
}

const STARTS_AT: Record<string, string> = {
  s1: '2026-11-28T09:00:00Z',
  s2: '2026-11-29T15:00:00Z',
  s3: '2026-12-02T16:30:00Z',
  s4: '2026-12-05T08:00:00Z',
  s5: '2026-12-06T10:00:00Z',
  s6: '2026-12-07T16:00:00Z',
  s7: '2026-12-08T15:00:00Z',
  s8: '2026-12-09T14:00:00Z',
  s9: '2026-12-10T09:00:00Z',
  s10: '2026-12-11T16:00:00Z',
  s11: '2026-12-12T09:00:00Z',
  s12: '2026-12-13T15:00:00Z',
}

const SESSION_DRAFTS: Omit<MockSession, 'startsAt' | 'tariffStatus'>[] = [
  {
    id: 's1',
    title: 'Équations du second degré',
    subject: 'Mathématiques',
    level: 'Terminale C',
    area: 'Cotonou — Akpakpa',
    dateLabel: 'Sam. 28 nov. · 09:00–11:00',
    priceXof: 500,
    seatsLeft: 4,
    capacity: 12,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's2',
    title: 'Dissertation — introduction',
    subject: 'Français',
    level: '3e',
    area: 'Porto-Novo — centre',
    dateLabel: 'Dim. 29 nov. · 15:00–17:00',
    priceXof: 400,
    seatsLeft: 0,
    capacity: 10,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's3',
    title: 'Optique géométrique',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    area: 'Cotonou — Godomey',
    dateLabel: 'Mer. 2 déc. · 16:30–18:30',
    priceXof: 800,
    seatsLeft: 6,
    capacity: 12,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's4',
    title: 'Probabilités conditionnelles',
    subject: 'Mathématiques',
    level: 'Terminale C',
    area: 'Porto-Novo — Ouando',
    dateLabel: 'Sam. 5 déc. · 08:00–10:00',
    priceXof: 600,
    seatsLeft: 8,
    capacity: 14,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's5',
    title: 'Commentaire composé',
    subject: 'Français',
    level: 'Terminale C',
    area: 'Parakou — centre',
    dateLabel: 'Dim. 6 déc. · 10:00–12:00',
    priceXof: 450,
    seatsLeft: 5,
    capacity: 12,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's6',
    title: 'Acides et bases',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    area: 'Cotonou — Fidjrossè',
    dateLabel: 'Lun. 7 déc. · 16:00–18:00',
    priceXof: 1000,
    seatsLeft: 0,
    capacity: 10,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's7',
    title: 'Théorème de Thalès',
    subject: 'Mathématiques',
    level: '3e',
    area: 'Abomey-Calavi — centre',
    dateLabel: 'Mar. 8 déc. · 15:00–17:00',
    priceXof: 300,
    seatsLeft: 7,
    capacity: 16,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's8',
    title: 'Grammaire — la phrase complexe',
    subject: 'Français',
    level: '3e',
    area: 'Porto-Novo — centre',
    dateLabel: 'Mer. 9 déc. · 14:00–16:00',
    priceXof: 350,
    seatsLeft: 9,
    capacity: 12,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's9',
    title: 'Électricité — circuits',
    subject: 'Physique-Chimie',
    level: '3e',
    area: 'Bohicon — centre',
    dateLabel: 'Jeu. 10 déc. · 09:00–11:00',
    priceXof: 700,
    seatsLeft: 3,
    capacity: 10,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's10',
    title: 'Suites numériques',
    subject: 'Mathématiques',
    level: 'Terminale C',
    area: 'Cotonou — Akpakpa',
    dateLabel: 'Ven. 11 déc. · 16:00–18:00',
    priceXof: 550,
    seatsLeft: 10,
    capacity: 12,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's11',
    title: 'SVT — génétique',
    subject: 'SVT',
    level: 'Terminale D',
    area: 'Parakou — centre',
    dateLabel: 'Sam. 12 déc. · 09:00–11:00',
    priceXof: 650,
    seatsLeft: 6,
    capacity: 12,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's12',
    title: 'Anglais — compréhension',
    subject: 'Anglais',
    level: 'Terminale C',
    area: 'Porto-Novo — Ouando',
    dateLabel: 'Dim. 13 déc. · 15:00–17:00',
    priceXof: 400,
    seatsLeft: 4,
    capacity: 10,
    trainer: 'Formateur vérifié',
  },
]

/** Mocks : tarif encore « proposé ». L’API scheduling passera `APPROVED`. */
export const MOCK_SESSIONS: MockSession[] = SESSION_DRAFTS.map((session) => ({
  ...session,
  startsAt: STARTS_AT[session.id] ?? '2099-01-01T00:00:00Z',
  tariffStatus: 'PROPOSED',
}))

/** Ville extraite de « Ville — quartier ». */
export function sessionCity(area: string): string {
  const [city] = area.split('—')
  return city?.trim() || area
}

export type CatalogDateRange = 'all' | 'week' | 'month'

/** Filtre temporel (semaine / mois calendaire, fuseau local). */
export function sessionInDateRange(
  startsAt: string,
  range: CatalogDateRange,
  now = new Date(),
): boolean {
  if (range === 'all') return true
  const start = new Date(startsAt)
  if (Number.isNaN(start.getTime())) return false

  if (range === 'month') {
    return start.getFullYear() === now.getFullYear() && start.getMonth() === now.getMonth()
  }

  const day = now.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const weekStart = new Date(now)
  weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(now.getDate() + mondayOffset)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 7)
  return start >= weekStart && start < weekEnd
}
