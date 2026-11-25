/**
 * Disponibilités mock formateur — isolées du dossier (`trainerProfile`)
 * et de la vitrine `/formateurs`. Aligné trainer-service :
 * weekday 0=lundi … 6=dimanche, timezone Africa/Porto-Novo.
 */

const STORAGE_KEY = 'chapitre.trainerAvailability.v1'
export const TRAINER_AVAILABILITY_TZ = 'Africa/Porto-Novo'

export type TrainerWeekday = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type TrainerAvailabilitySlot = {
  id: string
  weekday: TrainerWeekday
  startTime: string
  endTime: string
  timezone: typeof TRAINER_AVAILABILITY_TZ
  isActive: boolean
}

export type TrainerAvailabilityState = {
  email: string
  slots: TrainerAvailabilitySlot[]
  updatedAt: string
}

export const WEEKDAY_OPTIONS: { value: TrainerWeekday; label: string; short: string }[] = [
  { value: 0, label: 'Lundi', short: 'Lun' },
  { value: 1, label: 'Mardi', short: 'Mar' },
  { value: 2, label: 'Mercredi', short: 'Mer' },
  { value: 3, label: 'Jeudi', short: 'Jeu' },
  { value: 4, label: 'Vendredi', short: 'Ven' },
  { value: 5, label: 'Samedi', short: 'Sam' },
  { value: 6, label: 'Dimanche', short: 'Dim' },
]

/** Créneaux prédéfinis simples (MVP) — pas d’horaires libres custom pour l’instant. */
export const SLOT_PRESETS = [
  { startTime: '08:00', endTime: '10:00', label: '08:00 – 10:00' },
  { startTime: '10:00', endTime: '12:00', label: '10:00 – 12:00' },
  { startTime: '14:00', endTime: '16:00', label: '14:00 – 16:00' },
  { startTime: '16:00', endTime: '18:00', label: '16:00 – 18:00' },
] as const

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined'
}

function isWeekday(value: unknown): value is TrainerWeekday {
  return typeof value === 'number' && value >= 0 && value <= 6 && Number.isInteger(value)
}

function isPreset(startTime: string, endTime: string): boolean {
  return SLOT_PRESETS.some(
    (preset) => preset.startTime === startTime && preset.endTime === endTime,
  )
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `av-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function parseState(raw: string): TrainerAvailabilityState | null {
  const parsed = JSON.parse(raw) as Partial<TrainerAvailabilityState>
  const email = typeof parsed.email === 'string' ? parsed.email.trim() : ''
  if (!email) return null
  const slots: TrainerAvailabilitySlot[] = []
  if (Array.isArray(parsed.slots)) {
    for (const item of parsed.slots) {
      if (!item || typeof item !== 'object') continue
      const row = item as Partial<TrainerAvailabilitySlot>
      if (!isWeekday(row.weekday)) continue
      if (typeof row.startTime !== 'string' || typeof row.endTime !== 'string') continue
      if (!isPreset(row.startTime, row.endTime)) continue
      slots.push({
        id: typeof row.id === 'string' && row.id ? row.id : makeId(),
        weekday: row.weekday,
        startTime: row.startTime,
        endTime: row.endTime,
        timezone: TRAINER_AVAILABILITY_TZ,
        isActive: row.isActive !== false,
      })
    }
  }
  return {
    email,
    slots,
    updatedAt:
      typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
  }
}

export function readTrainerAvailability(): TrainerAvailabilityState | null {
  if (!canUseStorage()) return null
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseState(raw)
  } catch {
    return null
  }
}

export function writeTrainerAvailability(
  email: string,
  slots: Omit<TrainerAvailabilitySlot, 'timezone'>[],
): TrainerAvailabilityState {
  const next: TrainerAvailabilityState = {
    email: email.trim(),
    updatedAt: new Date().toISOString(),
    slots: slots.map((slot) => ({
      id: slot.id || makeId(),
      weekday: slot.weekday,
      startTime: slot.startTime,
      endTime: slot.endTime,
      timezone: TRAINER_AVAILABILITY_TZ,
      isActive: slot.isActive !== false,
    })),
  }
  if (canUseStorage()) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return next
}

export function clearTrainerAvailability(): void {
  if (canUseStorage()) {
    window.sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function hasActiveAvailability(state?: TrainerAvailabilityState | null): boolean {
  const current = state ?? readTrainerAvailability()
  return Boolean(current?.slots.some((slot) => slot.isActive))
}

export function slotKey(weekday: TrainerWeekday, startTime: string, endTime: string): string {
  return `${weekday}|${startTime}|${endTime}`
}

export function weekdayLabel(weekday: TrainerWeekday): string {
  return WEEKDAY_OPTIONS.find((item) => item.value === weekday)?.label ?? `Jour ${weekday}`
}

/** Démo légère si aucune dispo (connexion formateur). */
export function ensureDemoTrainerAvailability(email: string): TrainerAvailabilityState {
  const existing = readTrainerAvailability()
  if (existing?.email === email.trim()) {
    return existing
  }
  return writeTrainerAvailability(email, [
    {
      id: makeId(),
      weekday: 0,
      startTime: '08:00',
      endTime: '10:00',
      isActive: true,
    },
    {
      id: makeId(),
      weekday: 2,
      startTime: '14:00',
      endTime: '16:00',
      isActive: true,
    },
    {
      id: makeId(),
      weekday: 5,
      startTime: '10:00',
      endTime: '12:00',
      isActive: true,
    },
  ])
}

export function countSlotsByWeekday(
  slots: TrainerAvailabilitySlot[],
): Record<TrainerWeekday, number> {
  const counts = {
    0: 0,
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  } as Record<TrainerWeekday, number>
  for (const slot of slots) {
    if (slot.isActive) counts[slot.weekday] += 1
  }
  return counts
}
