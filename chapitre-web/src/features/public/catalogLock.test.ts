import { describe, expect, it } from 'vitest'
import { isCatalogInteractionsLocked } from './catalogLock'

describe('isCatalogInteractionsLocked', () => {
  it('verrouille pendant un fetch', () => {
    expect(isCatalogInteractionsLocked(true, false)).toBe(true)
  })

  it('verrouille pendant un toast actif', () => {
    expect(isCatalogInteractionsLocked(false, true)).toBe(true)
  })

  it('déverrouille sans fetch ni toast', () => {
    expect(isCatalogInteractionsLocked(false, false)).toBe(false)
  })
})
