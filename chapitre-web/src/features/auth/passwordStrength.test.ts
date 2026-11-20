import { describe, expect, it } from 'vitest'
import { passwordStrength } from './passwordStrength'

describe('passwordStrength', () => {
  it('est vide sans mot de passe', () => {
    expect(passwordStrength('').score).toBe(0)
  })

  it('reste faible pour un mot court', () => {
    expect(passwordStrength('abc').label).toBe('Faible')
  })

  it('monte avec longueur et diversité', () => {
    expect(passwordStrength('abcdefgh').score).toBeGreaterThanOrEqual(1)
    expect(passwordStrength('Abcdefgh1').score).toBeGreaterThanOrEqual(3)
    expect(passwordStrength('Abcdefgh12!x').label).toBe('Fort')
  })
})
