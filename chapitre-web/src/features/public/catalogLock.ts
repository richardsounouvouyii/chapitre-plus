import type { MockSession } from '@/mocks'
import type { CatalogSource } from './fetchCatalogSessions'

/** Verrou UI catalogue : fetch en cours ou toast encore visible. */
export function isCatalogInteractionsLocked(isFetching: boolean, hasActiveToast: boolean): boolean {
  return isFetching || hasActiveToast
}

/** Filtre ville seulement sur le catalogue réel, au-delà de 10 séances. */
export function shouldShowCityFilter(source: CatalogSource, sessionCount: number): boolean {
  return source === 'scheduling' && sessionCount > 10
}

/** Filtre date (semaine / mois) sur le catalogue réel, au-delà de 20 séances. */
export function shouldShowDateFilter(source: CatalogSource, sessionCount: number): boolean {
  return source === 'scheduling' && sessionCount > 20
}

/** Badge d’en-tête : « Tarif validé » uniquement si l’API a approuvé tous les tarifs. */
export function catalogTariffBadge(
  source: CatalogSource,
  sessions: Pick<MockSession, 'tariffStatus'>[],
): 'Démo' | 'Tarif validé' {
  const approved =
    source === 'scheduling' &&
    sessions.length > 0 &&
    sessions.every((session) => session.tariffStatus === 'APPROVED')
  return approved ? 'Tarif validé' : 'Démo'
}
