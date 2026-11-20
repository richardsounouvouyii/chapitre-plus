/** Données fictives front-only — à remplacer par l'API (scheduling/booking). */
export type MockSession = {
  id: string
  title: string
  subject: string
  level: string
  area: string
  dateLabel: string
  priceXof: number
  seatsLeft: number
  trainer: string
}

export const MOCK_SESSIONS: MockSession[] = [
  {
    id: 's1',
    title: 'Équations du second degré',
    subject: 'Mathématiques',
    level: 'Terminale C',
    area: 'Cotonou — Akpakpa',
    dateLabel: 'Sam. 28 nov. · 09:00–11:00',
    priceXof: 2500,
    seatsLeft: 4,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's2',
    title: 'Dissertation — introduction',
    subject: 'Français',
    level: '3e',
    area: 'Porto-Novo — centre',
    dateLabel: 'Dim. 29 nov. · 15:00–17:00',
    priceXof: 2000,
    seatsLeft: 2,
    trainer: 'Formateur vérifié',
  },
  {
    id: 's3',
    title: 'Optique géométrique',
    subject: 'Physique-Chimie',
    level: 'Terminale D',
    area: 'Cotonou — Godomey',
    dateLabel: 'Mer. 2 déc. · 16:30–18:30',
    priceXof: 3000,
    seatsLeft: 6,
    trainer: 'Formateur vérifié',
  },
]
