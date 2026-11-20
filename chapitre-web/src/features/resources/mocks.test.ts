import { describe, expect, it } from 'vitest'
import { canDownloadResource, isResourceVisible, listStudentResources } from './mocks'
import { RESOURCE_CATEGORIES } from './types'

describe('resources mocks', () => {
  it('expose des documents démo filtrés par classe', () => {
    const items = listStudentResources('3e')
    expect(items.length).toBeGreaterThanOrEqual(3)
    expect(items.every((item) => item.level === '3e')).toBe(true)
  })

  it('bloque le téléchargement avant visible_at ou sans réservation confirmée', () => {
    const items = listStudentResources('3e')
    const lockedByBooking = items.find((item) => !item.bookingConfirmed)
    const future = items.find((item) => new Date(item.visibleAt).getTime() > Date.now())
    expect(lockedByBooking && canDownloadResource(lockedByBooking)).toBe(false)
    if (future) {
      expect(isResourceVisible(future, new Date('2026-11-01T00:00:00.000Z'))).toBe(false)
    }
  })

  it('expose les catégories cahier', () => {
    expect(RESOURCE_CATEGORIES).toContain('PREPARATION')
    expect(RESOURCE_CATEGORIES).toContain('CORRECTION')
  })
})
