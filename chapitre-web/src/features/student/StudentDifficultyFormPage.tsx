import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { STUDENT_PATHS } from '@/components/layout/app-shell/appNav'
import { useToast } from '@/components/ui'
import { createDifficultyRequest } from '@/features/difficulties/mocks'
import { subjectsForLevel } from '@/features/difficulties/subjects'
import { isSupportedLevel, type SupportedLevel } from '@/features/public/curriculumLevels'
import { readStudentMockSession } from './studentSession'
import { StudentPageHeader } from './StudentPageHeader'

const schema = z.object({
  subject: z.string().min(1, 'Choisissez une matière'),
  chapter: z.string().trim().min(2, 'Indiquez le chapitre').max(120, 'Chapitre trop long'),
  notion: z
    .string()
    .trim()
    .min(10, 'Décrivez la notion (au moins 10 caractères)')
    .max(800, 'Description trop longue'),
  preferences: z.string().trim().max(240, 'Préférences trop longues').optional().or(z.literal('')),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'input input-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const selectClass =
  'select select-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const textareaClass =
  'textarea textarea-bordered min-h-28 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const labelClass = 'mb-1 block text-sm font-semibold text-heading'

function resolveStudentLevel(raw?: string): SupportedLevel {
  return raw && isSupportedLevel(raw) ? raw : '3e'
}

export function StudentDifficultyFormPage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const session = readStudentMockSession()
  const level = resolveStudentLevel(session.level)
  const subjectOptions = subjectsForLevel(level)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      subject: '',
      chapter: '',
      notion: '',
      preferences: '',
    },
  })

  const onSubmit = (values: FormValues) => {
    createDifficultyRequest({
      level,
      subject: values.subject,
      chapter: values.chapter,
      notion: values.notion,
      preferences: values.preferences?.trim() || undefined,
    })
    pushToast({
      tone: 'success',
      title: 'Demande envoyée',
      message: 'Votre difficulté a été enregistrée (mock). Statut : soumise.',
      durationMs: 4000,
    })
    void navigate(STUDENT_PATHS.demandes)
  }

  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <StudentPageHeader
        title="Nouvelle demande"
        description="Décrivez votre difficulté en texte uniquement — aucun import de fichier."
      />

      <form
        className="mt-6 space-y-4 border border-border-light bg-surface p-4 sm:p-6"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <label className="block">
          <span className={labelClass}>Matière</span>
          <select className={selectClass} {...register('subject')} defaultValue="">
            <option value="" disabled>
              Choisir une matière
            </option>
            {subjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
          {errors.subject ? (
            <p className="mt-1.5 text-sm text-error">{errors.subject.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>Chapitre</span>
          <input
            type="text"
            className={fieldClass}
            placeholder="Ex. Équations du second degré"
            autoComplete="off"
            {...register('chapter')}
          />
          {errors.chapter ? (
            <p className="mt-1.5 text-sm text-error">{errors.chapter.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>Notion / difficulté</span>
          <textarea
            className={textareaClass}
            placeholder="Expliquez ce que vous n’avez pas compris…"
            {...register('notion')}
          />
          {errors.notion ? (
            <p className="mt-1.5 text-sm text-error">{errors.notion.message}</p>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>
            Préférences <span className="font-normal text-body/50">(facultatif)</span>
          </span>
          <input
            type="text"
            className={fieldClass}
            placeholder="Ex. week-end, après 16 h, centre Calavi…"
            autoComplete="off"
            {...register('preferences')}
          />
          {errors.preferences ? (
            <p className="mt-1.5 text-sm text-error">{errors.preferences.message}</p>
          ) : null}
        </label>

        <p className="text-xs leading-relaxed text-body/55">
          Aucun fichier ne peut être joint. Un formateur pourra vous proposer une séance en
          présentiel après étude de la demande.
        </p>

        <div className="flex flex-col gap-2 pt-2 sm:flex-row">
          <button
            type="submit"
            className="btn btn-primary h-11 w-full px-4 sm:flex-1"
            disabled={isSubmitting}
          >
            Envoyer la demande
          </button>
          <Link
            to={STUDENT_PATHS.demandes}
            className="btn btn-outline btn-primary h-11 w-full px-4 sm:w-auto"
          >
            Annuler
          </Link>
        </div>
      </form>
    </div>
  )
}
