import { Clock3 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TRAINER_PATHS } from '@/components/layout/app-shell/appNav'
import { AlertBanner, StatusBadge, useToast } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import { canPublishPaidOffers } from './trainerStatus'
import { readTrainerMockProfile } from './trainerProfile'
import {
  ensureDemoTrainerAvailability,
  SLOT_PRESETS,
  slotKey,
  TRAINER_AVAILABILITY_TZ,
  WEEKDAY_OPTIONS,
  writeTrainerAvailability,
  type TrainerAvailabilitySlot,
  type TrainerWeekday,
} from './trainerAvailability'

const checkboxRowClass =
  'flex cursor-pointer items-center gap-2.5 border border-border-light bg-page/40 px-3 py-2.5 text-sm text-heading transition-colors hover:border-primary/30 has-[:checked]:border-primary/50 has-[:checked]:bg-soft-blue/40'

type DraftKey = string

function toDraftSet(slots: TrainerAvailabilitySlot[]): Set<DraftKey> {
  return new Set(
    slots.filter((slot) => slot.isActive).map((slot) =>
      slotKey(slot.weekday, slot.startTime, slot.endTime),
    ),
  )
}

/**
 * Calendrier de disponibilités mock (jours + créneaux prédéfinis).
 * Les lieux se choisissent plus tard à la création de séance (scheduling).
 */
export function TrainerAvailabilityPage() {
  const { session } = useAuthSession()
  const { pushToast } = useToast()
  const email = session?.email ?? DEMO_CREDENTIALS.TRAINER.email
  const profile = readTrainerMockProfile()

  const [draft, setDraft] = useState<Set<DraftKey>>(() => new Set())
  const [baseline, setBaseline] = useState<Set<DraftKey>>(() => new Set())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const state = ensureDemoTrainerAvailability(email)
    const next = toDraftSet(state.slots)
    setDraft(next)
    setBaseline(new Set(next))
    setReady(true)
  }, [email])

  const isDirty = useMemo(() => {
    if (draft.size !== baseline.size) return true
    for (const key of draft) {
      if (!baseline.has(key)) return true
    }
    return false
  }, [draft, baseline])

  const selectedCount = draft.size
  const canSave = isDirty && selectedCount > 0

  const toggle = (weekday: TrainerWeekday, startTime: string, endTime: string) => {
    const key = slotKey(weekday, startTime, endTime)
    setDraft((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const clearDay = (weekday: TrainerWeekday) => {
    setDraft((current) => {
      const next = new Set(current)
      for (const preset of SLOT_PRESETS) {
        next.delete(slotKey(weekday, preset.startTime, preset.endTime))
      }
      return next
    })
  }

  const selectMorning = (weekday: TrainerWeekday) => {
    setDraft((current) => {
      const next = new Set(current)
      for (const preset of SLOT_PRESETS) {
        const key = slotKey(weekday, preset.startTime, preset.endTime)
        if (preset.startTime < '12:00') next.add(key)
      }
      return next
    })
  }

  const onSave = () => {
    if (!canSave) return
    const slots: Omit<TrainerAvailabilitySlot, 'timezone'>[] = []
    for (const key of draft) {
      const [weekdayRaw, startTime, endTime] = key.split('|')
      const weekday = Number(weekdayRaw) as TrainerWeekday
      if (!startTime || !endTime) continue
      slots.push({
        id: key,
        weekday,
        startTime,
        endTime,
        isActive: true,
      })
    }
    const saved = writeTrainerAvailability(email, slots)
    const next = toDraftSet(saved.slots)
    setDraft(next)
    setBaseline(new Set(next))
    pushToast({
      tone: 'success',
      title: 'Disponibilités enregistrées',
      message: `${saved.slots.length} créneau(x) · fuseau ${TRAINER_AVAILABILITY_TZ}`,
      durationMs: 3500,
    })
  }

  if (!ready) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-up py-10 text-sm text-body/60">
        Chargement des disponibilités…
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-heading">Disponibilités</h1>
          <StatusBadge
            label={
              selectedCount > 1
                ? `${selectedCount} créneaux`
                : selectedCount === 1
                  ? '1 créneau'
                  : '0 créneau'
            }
            variant={selectedCount > 0 ? 'success' : 'warning'}
          />
        </div>
        <p className="mt-2 text-sm leading-relaxed text-body/70">
          Indiquez les jours et créneaux où vous pouvez animer une séance en présentiel. Les
          lieux (centres partenaires) se choisiront à la création d’une séance — pas ici.
        </p>
      </header>

      {profile && !canPublishPaidOffers(profile.status) ? (
        <AlertBanner tone="info" title="Rappel validation" className="mt-6">
          Vous pouvez préparer vos disponibilités dès maintenant. La publication d’offre payante
          reste bloquée tant que le dossier n’est pas approuvé.
        </AlertBanner>
      ) : null}

      {selectedCount === 0 ? (
        <AlertBanner tone="warning" title="Aucun créneau" className="mt-6">
          Sélectionnez au moins un créneau pour pouvoir proposer des séances plus tard.
        </AlertBanner>
      ) : null}

      <div className="mt-6 space-y-3">
        {WEEKDAY_OPTIONS.map((day) => {
          const dayCount = SLOT_PRESETS.filter((preset) =>
            draft.has(slotKey(day.value, preset.startTime, preset.endTime)),
          ).length
          return (
            <section
              key={day.value}
              className="border border-border-light bg-surface p-4 sm:p-5"
              aria-label={day.label}
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Clock3 className="size-4 text-primary" aria-hidden />
                  <h2 className="text-base font-semibold text-heading">{day.label}</h2>
                  <StatusBadge
                    label={
                      dayCount > 1
                        ? `${dayCount} créneaux`
                        : dayCount === 1
                          ? '1 créneau'
                          : 'Libre'
                    }
                    variant={dayCount > 0 ? 'primary' : 'neutral'}
                    size="sm"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs h-8 border border-border-light"
                    onClick={() => selectMorning(day.value)}
                  >
                    Matin
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs h-8 border border-border-light"
                    onClick={() => clearDay(day.value)}
                  >
                    Effacer
                  </button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {SLOT_PRESETS.map((preset) => {
                  const key = slotKey(day.value, preset.startTime, preset.endTime)
                  const checked = draft.has(key)
                  return (
                    <label key={key} className={checkboxRowClass}>
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm rounded-none"
                        checked={checked}
                        onChange={() => toggle(day.value, preset.startTime, preset.endTime)}
                      />
                      <span className="font-medium">{preset.label}</span>
                    </label>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-body/50">
        Fuseau : {TRAINER_AVAILABILITY_TZ}. Les lieux ne sont pas gérés sur cet écran.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-primary h-11 px-5 disabled:btn-disabled"
          disabled={!canSave}
          onClick={onSave}
        >
          Enregistrer les disponibilités
        </button>
        {!isDirty ? (
          <span className="text-xs text-body/50">Aucune modification</span>
        ) : selectedCount === 0 ? (
          <span className="text-xs text-error/80">
            Choisissez au moins un créneau pour enregistrer.
          </span>
        ) : null}
        <Link
          to={TRAINER_PATHS.dossier}
          className="text-sm text-body/60 underline-offset-2 hover:text-primary hover:underline"
        >
          Retour au dossier
        </Link>
      </div>
    </div>
  )
}
