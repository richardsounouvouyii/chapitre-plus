import { describe, expect, it } from 'vitest'
import {
  isSupportedLevel,
  selectClassGroupsForSession,
  subjectsByLevel,
  SUPPORTED_LEVELS,
  SUPPORTED_LEVELS_LABEL,
} from './curriculumLevels'

describe('SUPPORTED_LEVELS', () => {
  it('ne couvre que 3e et Terminale C·D', () => {
    expect([...SUPPORTED_LEVELS]).toEqual(['3e', 'Terminale C', 'Terminale D'])
    expect(SUPPORTED_LEVELS_LABEL).toContain('Terminale C')
    expect(isSupportedLevel('Terminale E')).toBe(false)
    expect(isSupportedLevel('Terminale A')).toBe(false)
    expect(isSupportedLevel('Terminale')).toBe(false)
  })
})

describe('subjectsByLevel', () => {
  it('ignore les classes hors périmètre (A, E, …)', () => {
    const groups = subjectsByLevel([
      {
        name: 'Physique-Chimie',
        levels: ['3e', 'Terminale A', 'Terminale C', 'Terminale D', 'Terminale E'],
      },
    ])
    expect(groups.map((group) => group.level)).toEqual(['3e', 'Terminale C', 'Terminale D'])
  })
})

describe('selectClassGroupsForSession', () => {
  const groups = subjectsByLevel([
    {
      name: 'Physique-Chimie',
      levels: ['3e', 'Terminale C', 'Terminale D'],
    },
    { name: 'Mathématiques', levels: ['Terminale C', 'Terminale D'] },
  ])

  it('affiche toutes les classes s’il y en a au plus 4', () => {
    expect(selectClassGroupsForSession(groups, 'Terminale D')).toEqual({
      visible: groups,
      hiddenCount: 0,
    })
  })

  it('ne tronque pas le périmètre MVP (3 classes max)', () => {
    expect(groups).toHaveLength(3)
    expect(selectClassGroupsForSession(groups, 'Terminale D').hiddenCount).toBe(0)
  })
})
