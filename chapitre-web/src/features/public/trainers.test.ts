import { describe, expect, it } from 'vitest'
import type { MockSession } from '@/mocks'
import { countPublishedSessionsForTrainer, TRAINERS } from './trainers'

const baseSession = {
  title: 'Séance',
  area: 'Cotonou — centre',
  dateLabel: 'Sam. 1 janv.',
  priceXof: 500,
  seatsLeft: 4,
  capacity: 12,
  trainer: 'Formateur vérifié',
  startsAt: '2026-11-28T09:00:00Z',
  tariffStatus: 'PROPOSED' as const,
}

describe('countPublishedSessionsForTrainer', () => {
  it('compte les séances dont matière et classe sont enseignées', () => {
    const koffi = TRAINERS.find((trainer) => trainer.id === 'koffi-adjovi')
    expect(koffi).toBeDefined()
    const sessions: MockSession[] = [
      {
        ...baseSession,
        id: 'a',
        subject: 'Mathématiques',
        level: 'Terminale C',
      },
      {
        ...baseSession,
        id: 'b',
        subject: 'Physique-Chimie',
        level: 'Terminale D',
      },
      {
        ...baseSession,
        id: 'c',
        subject: 'Anglais',
        level: '3e',
      },
    ]
    expect(countPublishedSessionsForTrainer(koffi!, sessions)).toBe(2)
  })
})
