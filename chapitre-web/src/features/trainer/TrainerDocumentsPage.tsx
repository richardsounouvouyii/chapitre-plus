import { zodResolver } from '@hookform/resolvers/zod'
import { FileText, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { TRAINER_PATHS, trainerSessionPath } from '@/components/layout/app-shell/appNav'
import { StatusBadge, useToast } from '@/components/ui'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { DEMO_CREDENTIALS } from '@/features/auth/demoAuth'
import {
  createTrainerResource,
  ensureDemoTrainerResources,
  isResourceVisibleNow,
  listTrainerResources,
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
  RESOURCE_FORMATS,
  RESOURCE_WINDOW_LABELS,
  RESOURCE_WINDOWS,
  type TrainerResource,
} from './trainerResources'
import {
  ensureDemoTrainerSessions,
  formatSessionWhen,
  listTrainerSessions,
  SESSION_STATUSES,
  type TrainerSession,
} from './trainerSessions'

const schema = z.object({
  sessionId: z.string().min(1, 'Séance requise'),
  title: z.string().trim().min(3, 'Titre trop court').max(120),
  category: z.enum([
    RESOURCE_CATEGORIES.PREPARATION,
    RESOURCE_CATEGORIES.EXERCISE,
    RESOURCE_CATEGORIES.SUMMARY,
    RESOURCE_CATEGORIES.METHOD,
    RESOURCE_CATEGORIES.CORRECTION,
  ]),
  format: z.enum(RESOURCE_FORMATS),
  window: z.enum([
    RESOURCE_WINDOWS.BEFORE,
    RESOURCE_WINDOWS.DURING,
    RESOURCE_WINDOWS.AFTER,
  ]),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'input input-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none'
const selectClass =
  'select select-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none'
const labelClass = 'mb-1 block text-sm font-semibold text-heading'

function eligibleSessions(sessions: TrainerSession[]): TrainerSession[] {
  return sessions.filter(
    (item) =>
      item.status === SESSION_STATUSES.PUBLISHED ||
      item.status === SESSION_STATUSES.FULL ||
      item.status === SESSION_STATUSES.COMPLETED,
  )
}

export function TrainerDocumentsPage() {
  const { session } = useAuthSession()
  const { pushToast } = useToast()
  const [searchParams, setSearchParams] = useSearchParams()
  const email = session?.email ?? DEMO_CREDENTIALS.TRAINER.email
  const filterSessionId = searchParams.get('sessionId') ?? ''

  const [sessions, setSessions] = useState<TrainerSession[]>([])
  const [resources, setResources] = useState<TrainerResource[]>([])
  const [showForm, setShowForm] = useState(false)

  const refresh = () => {
    const seeded = ensureDemoTrainerSessions(email)
    setSessions(seeded)
    setResources(ensureDemoTrainerResources(email))
  }

  useEffect(() => {
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- email only
  }, [email])

  const eligible = useMemo(() => eligibleSessions(sessions), [sessions])
  const sessionTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const item of sessions) map.set(item.id, item.title)
    return map
  }, [sessions])

  const visibleResources = useMemo(
    () =>
      filterSessionId
        ? resources.filter((item) => item.sessionId === filterSessionId)
        : resources,
    [filterSessionId, resources],
  )

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sessionId: filterSessionId || eligible[0]?.id || '',
      title: '',
      category: RESOURCE_CATEGORIES.PREPARATION,
      format: 'PDF',
      window: RESOURCE_WINDOWS.BEFORE,
    },
  })

  useEffect(() => {
    if (filterSessionId) {
      reset((values) => ({ ...values, sessionId: filterSessionId }))
    }
  }, [filterSessionId, reset])

  const onSubmit = (values: FormValues) => {
    try {
      createTrainerResource({
        trainerEmail: email,
        sessionId: values.sessionId,
        title: values.title,
        category: values.category,
        format: values.format,
        window: values.window,
      })
      setResources(listTrainerResources(email))
      setShowForm(false)
      reset({
        sessionId: values.sessionId,
        title: '',
        category: RESOURCE_CATEGORIES.PREPARATION,
        format: 'PDF',
        window: RESOURCE_WINDOWS.BEFORE,
      })
      pushToast({
        tone: 'success',
        title: 'Support ajouté',
        message: 'Métadonnées mock — pas d’upload binaire réel.',
        durationMs: 3500,
      })
    } catch (error) {
      pushToast({
        tone: 'error',
        title: 'Ajout refusé',
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        durationMs: 4000,
      })
    }
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-heading">Supports</h1>
          <button
            type="button"
            className="btn btn-primary h-10 gap-2 px-4"
            onClick={() => setShowForm((value) => !value)}
            disabled={eligible.length === 0}
          >
            <Plus className="size-4" aria-hidden />
            {showForm ? 'Fermer' : 'Ajouter (mock)'}
          </button>
        </div>
        <p className="mt-2 text-sm text-body/65">
          PDF / JPG / PNG / WEBP liés à une séance. Visibilité via <code>visible_at</code> (avant /
          pendant / après). Pas d’upload élève.
        </p>
      </header>

      {eligible.length === 0 ? (
        <p className="mt-4 border border-warning/30 bg-warning/5 px-4 py-3 text-sm text-heading">
          Aucune séance publiée ou clôturée. Faites approuver un tarif admin, puis revenez ici.
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par séance">
        <button
          type="button"
          role="tab"
          aria-selected={!filterSessionId}
          className={`btn btn-sm h-9 ${!filterSessionId ? 'btn-primary' : 'btn-ghost border border-border-light'}`}
          onClick={() => setSearchParams({})}
        >
          Toutes
        </button>
        {eligible.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={filterSessionId === item.id}
            className={`btn btn-sm h-9 max-w-[14rem] truncate ${filterSessionId === item.id ? 'btn-primary' : 'btn-ghost border border-border-light'}`}
            onClick={() => setSearchParams({ sessionId: item.id })}
          >
            {item.title}
          </button>
        ))}
      </div>

      {showForm ? (
        <form
          className="mt-5 space-y-3 border border-border-light bg-surface p-4 sm:p-5"
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event)
          }}
          noValidate
        >
          <div>
            <label htmlFor="doc-session" className={labelClass}>
              Séance
            </label>
            <select id="doc-session" className={selectClass} {...register('sessionId')}>
              {eligible.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.title} · {formatSessionWhen(item)}
                </option>
              ))}
            </select>
            {errors.sessionId ? (
              <p className="mt-1 text-sm text-error">{errors.sessionId.message}</p>
            ) : null}
          </div>
          <div>
            <label htmlFor="doc-title" className={labelClass}>
              Titre
            </label>
            <input id="doc-title" className={fieldClass} {...register('title')} />
            {errors.title ? (
              <p className="mt-1 text-sm text-error">{errors.title.message}</p>
            ) : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label htmlFor="doc-category" className={labelClass}>
                Catégorie
              </label>
              <select id="doc-category" className={selectClass} {...register('category')}>
                {Object.entries(RESOURCE_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doc-format" className={labelClass}>
                Format
              </label>
              <select id="doc-format" className={selectClass} {...register('format')}>
                {RESOURCE_FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="doc-window" className={labelClass}>
                Fenêtre
              </label>
              <select id="doc-window" className={selectClass} {...register('window')}>
                {Object.entries(RESOURCE_WINDOW_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary h-10 px-4"
            disabled={isSubmitting || eligible.length === 0}
          >
            Enregistrer le support
          </button>
        </form>
      ) : null}

      {visibleResources.length === 0 ? (
        <div className="mt-6 border border-dashed border-border-light bg-page px-5 py-10 text-center">
          <FileText className="mx-auto size-8 text-body/35" aria-hidden />
          <p className="mt-3 text-sm font-medium text-heading">Aucun support</p>
          <p className="mt-1 text-sm text-body/60">Ajoutez un document lié à une séance éligible.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {visibleResources.map((resource) => {
            const open = isResourceVisibleNow(resource)
            return (
              <li key={resource.id} className="border border-border-light bg-surface p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-heading">{resource.title}</h2>
                    <p className="mt-1 text-sm text-body/65">
                      {RESOURCE_CATEGORY_LABELS[resource.category]} · {resource.format}
                    </p>
                    <p className="mt-1 text-sm text-body/55">
                      {RESOURCE_WINDOW_LABELS[resource.window]} · visible_at{' '}
                      {new Date(resource.visibleAt).toLocaleString('fr-BJ', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="mt-1 text-xs text-body/45 font-mono">{resource.fileName}</p>
                    <Link
                      to={trainerSessionPath(resource.sessionId)}
                      className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      {sessionTitleById.get(resource.sessionId) ?? 'Séance'} →
                    </Link>
                  </div>
                  <StatusBadge
                    label={open ? 'Visible maintenant' : 'Pas encore visible'}
                    variant={open ? 'success' : 'warning'}
                    size="sm"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <p className="mt-6 text-center text-sm">
        <Link to={TRAINER_PATHS.seances} className="font-medium text-primary hover:underline">
          Retour aux séances
        </Link>
      </p>
    </div>
  )
}
