import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, GraduationCap, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { StatusBadge, useToast } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import { writeDemoAuthSession } from '@/features/auth/demoSession'
import { ROLES } from '@/lib/roles'
import {
  formatTrainerLevels,
  formatTrainerSubjects,
  TRAINER_LEVEL_OPTIONS,
  TRAINER_LEVELS_HINT,
  TRAINER_SUBJECT_OPTIONS,
} from './trainerCompetences'
import {
  ensureDemoTrainerProfile,
  readTrainerMockProfile,
  trainerDisplayName,
  writeTrainerMockProfile,
  type TrainerMockProfile,
} from './trainerProfile'
import {
  TRAINER_STATUS_LABELS,
  TRAINER_STATUSES,
  trainerStatusBadgeVariant,
} from './trainerStatus'

const schema = z.object({
  firstName: z.string().trim().min(2, 'Prénom trop court').max(60),
  lastName: z.string().trim().min(2, 'Nom trop court').max(60),
  city: z.string().trim().min(2, 'Ville requise').max(80),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  bio: z
    .string()
    .trim()
    .min(20, 'Présentation trop courte (20 caractères min.)')
    .max(500, 'Présentation trop longue'),
  levels: z.array(z.string()).min(1, 'Choisissez au moins une classe'),
  subjects: z.array(z.string()).min(1, 'Choisissez au moins une matière'),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'input input-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const textareaClass =
  'textarea textarea-bordered min-h-28 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const labelClass = 'mb-1 block text-sm font-semibold text-heading'
const sectionClass = 'border border-border-light bg-surface p-4 sm:p-5'
const checkboxRowClass =
  'flex cursor-pointer items-center gap-2.5 border border-border-light bg-page/40 px-3 py-2.5 text-sm text-heading transition-colors hover:border-primary/30 has-[:checked]:border-primary/50 has-[:checked]:bg-soft-blue/40'

function formatDate(iso?: string): string | undefined {
  if (!iso) return undefined
  return new Date(iso).toLocaleString('fr-BJ', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toggleInList(list: string[], value: string, checked: boolean): string[] {
  if (checked) return list.includes(value) ? list : [...list, value]
  return list.filter((item) => item !== value)
}

/**
 * Dossier de validation formateur (mock isolé — distinct de la vitrine `/formateurs`).
 */
export function TrainerDossierPage() {
  const { session, refresh } = useAuthSession()
  const { pushToast } = useToast()
  const [profile, setProfile] = useState<TrainerMockProfile | null>(() =>
    readTrainerMockProfile(),
  )

  useEffect(() => {
    const email = session?.email ?? DEMO_CREDENTIALS.TRAINER.email
    setProfile(ensureDemoTrainerProfile(email))
  }, [session?.email])

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting, isDirty, isValid },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    values: profile
      ? {
          firstName: profile.firstName,
          lastName: profile.lastName,
          city: profile.city,
          phone: profile.phone ?? '',
          bio: profile.bio ?? '',
          levels: profile.levels,
          subjects: profile.subjects,
        }
      : undefined,
  })

  const watchedLevels = watch('levels') ?? []
  const watchedSubjects = watch('subjects') ?? []
  const hasTeachingSelection =
    watchedLevels.length > 0 && watchedSubjects.length > 0
  const canSave = isDirty && isValid && hasTeachingSelection && !isSubmitting
  const status = profile?.status ?? TRAINER_STATUSES.PENDING_VERIFICATION

  const syncAuthDisplayName = (next: TrainerMockProfile) => {
    writeDemoAuthSession({
      role: ROLES.TRAINER,
      email: next.email,
      displayName: trainerDisplayName(next),
    })
    refresh()
  }

  const onSubmit = (values: FormValues) => {
    if (!profile) return
    const next = writeTrainerMockProfile({
      firstName: values.firstName,
      lastName: values.lastName,
      city: values.city,
      phone: values.phone?.trim() || undefined,
      bio: values.bio.trim(),
      levels: values.levels,
      subjects: values.subjects,
      submittedAt: new Date().toISOString(),
    })
    setProfile(next)
    syncAuthDisplayName(next)
    reset({
      firstName: next.firstName,
      lastName: next.lastName,
      city: next.city,
      phone: next.phone ?? '',
      bio: next.bio ?? '',
      levels: next.levels,
      subjects: next.subjects,
    })
    pushToast({
      tone: 'success',
      title: 'Dossier enregistré',
      message: 'Identité, présentation et enseignement mis à jour (mock).',
      durationMs: 3500,
    })
  }

  if (!profile) {
    return (
      <div className="mx-auto max-w-2xl animate-fade-up py-10 text-sm text-body/60">
        Chargement du dossier…
      </div>
    )
  }

  const displayName = trainerDisplayName(profile)

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2.5">
          <h1 className="text-2xl font-bold tracking-tight text-heading">
            Dossier de validation
          </h1>
          <StatusBadge
            label={TRAINER_STATUS_LABELS[status]}
            variant={trainerStatusBadgeVariant(status)}
          />
        </div>
      </header>

      {/* Synthèse compte déjà connecté */}
      <section className={`${sectionClass} mt-6`} aria-label="Synthèse du compte">
        <div className="flex flex-wrap items-start gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center bg-primary text-sm font-bold text-primary-content">
            {displayName
              .split(/\s+/)
              .map((part) => part[0])
              .join('')
              .slice(0, 2)
              .toUpperCase()}
          </span>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <p className="text-lg font-bold text-heading">{displayName}</p>
              <p className="text-sm text-body/60">
                {profile.email} · {profile.city}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.levels.map((level) => (
                <StatusBadge key={level} label={level} variant="primary" size="sm" />
              ))}
              {profile.subjects.map((subject) => (
                <StatusBadge key={subject} label={subject} variant="info" size="sm" />
              ))}
            </div>
            <p className="text-xs text-body/50">
              Dernière soumission : {formatDate(profile.submittedAt) ?? '—'}
            </p>
          </div>
        </div>
      </section>

      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event)
        }}
        className="mt-6 space-y-4"
        noValidate
      >
        {/* 1. Identité */}
        <section className={sectionClass}>
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="size-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold text-heading">Identité</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="trainer-firstName" className={labelClass}>
                Prénom
              </label>
              <input
                id="trainer-firstName"
                className={fieldClass}
                autoComplete="given-name"
                {...register('firstName')}
              />
              {errors.firstName ? (
                <p className="mt-1 text-sm text-error">{errors.firstName.message}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="trainer-lastName" className={labelClass}>
                Nom
              </label>
              <input
                id="trainer-lastName"
                className={fieldClass}
                autoComplete="family-name"
                {...register('lastName')}
              />
              {errors.lastName ? (
                <p className="mt-1 text-sm text-error">{errors.lastName.message}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="trainer-city" className={labelClass}>
                Ville
              </label>
              <input
                id="trainer-city"
                className={fieldClass}
                autoComplete="address-level2"
                {...register('city')}
              />
              {errors.city ? (
                <p className="mt-1 text-sm text-error">{errors.city.message}</p>
              ) : null}
            </div>
            <div>
              <label htmlFor="trainer-phone" className={labelClass}>
                Téléphone
              </label>
              <input
                id="trainer-phone"
                className={fieldClass}
                autoComplete="tel"
                {...register('phone')}
              />
            </div>
          </div>
          <p className="mt-3 text-xs text-body/50">
            E-mail du compte (non modifiable ici) :{' '}
            <span className="font-medium text-body/70">{profile.email}</span>
          </p>
        </section>

        {/* 2. Présentation = bio */}
        <section className={sectionClass}>
          <div className="mb-1 flex items-center gap-2">
            <BookOpen className="size-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold text-heading">Présentation</h2>
          </div>
          <p className="mb-3 text-sm text-body/65">
            Votre bio : parcours, style d’accompagnement, zones d’intervention. Visible pour
            l’admin lors de la validation.
          </p>
          <label htmlFor="trainer-bio" className={labelClass}>
            Bio
          </label>
          <textarea
            id="trainer-bio"
            className={textareaClass}
            rows={5}
            placeholder="Ex. : Enseignant depuis 8 ans, j’accompagne les élèves de 3e et Terminale en maths et sciences…"
            {...register('bio')}
          />
          {errors.bio ? (
            <p className="mt-1 text-sm text-error">{errors.bio.message}</p>
          ) : null}
        </section>

        {/* 3. Enseignement : classes + matières */}
        <section className={sectionClass}>
          <div className="mb-1 flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" aria-hidden />
            <h2 className="text-base font-semibold text-heading">Enseignement</h2>
          </div>
          <p className="mb-4 text-sm text-body/65">{TRAINER_LEVELS_HINT}</p>

          <fieldset>
            <legend className={labelClass}>Classes</legend>
            <p className="mb-2 text-xs text-body/55">Périmètre CHAPITRE+ uniquement.</p>
            <Controller
              name="levels"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2 sm:grid-cols-3">
                  {TRAINER_LEVEL_OPTIONS.map((level) => {
                    const checked = field.value.includes(level)
                    return (
                      <label key={level} className={checkboxRowClass}>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm rounded-none"
                          checked={checked}
                          onChange={(event) => {
                            field.onChange(
                              toggleInList(field.value, level, event.target.checked),
                            )
                          }}
                        />
                        <span className="font-medium">{level}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
            {errors.levels ? (
              <p className="mt-2 text-sm text-error">{errors.levels.message}</p>
            ) : null}
          </fieldset>

          <fieldset className="mt-5">
            <legend className={labelClass}>Matières</legend>
            <p className="mb-2 text-xs text-body/55">
              Mathématiques, Physique et Chimie — seules matières prises en compte pour ce
              parcours formateur mock.
            </p>
            <Controller
              name="subjects"
              control={control}
              render={({ field }) => (
                <div className="grid gap-2 sm:grid-cols-3">
                  {TRAINER_SUBJECT_OPTIONS.map((subject) => {
                    const checked = field.value.includes(subject)
                    return (
                      <label key={subject} className={checkboxRowClass}>
                        <input
                          type="checkbox"
                          className="checkbox checkbox-primary checkbox-sm rounded-none"
                          checked={checked}
                          onChange={(event) => {
                            field.onChange(
                              toggleInList(field.value, subject, event.target.checked),
                            )
                          }}
                        />
                        <span className="font-medium">{subject}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            />
            {errors.subjects ? (
              <p className="mt-2 text-sm text-error">{errors.subjects.message}</p>
            ) : null}
          </fieldset>

          <p className="mt-4 text-xs text-body/50">
            Sélection : {formatTrainerLevels(watchedLevels as typeof profile.levels)} —{' '}
            {formatTrainerSubjects(watchedSubjects as typeof profile.subjects)}
          </p>
        </section>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            className="btn btn-primary h-11 px-5 disabled:btn-disabled"
            disabled={!canSave}
            aria-disabled={!canSave}
          >
            Enregistrer le dossier
          </button>
          {!isDirty ? (
            <span className="text-xs text-body/50">Aucune modification</span>
          ) : !hasTeachingSelection ? (
            <span className="text-xs text-error/80">
              Sélectionnez au moins une classe et une matière.
            </span>
          ) : !isValid ? (
            <span className="text-xs text-error/80">
              Complétez les champs requis avant d’enregistrer.
            </span>
          ) : null}
        </div>
      </form>
    </div>
  )
}
