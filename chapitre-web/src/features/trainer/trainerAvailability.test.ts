import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTrainerAvailability,
  ensureDemoTrainerAvailability,
  hasActiveAvailability,
  readTrainerAvailability,
  writeTrainerAvailability,
} from './trainerAvailability'

describe('trainerAvailability', () => {
  beforeEach(() => {
    clearTrainerAvailability()
  })

  it('seed démo avec créneaux actifs', () => {
    const state = ensureDemoTrainerAvailability('f@exemple.bj')
    expect(state.slots.length).toBeGreaterThan(0)
    expect(hasActiveAvailability(state)).toBe(true)
    expect(readTrainerAvailability()?.email).toBe('f@exemple.bj')
  })

  it('remplace les créneaux à l’enregistrement', () => {
    ensureDemoTrainerAvailability('f@exemple.bj')
    writeTrainerAvailability('f@exemple.bj', [
      {
        id: '1',
        weekday: 1,
        startTime: '14:00',
        endTime: '16:00',
        isActive: true,
      },
    ])
    const state = readTrainerAvailability()
    expect(state?.slots).toHaveLength(1)
    expect(state?.slots[0]).toMatchObject({
      weekday: 1,
      startTime: '14:00',
      endTime: '16:00',
      timezone: 'Africa/Porto-Novo',
    })
  })

  it('clear efface le stockage', () => {
    ensureDemoTrainerAvailability('f@exemple.bj')
    clearTrainerAvailability()
    expect(readTrainerAvailability()).toBeNull()
  })
})
