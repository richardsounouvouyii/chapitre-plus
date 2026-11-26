import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { TRAINER_PATHS } from '@/components/layout/app-shell/appNav'
import { useToast } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import { SUPPORTED_LEVELS } from '@/features/public/curriculumLevels'
import { SLOT_PRESETS } from './trainerAvailability'
import { readTrainerAvailability } from './trainerAvailability'
import { TRAINER_SUBJECT_OPTIONS } from './trainerCompetences'
import { createTrainerSession } from './trainerSessions'
import { canPublishPaidOffers } from './trainerStatus'
import { ensureDemoTrainerProfile, readTrainerMockProfile } from './trainerProfile'
import { TRAINER_VENUES, formatVenueLabel } from './trainerVenues'

const schema = z.object({
  title: z.string().trim().min(5, 'Titre trop court').max(120),
  level: z.enum(SUPPORTED_LEVELS),
  subject: z.enum(TRAINER_SUBJECT_OPTIONS),
  venueId: z.string().min(1, 'Choisissez un lieu'),
  date: z.string().min(1, 'Date requise'),
  slot: z.string().min(1, 'Créneau requis'),
  capacity: z.coerce.number().int().min(1).max(40),
  priceXof: z.coerce.number().int().min(0, 'XOF entier ≥ 0').max(50_000),
  notes: z.string().trim().max(500).optional().or(z.literal('')),
  submitForApproval: z.boolean(),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'input input-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const selectClass =
  'select select-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none'
const textareaClass =
  'textarea textarea-bordered min-h-24 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none'
const labelClass = 'mb-1 block text-sm font-semibold text-heading'

function toIsoRange(date: string, slot: string): { startsAt: string; endsAt: string } | null {
  const preset = SLOT_PRESETS.find((item) => `${item.startTime}-${item.endTime}` === slot)
  if (!preset) return null
  const startsAt = new Date(`${date}T${preset.startTime}:00`)
  const endsAt = new Date(`${date}T${preset.endTime}:00`)
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) return null
  return { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString() }
}

export function TrainerSessionCreatePage() {
  const navigate = useNavigate()
  const { session } = useAuthSession()
  const { pushToast } = useToast()
  const email = session?.email ?? DEMO_CREDENTIALS.TRAINER.email
  const profile = readTrainerMockProfile() ?? ensureDemoTrainerProfile(email)
  const approved = canPublishPaidOffers(profile.status)
  const availability = readTrainerAvailability()

  const levelOptions = useMemo(
    () => profile.levels.filter((level) => (SUPPORTED_LEVELS as readonly string[]).includes(level)),
    [profile.levels],
  )
  const subjectOptions = useMemo(
    () =>
      profile.subjects.filter((subject) =>
        (TRAINER_SUBJECT_OPTIONS as readonly string[]).includes(subject),
      ),
    [profile.subjects],
  )

  const defaultDate = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 2)
    return d.toISOString().slice(0, 10)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      level: levelOptions[0] ?? '3e',
      subject: subjectOptions[0] ?? 'Mathématiques',
      venueId: TRAINER_VENUES[0]?.id ?? '',
      date: defaultDate,
      slot: '08:00-10:00',
      capacity: 10,
      priceXof: 500,
      notes: '',
      submitForApproval: false,
    },
  })

  const onSubmit = (values: FormValues) => {
    if (levelOptions.length === 0 || subjectOptions.length === 0) {
      pushToast({
        tone: 'warning',
        title: 'Dossier incomplet',
        message: 'Renseignez classes et matières dans le dossier avant de créer une séance.',
        durationMs: 4000,
      })
      return
    }
    if (values.submitForApproval && !approved) {
      pushToast({
        tone: 'warning',
        title: 'Non approuvé',
        message: 'Soumission admin réservée aux formateurs APPROVED. Enregistrez en brouillon.',
        durationMs: 4000,
      })
      return
    }
    if (!availability?.slots.some((slot) => slot.isActive)) {
      pushToast({
        tone: 'warning',
        title: 'Aucune disponibilité',
        message: 'Ajoutez des créneaux avant de planifier une séance.',
        durationMs: 4000,
      })
      void navigate(TRAINER_PATHS.disponibilites)
      return
    }

    const range = toIsoRange(values.date, values.slot)
    if (!range) {
      pushToast({
        tone: 'error',
        title: 'Créneau invalide',
        message: 'Choisissez une date et un créneau valides.',
        durationMs: 3000,
      })
      return
    }

    try {
      const created = createTrainerSession({
        trainerEmail: email,
        title: values.title,
        level: values.level,
        subject: values.subject,
        venueId: values.venueId,
        startsAt: range.startsAt,
        endsAt: range.endsAt,
        capacity: values.capacity,
        priceXof: values.priceXof,
        notes: values.notes,
        submitForApproval: values.submitForApproval,
        trainerApproved: approved,
      })

      pushToast({
        tone: 'success',
        title: created.status === 'PENDING_APPROVAL' ? 'Séance soumise' : 'Brouillon enregistré',
        message: `${created.priceXof} XOF · tarif proposé`,
        durationMs: 3500,
      })
      void navigate(TRAINER_PATHS.seances)
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Création refusée',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        durationMs: 4500,
      })
    }
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading">
          Nouvelle séance
        </h1>
        <p className="mt-2 text-sm text-body/65">
          Lieu parmi les centres catalogue. Pas de domicile dans le MVP.
        </p>
      </header>

      <form
        className="mt-6 space-y-4 border border-border-light bg-surface p-4 sm:p-5"
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
        noValidate
      >
        <div>
          <label htmlFor="session-title" className={labelClass}>
            Titre / objectif
          </label>
          <input id="session-title" className={fieldClass} {...register('title')} />
          {errors.title ? (
            <p className="mt-1 text-sm text-error">{errors.title.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="session-level" className={labelClass}>
              Classe
            </label>
            <select id="session-level" className={selectClass} {...register('level')}>
              {levelOptions.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="session-subject" className={labelClass}>
              Matière
            </label>
            <select id="session-subject" className={selectClass} {...register('subject')}>
              {subjectOptions.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="session-venue" className={labelClass}>
            Lieu (catalogue)
          </label>
          <select id="session-venue" className={selectClass} {...register('venueId')}>
            {TRAINER_VENUES.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {formatVenueLabel(venue)} — {venue.address}
              </option>
            ))}
          </select>
          {errors.venueId ? (
            <p className="mt-1 text-sm text-error">{errors.venueId.message}</p>
          ) : null}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="session-date" className={labelClass}>
              Date
            </label>
            <input id="session-date" type="date" className={fieldClass} {...register('date')} />
            {errors.date ? (
              <p className="mt-1 text-sm text-error">{errors.date.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="session-slot" className={labelClass}>
              Créneau
            </label>
            <select id="session-slot" className={selectClass} {...register('slot')}>
              {SLOT_PRESETS.map((preset) => (
                <option
                  key={`${preset.startTime}-${preset.endTime}`}
                  value={`${preset.startTime}-${preset.endTime}`}
                >
                  {preset.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="session-capacity" className={labelClass}>
              Capacité
            </label>
            <input
              id="session-capacity"
              type="number"
              min={1}
              max={40}
              className={fieldClass}
              {...register('capacity')}
            />
          </div>
          <div>
            <label htmlFor="session-price" className={labelClass}>
              Tarif (XOF entier)
            </label>
            <input
              id="session-price"
              type="number"
              min={0}
              step={1}
              className={fieldClass}
              {...register('priceXof')}
            />
            {errors.priceXof ? (
              <p className="mt-1 text-sm text-error">{errors.priceXof.message}</p>
            ) : null}
          </div>
        </div>

        <div>
          <label htmlFor="session-notes" className={labelClass}>
            Notes (optionnel)
          </label>
          <textarea id="session-notes" className={textareaClass} rows={3} {...register('notes')} />
        </div>

        <label className="flex cursor-pointer items-start gap-2.5 text-sm text-heading">
          <input
            type="checkbox"
            className="checkbox checkbox-primary checkbox-sm mt-0.5 rounded-none"
            disabled={!approved}
            {...register('submitForApproval')}
          />
          <span>
            Soumettre à l’admin (tarif proposé)
            {!approved ? (
              <span className="mt-0.5 block text-xs text-body/55">
                Disponible après approbation du dossier formateur.
              </span>
            ) : null}
          </span>
        </label>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="submit" className="btn btn-primary h-11 px-5" disabled={isSubmitting}>
            Enregistrer la séance
          </button>
          <Link
            to={TRAINER_PATHS.seances}
            className="text-sm text-body/60 underline-offset-2 hover:text-primary hover:underline"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
