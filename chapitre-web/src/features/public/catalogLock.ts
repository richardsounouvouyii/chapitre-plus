/** Verrou UI catalogue : fetch en cours ou toast encore visible. */
export function isCatalogInteractionsLocked(isFetching: boolean, hasActiveToast: boolean): boolean {
  return isFetching || hasActiveToast
}
