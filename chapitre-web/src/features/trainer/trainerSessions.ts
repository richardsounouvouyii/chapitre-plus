import type { SupportedLevel } from '@/features/public/curriculumLevels'
import type { TrainerSubjectOption } from './trainerCompetences'
import { getVenueById } from './trainerVenues'

/**
 * Séances mock espace formateur — isolées de `mocks/sessions.ts` (catalogue public).
 * Aligné scheduling-service : statut séance + statut tarif.
 */

const STORAGE_KEY = 'chapitre.trainerSessions.v2'

export const SESSION_STATUSES = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  PUBLISHED: 'PUBLISHED',
  FULL: 'FULL',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const

export type SessionStatus = (typeof SESSION_STATUSES)[keyof typeof SESSION_STATUSES]

export const PRICE_STATUSES = {
  PROPOSED: 'PROPOSED',
  APPROVED: 'APPROVED',
} as const

export type PriceStatus = (typeof PRICE_STATUSES)[keyof typeof PRICE_STATUSES]

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  DRAFT: 'Brouillon',
  PENDING_APPROVAL: 'En attente admin',
  PUBLISHED: 'Publiée',
  FULL: 'Complète',
  COMPLETED: 'Clôturée',
  CANCELLED: 'Annulée',
}

export const PRICE_STATUS_LABELS: Record<PriceStatus, string> = {
  PROPOSED: 'Tarif proposé',
  APPROVED: 'Tarif approuvé',
}

