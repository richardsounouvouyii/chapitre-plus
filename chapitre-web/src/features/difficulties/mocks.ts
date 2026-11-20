import type { DifficultyRequest } from './types'

const STORAGE_KEY = 'chapitre.difficultiesMock.v1'

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function readStore(): DifficultyRequest[] {
  if (!canUseStorage()) return []
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DifficultyRequest[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeStore(items: DifficultyRequest[]): void {
  if (!canUseStorage()) return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

/**
 * Liste mock isolée — remplacée par difficulty-service via gateway plus tard.
 * Si `level` est fourni, ne retourne que les demandes de cette classe (profil élève).
 */
export function listDifficultyRequests(level?: string): DifficultyRequest[] {
  const items = readStore()
  if (!level) return items
  return items.filter((item) => item.level === level)
}

export type CreateDifficultyInput = {
  level: string
  subject: string
  chapter: string
  notion: string
  preferences?: string
}

export function createDifficultyRequest(input: CreateDifficultyInput): DifficultyRequest {
  const item: DifficultyRequest = {
    id: crypto.randomUUID(),
    level: input.level,
    subject: input.subject,
    chapter: input.chapter.trim(),
    notion: input.notion.trim(),
    preferences: input.preferences?.trim() || undefined,
    status: 'SUBMITTED',
    createdAt: new Date().toISOString(),
  }
  const next = [item, ...readStore()]
  writeStore(next)
  return item
}

export function clearDifficultyRequests(): void {
  if (canUseStorage()) window.sessionStorage.removeItem(STORAGE_KEY)
}
