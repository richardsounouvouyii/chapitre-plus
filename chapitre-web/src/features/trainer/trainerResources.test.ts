import { beforeEach, describe, expect, it } from 'vitest'
import {
  clearTrainerResources,
  computeVisibleAt,
  createTrainerResource,
  ensureDemoTrainerResources,
  isResourceVisibleNow,
  listTrainerResources,
  RESOURCE_CATEGORIES,
  RESOURCE_WINDOWS,
} from './trainerResources'
import {
  clearTrainerSessions,
  ensureDemoTrainerSessions,
  getTrainerSession,
} from './trainerSessions'

describe('trainerResources mock', () => {
  beforeEach(() => {
    clearTrainerResources()
    clearTrainerSessions()
  })

  it('seed des supports liés aux séances publiées/clôturées', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    const items = ensureDemoTrainerResources('f@exemple.bj')
    expect(items.length).toBeGreaterThanOrEqual(3)
    expect(items.every((item) => item.sessionId && item.visibleAt)).toBe(true)
  })

  it('calcule visible_at selon la fenêtre', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    const session = getTrainerSession('f@exemple.bj', 'demo-sess-published')!
    const before = new Date(computeVisibleAt(session, RESOURCE_WINDOWS.BEFORE)).getTime()
    const during = new Date(computeVisibleAt(session, RESOURCE_WINDOWS.DURING)).getTime()
    const after = new Date(computeVisibleAt(session, RESOURCE_WINDOWS.AFTER)).getTime()
    expect(before).toBeLessThan(during)
    expect(during).toBeLessThan(after)
  })

  it('refuse un support sur brouillon', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    expect(() =>
      createTrainerResource({
        trainerEmail: 'f@exemple.bj',
        sessionId: 'demo-sess-draft',
        title: 'Fiche',
        category: RESOURCE_CATEGORIES.PREPARATION,
        format: 'PDF',
        window: RESOURCE_WINDOWS.BEFORE,
      }),
    ).toThrow(/publiées/)
  })

  it('filtre par séance et évalue la visibilité', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    ensureDemoTrainerResources('f@exemple.bj')
    const forPublished = listTrainerResources('f@exemple.bj', 'demo-sess-published')
    expect(forPublished.length).toBeGreaterThan(0)
    const future = new Date('2099-01-01T00:00:00.000Z')
    expect(isResourceVisibleNow(forPublished[0]!, future)).toBe(true)
    const past = new Date('2000-01-01T00:00:00.000Z')
    expect(isResourceVisibleNow(forPublished[0]!, past)).toBe(false)
  })
})
