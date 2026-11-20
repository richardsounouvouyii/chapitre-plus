import { describe, expect, it } from 'vitest'
import {
  BENIN_CITIES,
  resolveSchoolName,
  SCHOOL_OTHER_ID,
  schoolsForCity,
} from './beninLocations'

describe('beninLocations', () => {
  it('expose les villes MVP', () => {
    expect([...BENIN_CITIES]).toEqual([
      'Cotonou',
      'Abomey-Calavi',
      'Porto-Novo',
      'Parakou',
      'Bohicon',
    ])
  })

  it('filtre les établissements par ville et ajoute Autre', () => {
    const schools = schoolsForCity('Cotonou')
    expect(schools.some((school) => school.id === SCHOOL_OTHER_ID)).toBe(true)
    expect(schools.length).toBeGreaterThan(1)
  })

  it('résout le nom Autre…', () => {
    expect(resolveSchoolName('Cotonou', SCHOOL_OTHER_ID, '  Mon collège  ')).toBe('Mon collège')
    expect(resolveSchoolName('Cotonou', SCHOOL_OTHER_ID, '  ')).toBeUndefined()
  })
})
