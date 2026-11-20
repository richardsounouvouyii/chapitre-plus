import { describe, expect, it } from 'vitest'
import {
  catalogTariffBadge,
  isCatalogInteractionsLocked,
  shouldShowCityFilter,
  shouldShowDateFilter,
} from './catalogLock'

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

describe('shouldShowCityFilter', () => {
  it('masque le filtre ville sur les données mock, même au-delà de 10', () => {
    expect(shouldShowCityFilter('mock', 12)).toBe(false)
  })

  it('affiche le filtre ville sur le catalogue réel au-delà de 10', () => {
    expect(shouldShowCityFilter('scheduling', 11)).toBe(true)
    expect(shouldShowCityFilter('scheduling', 10)).toBe(false)
  })
})

describe('shouldShowDateFilter', () => {
  it('masque le filtre date sur les mocks', () => {
    expect(shouldShowDateFilter('mock', 25)).toBe(false)
  })

  it('affiche le filtre date sur le catalogue réel au-delà de 20', () => {
    expect(shouldShowDateFilter('scheduling', 21)).toBe(true)
    expect(shouldShowDateFilter('scheduling', 20)).toBe(false)
  })
})

describe('catalogTariffBadge', () => {
  it('reste Démo tant que la source n’est pas l’API', () => {
    expect(catalogTariffBadge('mock', [{ tariffStatus: 'APPROVED' }])).toBe('Démo')
  })

  it('affiche Tarif validé quand l’API a approuvé chaque tarif', () => {
    expect(catalogTariffBadge('scheduling', [{ tariffStatus: 'APPROVED' }])).toBe('Tarif validé')
  })
})
