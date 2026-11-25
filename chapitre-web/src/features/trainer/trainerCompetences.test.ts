import { describe, expect, it } from 'vitest'
import {
  formatTrainerLevels,
  formatTrainerSubjects,
  normalizeTrainerLevels,
  normalizeTrainerSubjects,
  TRAINER_SUBJECT_OPTIONS,
} from './trainerCompetences'

describe('trainerCompetences', () => {
  it('ne garde que 3e / Terminale C·D', () => {
    expect(normalizeTrainerLevels(['3e', 'Terminale A', 'Terminale C'])).toEqual([
      '3e',
      'Terminale C',
    ])
  })

  it('ne garde que Maths / Physique / Chimie', () => {
    expect(
      normalizeTrainerSubjects(['Mathématiques', 'SVT', 'Physique', 'Chimie', 'Français']),
    ).toEqual([...TRAINER_SUBJECT_OPTIONS])
  })

  it('formate les libellés', () => {
    expect(formatTrainerLevels(['3e', 'Terminale D'])).toBe('3e · Terminale D')
    expect(formatTrainerSubjects(['Mathématiques', 'Chimie'])).toBe(
      'Mathématiques · Chimie',
    )
  })
})
