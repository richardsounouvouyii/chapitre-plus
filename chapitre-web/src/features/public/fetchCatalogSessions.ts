import { MOCK_SESSIONS, type MockSession } from '@/mocks'

export const CATALOG_SESSIONS_QUERY_KEY = ['sessions', 'catalog'] as const

export type CatalogSource = 'mock' | 'scheduling'

export type CatalogPayload = {
  /** `scheduling` quand la gateway renvoie le vrai catalogue. */
  source: CatalogSource
  sessions: MockSession[]
}

/** Mock réseau — à remplacer par un appel gateway / scheduling-service. */
export async function fetchCatalogSessions(signal?: AbortSignal): Promise<CatalogPayload> {
  await new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, 700)
    signal?.addEventListener('abort', () => {
      window.clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
  return { source: 'mock', sessions: MOCK_SESSIONS }
}
