import {
  getTrainerSession,
  listTrainerSessions,
  type TrainerSession,
} from './trainerSessions'

/**
 * Supports mock formateur liés à une séance (resource-service).
 * Formats : PDF / JPG / PNG / WEBP. Fenêtre via visible_at (avant / pendant / après).
 */

const STORAGE_KEY = 'chapitre.trainerResources.v1'

export const RESOURCE_CATEGORIES = {
  PREPARATION: 'PREPARATION',
  EXERCISE: 'EXERCISE',
  SUMMARY: 'SUMMARY',
  METHOD: 'METHOD',
  CORRECTION: 'CORRECTION',
} as const

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[keyof typeof RESOURCE_CATEGORIES]

export const RESOURCE_CATEGORY_LABELS: Record<ResourceCategory, string> = {
  PREPARATION: 'Préparation',
  EXERCISE: 'Exercice',
  SUMMARY: 'Synthèse',
  METHOD: 'Méthode',
  CORRECTION: 'Correction',
}

export const RESOURCE_WINDOWS = {
  BEFORE: 'BEFORE',
  DURING: 'DURING',
  AFTER: 'AFTER',
} as const

export type ResourceWindow = (typeof RESOURCE_WINDOWS)[keyof typeof RESOURCE_WINDOWS]

export const RESOURCE_WINDOW_LABELS: Record<ResourceWindow, string> = {
  BEFORE: 'Avant la séance',
  DURING: 'Pendant la séance',
  AFTER: 'Après la séance',
}

export const RESOURCE_FORMATS = ['PDF', 'JPG', 'PNG', 'WEBP'] as const
export type ResourceFormat = (typeof RESOURCE_FORMATS)[number]

export type TrainerResource = {
  id: string
  sessionId: string
  trainerEmail: string
  title: string
  category: ResourceCategory
  format: ResourceFormat
  fileName: string
  window: ResourceWindow
  visibleAt: string
  createdAt: string
}

export type TrainerResourceCreateInput = {
  trainerEmail: string
  sessionId: string
  title: string
  category: ResourceCategory
  format: ResourceFormat
  fileName?: string
  window: ResourceWindow
}