export type TrainerSession = {
  id: string
  trainerEmail: string
  title: string
  level: SupportedLevel
  subject: TrainerSubjectOption
  venueId: string
  startsAt: string
  endsAt: string
  capacity: number
  seatsTaken: number
  priceXof: number
  status: SessionStatus
  priceStatus: PriceStatus
  notes?: string
  /** Motif mock d’annulation (formateur). */
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

export type TrainerSessionCreateInput = {
  trainerEmail: string
  title: string
  level: SupportedLevel
  subject: TrainerSubjectOption
  venueId: string
  startsAt: string
  endsAt: string
  capacity: number
  priceXof: number
  notes?: string
  /** Si true et formateur APPROVED → PENDING_APPROVAL, sinon DRAFT. */
  submitForApproval?: boolean
  trainerApproved?: boolean
}

type Store = {
  email: string
  sessions: TrainerSession[]
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function isSessionStatus(value: unknown): value is SessionStatus {
  return typeof value === 'string' && value in SESSION_STATUSES
}

function isPriceStatus(value: unknown): value is PriceStatus {
  return typeof value === 'string' && value in PRICE_STATUSES
}

function parseStore(raw: string): Store | null {
  const parsed = JSON.parse(raw) as Partial<Store>
  const email = typeof parsed.email === 'string' ? parsed.email.trim() : ''
  if (!email || !Array.isArray(parsed.sessions)) return null
  const sessions: TrainerSession[] = []
  for (const item of parsed.sessions) {
    if (!item || typeof item !== 'object') continue
    const row = item as Partial<TrainerSession>
    if (!row.id || !row.title || !row.startsAt || !row.endsAt || !row.venueId) continue
    if (!isSessionStatus(row.status) || !isPriceStatus(row.priceStatus)) continue
    sessions.push({
      id: row.id,
      trainerEmail: email,
      title: String(row.title),
      level: row.level as SupportedLevel,
      subject: row.subject as TrainerSubjectOption,
      venueId: String(row.venueId),
      startsAt: String(row.startsAt),
      endsAt: String(row.endsAt),
      capacity: Number(row.capacity) || 1,
      seatsTaken: Number(row.seatsTaken) || 0,
      priceXof: Math.max(0, Math.trunc(Number(row.priceXof) || 0)),
      status: row.status,
      priceStatus: row.priceStatus,
      notes: typeof row.notes === 'string' ? row.notes : undefined,
      cancelReason: typeof row.cancelReason === 'string' ? row.cancelReason : undefined,
      createdAt: String(row.createdAt ?? new Date().toISOString()),
      updatedAt: String(row.updatedAt ?? new Date().toISOString()),
    })
  }
  return { email, sessions }
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

export function clearTrainerSessions(): void {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}

const ACTIVE_FOR_OVERLAP: ReadonlySet<SessionStatus> = new Set([
  SESSION_STATUSES.DRAFT,
  SESSION_STATUSES.PENDING_APPROVAL,
  SESSION_STATUSES.PUBLISHED,
  SESSION_STATUSES.FULL,
])

export function rangesOverlap(
  startsAtA: string,
  endsAtA: string,
  startsAtB: string,
  endsAtB: string,
): boolean {
  const a0 = new Date(startsAtA).getTime()
  const a1 = new Date(endsAtA).getTime()
  const b0 = new Date(startsAtB).getTime()
  const b1 = new Date(endsAtB).getTime()
  if ([a0, a1, b0, b1].some((value) => Number.isNaN(value))) return false
  return a0 < b1 && b0 < a1
}

export type SessionOverlapKind = 'TRAINER' | 'VENUE'

export type SessionOverlap = {
  kind: SessionOverlapKind
  other: TrainerSession
}

/** Chevauchement formateur ou lieu (hors CANCELLED / COMPLETED). */
export function findSessionOverlap(input: {
  trainerEmail: string
  venueId: string
  startsAt: string
  endsAt: string
  excludeId?: string
}): SessionOverlap | null {
  const email = input.trainerEmail.trim()
  const store = readStore()
  if (!store || store.email !== email) return null
  for (const other of store.sessions) {
    if (input.excludeId && other.id === input.excludeId) continue
    if (!ACTIVE_FOR_OVERLAP.has(other.status)) continue
    if (!rangesOverlap(input.startsAt, input.endsAt, other.startsAt, other.endsAt)) continue
    if (other.venueId === input.venueId) {
      return { kind: 'VENUE', other }
    }
    if (other.trainerEmail === email) {
      return { kind: 'TRAINER', other }
    }
  }
  return null
}

export function formatOverlapMessage(overlap: SessionOverlap): string {
  const when = new Date(overlap.other.startsAt).toLocaleString('fr-BJ', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
  if (overlap.kind === 'TRAINER') {
    return `Chevauchement formateur avec « ${overlap.other.title} » (${when}).`
  }
  return `Lieu déjà pris par « ${overlap.other.title} » (${when}).`
}

/** Lecture admin : store formateur démo (une boîte mock). */
export function listStoredTrainerSessions(): TrainerSession[] {
  const store = readStore()
  if (!store) return []
  return [...store.sessions].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
}

export function getStoredTrainerEmail(): string | null {
  return readStore()?.email ?? null
}

export function listPendingAdminApprovals(): TrainerSession[] {
  return listStoredTrainerSessions().filter(
    (session) => session.status === SESSION_STATUSES.PENDING_APPROVAL,
  )
}

export function listTrainerSessions(email: string): TrainerSession[] {
  const store = readStore()
  if (!store || store.email !== email.trim()) return []
  return [...store.sessions].sort(
    (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
  )
}

export function getTrainerSession(email: string, id: string): TrainerSession | null {
  return listTrainerSessions(email).find((session) => session.id === id) ?? null
}

export function createTrainerSession(input: TrainerSessionCreateInput): TrainerSession {
  if (!getVenueById(input.venueId)) {
    throw new Error('Lieu catalogue invalide')
  }
  if (input.priceXof < 0 || !Number.isInteger(input.priceXof)) {
    throw new Error('Prix XOF entier requis')
  }
  if (new Date(input.endsAt).getTime() <= new Date(input.startsAt).getTime()) {
    throw new Error('La fin doit être après le début')
  }

  const email = input.trainerEmail.trim()
  const overlap = findSessionOverlap({
    trainerEmail: email,
    venueId: input.venueId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
  })
  if (overlap) {
    throw new Error(formatOverlapMessage(overlap))
  }

  const now = new Date().toISOString()
  const submit = Boolean(input.submitForApproval && input.trainerApproved)
  const session: TrainerSession = {
    id: makeId(),
    trainerEmail: email,
    title: input.title.trim(),
    level: input.level,
    subject: input.subject,
    venueId: input.venueId,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    capacity: Math.max(1, Math.trunc(input.capacity)),
    seatsTaken: 0,
    priceXof: input.priceXof,
    status: submit ? SESSION_STATUSES.PENDING_APPROVAL : SESSION_STATUSES.DRAFT,
    priceStatus: PRICE_STATUSES.PROPOSED,
    notes: input.notes?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
  }

  const current = readStore()
  const sessions =
    current?.email === email ? [...current.sessions, session] : [session]
  writeStore({ email, sessions })
  return session
}

/** Admin : tarif PROPOSED + PENDING_APPROVAL → APPROVED + PUBLISHED. */
export function approveTrainerSessionPrice(email: string, id: string): TrainerSession | null {
  const store = readStore()
  if (!store || store.email !== email.trim()) return null
  const index = store.sessions.findIndex((session) => session.id === id)
  if (index < 0) return null
  const current = store.sessions[index]
  if (!current || current.status !== SESSION_STATUSES.PENDING_APPROVAL) return null
  if (current.priceStatus !== PRICE_STATUSES.PROPOSED) return null
  const next: TrainerSession = {
    ...current,
    status: SESSION_STATUSES.PUBLISHED,
    priceStatus: PRICE_STATUSES.APPROVED,
    updatedAt: new Date().toISOString(),
  }
  const sessions = [...store.sessions]
  sessions[index] = next
  writeStore({ email: store.email, sessions })
  return next
}

/** Admin : renvoi en brouillon (tarif reste proposé). */
export function rejectTrainerSessionPrice(email: string, id: string): TrainerSession | null {
  const store = readStore()
  if (!store || store.email !== email.trim()) return null
  const index = store.sessions.findIndex((session) => session.id === id)
  if (index < 0) return null
  const current = store.sessions[index]
  if (!current || current.status !== SESSION_STATUSES.PENDING_APPROVAL) return null
  const next: TrainerSession = {
    ...current,
    status: SESSION_STATUSES.DRAFT,
    priceStatus: PRICE_STATUSES.PROPOSED,
    updatedAt: new Date().toISOString(),
  }
  const sessions = [...store.sessions]
  sessions[index] = next
  writeStore({ email: store.email, sessions })
  return next
}

export function submitTrainerSessionForApproval(
  email: string,
  id: string,
  trainerApproved: boolean,
): TrainerSession | null {
  if (!trainerApproved) return null
  const store = readStore()
  if (!store || store.email !== email.trim()) return null
  const index = store.sessions.findIndex((session) => session.id === id)
  if (index < 0) return null
  const current = store.sessions[index]
  if (!current || current.status !== SESSION_STATUSES.DRAFT) return null
  const next: TrainerSession = {
    ...current,
    status: SESSION_STATUSES.PENDING_APPROVAL,
    updatedAt: new Date().toISOString(),
  }
  const sessions = [...store.sessions]
  sessions[index] = next
  writeStore({ email: store.email, sessions })
  return next
}

const CANCELABLE: ReadonlySet<SessionStatus> = new Set([
  SESSION_STATUSES.DRAFT,
  SESSION_STATUSES.PENDING_APPROVAL,
  SESSION_STATUSES.PUBLISHED,
  SESSION_STATUSES.FULL,
])

export function canCancelTrainerSession(session: TrainerSession): boolean {
  return CANCELABLE.has(session.status)
}

export function cancelTrainerSession(
  email: string,
  id: string,
  reason?: string,
): TrainerSession | null {
  const store = readStore()
  if (!store || store.email !== email.trim()) return null
  const index = store.sessions.findIndex((session) => session.id === id)
  if (index < 0) return null
  const current = store.sessions[index]
  if (!current || !canCancelTrainerSession(current)) return null
  const trimmed = reason?.trim()
  const next: TrainerSession = {
    ...current,
    status: SESSION_STATUSES.CANCELLED,
    cancelReason: trimmed || undefined,
    updatedAt: new Date().toISOString(),
  }
  const sessions = [...store.sessions]
  sessions[index] = next
  writeStore({ email: store.email, sessions })
  return next
}

/** Clôture mock (séance PUBLISHED / FULL passée). */
export function completeTrainerSession(email: string, id: string): TrainerSession | null {
  const store = readStore()
  if (!store || store.email !== email.trim()) return null
  const index = store.sessions.findIndex((session) => session.id === id)
  if (index < 0) return null
  const current = store.sessions[index]
  if (
    !current ||
    (current.status !== SESSION_STATUSES.PUBLISHED && current.status !== SESSION_STATUSES.FULL)
  ) {
    return null
  }
  const next: TrainerSession = {
    ...current,
    status: SESSION_STATUSES.COMPLETED,
    updatedAt: new Date().toISOString(),
  }
  const sessions = [...store.sessions]
  sessions[index] = next
  writeStore({ email: store.email, sessions })
  return next
}

function isoRange(daysFromNow: number, startHour: number, endHour: number): {
  startsAt: string
  endsAt: string
} {
  const start = new Date()
  start.setUTCDate(start.getUTCDate() + daysFromNow)
  start.setUTCHours(startHour, 0, 0, 0)
  const end = new Date(start)
  end.setUTCHours(endHour, 0, 0, 0)
  return { startsAt: start.toISOString(), endsAt: end.toISOString() }
}

/** Seed démo multi-statuts si aucune séance pour cet e-mail. */
export function ensureDemoTrainerSessions(email: string): TrainerSession[] {
  const existing = listTrainerSessions(email)
  if (existing.length > 0) return existing

  const trimmed = email.trim()
  const now = new Date().toISOString()
  const draftRange = isoRange(3, 8, 10)
  const pendingRange = isoRange(5, 14, 16)
  const publishedRange = isoRange(7, 8, 10)
  const fullRange = isoRange(9, 15, 17)
  const completedRange = isoRange(-4, 8, 10)
  const cancelledRange = isoRange(4, 10, 12)

  const sessions: TrainerSession[] = [
    {
      id: 'demo-sess-draft',
      trainerEmail: trimmed,
      title: 'Équations du second degré — révision',
      level: 'Terminale C',
      subject: 'Mathématiques',
      venueId: 'venue-akpakpa',
      ...draftRange,
      capacity: 10,
      seatsTaken: 0,
      priceXof: 500,
      status: SESSION_STATUSES.DRAFT,
      priceStatus: PRICE_STATUSES.PROPOSED,
      notes: 'Brouillon : à soumettre après validation du dossier.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-sess-pending',
      trainerEmail: trimmed,
      title: 'Optique géométrique — lentilles',
      level: 'Terminale D',
      subject: 'Physique',
      venueId: 'venue-ganhi',
      ...pendingRange,
      capacity: 12,
      seatsTaken: 0,
      priceXof: 700,
      status: SESSION_STATUSES.PENDING_APPROVAL,
      priceStatus: PRICE_STATUSES.PROPOSED,
      notes: 'En attente d’approbation admin du tarif.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-sess-published',
      trainerEmail: trimmed,
      title: 'Chimie organique — hydrocarbures',
      level: 'Terminale D',
      subject: 'Chimie',
      venueId: 'venue-parakou',
      ...publishedRange,
      capacity: 12,
      seatsTaken: 4,
      priceXof: 800,
      status: SESSION_STATUSES.PUBLISHED,
      priceStatus: PRICE_STATUSES.APPROVED,
      notes: 'Apporter calculatrice. Places encore ouvertes.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-sess-full',
      trainerEmail: trimmed,
      title: 'Probabilités — entraînement bac',
      level: 'Terminale C',
      subject: 'Mathématiques',
      venueId: 'venue-akpakpa',
      ...fullRange,
      capacity: 8,
      seatsTaken: 8,
      priceXof: 600,
      status: SESSION_STATUSES.FULL,
      priceStatus: PRICE_STATUSES.APPROVED,
      notes: 'Capacité atteinte — liste d’attente non gérée dans le MVP.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-sess-completed',
      trainerEmail: trimmed,
      title: 'Révision fractions et proportionnalité',
      level: '3e',
      subject: 'Mathématiques',
      venueId: 'venue-ganhi',
      ...completedRange,
      capacity: 15,
      seatsTaken: 11,
      priceXof: 400,
      status: SESSION_STATUSES.COMPLETED,
      priceStatus: PRICE_STATUSES.APPROVED,
      notes: 'Séance passée — clôturée.',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'demo-sess-cancelled',
      trainerEmail: trimmed,
      title: 'Électrostatique — charges et champs',
      level: 'Terminale C',
      subject: 'Physique',
      venueId: 'venue-porto',
      ...cancelledRange,
      capacity: 10,
      seatsTaken: 2,
      priceXof: 650,
      status: SESSION_STATUSES.CANCELLED,
      priceStatus: PRICE_STATUSES.PROPOSED,
      notes: 'Annulée avant publication.',
      cancelReason: 'Indisponibilité du centre le jour prévu.',
      createdAt: now,
      updatedAt: now,
    },
  ]

  writeStore({ email: trimmed, sessions })
  return listTrainerSessions(trimmed)
}

export function formatSessionWhen(session: TrainerSession): string {
  const start = new Date(session.startsAt)
  const end = new Date(session.endsAt)
  const day = start.toLocaleDateString('fr-BJ', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
  const from = start.toLocaleTimeString('fr-BJ', { hour: '2-digit', minute: '2-digit' })
  const to = end.toLocaleTimeString('fr-BJ', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${from}–${to}`
}

export function seatsLeft(session: TrainerSession): number {
  return Math.max(0, session.capacity - session.seatsTaken)
}