type Store = {
  email: string
  resources: TrainerResource[]
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `res-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isCategory(value: unknown): value is ResourceCategory {
  return typeof value === 'string' && value in RESOURCE_CATEGORIES
}

function isWindow(value: unknown): value is ResourceWindow {
  return typeof value === 'string' && value in RESOURCE_WINDOWS
}

function isFormat(value: unknown): value is ResourceFormat {
  return typeof value === 'string' && (RESOURCE_FORMATS as readonly string[]).includes(value)
}

/** visible_at dérivé de la séance + fenêtre métier. */
export function computeVisibleAt(session: TrainerSession, window: ResourceWindow): string {
  const start = new Date(session.startsAt)
  const end = new Date(session.endsAt)
  if (window === RESOURCE_WINDOWS.BEFORE) {
    const at = new Date(start)
    at.setUTCHours(at.getUTCHours() - 48)
    return at.toISOString()
  }
  if (window === RESOURCE_WINDOWS.DURING) {
    return start.toISOString()
  }
  return end.toISOString()
}

export function isResourceVisibleNow(
  resource: TrainerResource,
  now: Date = new Date(),
): boolean {
  return now.getTime() >= new Date(resource.visibleAt).getTime()
}

function parseStore(raw: string): Store | null {
  const parsed = JSON.parse(raw) as Partial<Store>
  const email = typeof parsed.email === 'string' ? parsed.email.trim() : ''
  if (!email || !Array.isArray(parsed.resources)) return null
  const resources: TrainerResource[] = []
  for (const item of parsed.resources) {
    if (!item || typeof item !== 'object') continue
    const row = item as Partial<TrainerResource>
    if (!row.id || !row.sessionId || !row.title || !row.fileName || !row.visibleAt) continue
    if (!isCategory(row.category) || !isWindow(row.window) || !isFormat(row.format)) continue
    resources.push({
      id: String(row.id),
      sessionId: String(row.sessionId),
      trainerEmail: email,
      title: String(row.title),
      category: row.category,
      format: row.format,
      fileName: String(row.fileName),
      window: row.window,
      visibleAt: String(row.visibleAt),
      createdAt: String(row.createdAt ?? new Date().toISOString()),
    })
  }
  return { email, resources }
}

function readStore(): Store | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseStore(raw)
  } catch {
    return null
  }
}

function writeStore(store: Store): Store {
  if (canUseStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  }
  return store
}

export function clearTrainerResources(): void {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function listTrainerResources(email: string, sessionId?: string): TrainerResource[] {
  const store = readStore()
  if (!store || store.email !== email.trim()) return []
  const items = sessionId
    ? store.resources.filter((item) => item.sessionId === sessionId)
    : [...store.resources]
  return items.sort(
    (a, b) => new Date(a.visibleAt).getTime() - new Date(b.visibleAt).getTime(),
  )
}

export function createTrainerResource(input: TrainerResourceCreateInput): TrainerResource {
  const email = input.trainerEmail.trim()
  const session = getTrainerSession(email, input.sessionId)
  if (!session) {
    throw new Error('Séance introuvable pour ce support')
  }
  if (
    session.status === 'CANCELLED' ||
    session.status === 'DRAFT' ||
    session.status === 'PENDING_APPROVAL'
  ) {
    throw new Error('Supports réservés aux séances publiées, complètes ou clôturées')
  }

  const ext = input.format.toLowerCase()
  const fileName =
    input.fileName?.trim() ||
    `${input.title.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40)}.${ext}`

  const now = new Date().toISOString()
  const resource: TrainerResource = {
    id: makeId(),
    sessionId: session.id,
    trainerEmail: email,
    title: input.title.trim(),
    category: input.category,
    format: input.format,
    fileName,
    window: input.window,
    visibleAt: computeVisibleAt(session, input.window),
    createdAt: now,
  }

  const current = readStore()
  const resources =
    current?.email === email ? [...current.resources, resource] : [resource]
  writeStore({ email, resources })
  return resource
}

export function ensureDemoTrainerResources(email: string): TrainerResource[] {
  const existing = listTrainerResources(email)
  if (existing.length > 0) return existing

  const sessions = listTrainerSessions(email)
  const published =
    sessions.find((item) => item.id === 'demo-sess-published') ??
    sessions.find((item) => item.status === 'PUBLISHED')
  const completed =
    sessions.find((item) => item.id === 'demo-sess-completed') ??
    sessions.find((item) => item.status === 'COMPLETED')

  if (published) {
    createTrainerResource({
      trainerEmail: email,
      sessionId: published.id,
      title: 'Fiche préparation — hydrocarbures',
      category: RESOURCE_CATEGORIES.PREPARATION,
      format: 'PDF',
      window: RESOURCE_WINDOWS.BEFORE,
    })
    createTrainerResource({
      trainerEmail: email,
      sessionId: published.id,
      title: 'Exercices en séance',
      category: RESOURCE_CATEGORIES.EXERCISE,
      format: 'PDF',
      window: RESOURCE_WINDOWS.DURING,
    })
    createTrainerResource({
      trainerEmail: email,
      sessionId: published.id,
      title: 'Schéma tableau (aperçu)',
      category: RESOURCE_CATEGORIES.METHOD,
      format: 'PNG',
      window: RESOURCE_WINDOWS.DURING,
    })
  }

  if (completed) {
    createTrainerResource({
      trainerEmail: email,
      sessionId: completed.id,
      title: 'Corrigé fractions',
      category: RESOURCE_CATEGORIES.CORRECTION,
      format: 'PDF',
      window: RESOURCE_WINDOWS.AFTER,
    })
    createTrainerResource({
      trainerEmail: email,
      sessionId: completed.id,
      title: 'Synthèse proportionnalité',
      category: RESOURCE_CATEGORIES.SUMMARY,
      format: 'PDF',
      window: RESOURCE_WINDOWS.AFTER,
    })
  }

  return listTrainerResources(email)
}
