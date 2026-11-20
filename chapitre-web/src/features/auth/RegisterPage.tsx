import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { SUPPORTED_LEVELS } from '@/features/public/curriculumLevels'
import { AuthShell } from './AuthShell'
import {
  BENIN_CITIES,
  resolveSchoolName,
  SCHOOL_OTHER_ID,
  schoolsForCity,
} from './beninLocations'
import { writeStudentMockSession } from '@/features/student/studentSession'
import { PasswordStrengthBar } from './PasswordStrengthBar'

const schema = z
  .object({
    firstName: z.string().min(2, 'Prénom trop court'),
    lastName: z.string().min(2, 'Nom trop court'),
    email: z.string().email('E-mail invalide'),
    city: z.enum(BENIN_CITIES, { message: 'Choisissez votre ville' }),
    schoolId: z.string(),
    schoolOther: z.string(),
    level: z.enum(SUPPORTED_LEVELS, { message: 'Choisissez votre classe' }),
    password: z.string().min(8, 'Au moins 8 caractères'),
    confirmPassword: z.string().min(8, 'Confirmez le mot de passe'),
    hasGuardian: z.boolean(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword'],
  })
  .refine(
    (values) =>
      values.schoolId !== SCHOOL_OTHER_ID || values.schoolOther.trim().length >= 2,
    {
      message: 'Indiquez le nom de votre établissement',
      path: ['schoolOther'],
    },
  )

type FormValues = z.infer<typeof schema>

const fieldClass =
  'input input-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const selectClass =
  'select select-bordered h-11 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1'
const labelClass = 'mb-1 block text-sm font-semibold text-heading'

export function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      city: 'Cotonou',
      schoolId: '',
      schoolOther: '',
      level: '3e',
      password: '',
      confirmPassword: '',
      hasGuardian: false,
    },
  })

  const selectedLevel = watch('level')
  const password = watch('password')
  const city = watch('city')
  const schoolId = watch('schoolId')
  const schoolOptions = schoolsForCity(city)

  useEffect(() => {
    setValue('schoolId', '')
    setValue('schoolOther', '')
  }, [city, setValue])

  const onSubmit = (values: FormValues) => {
    const schoolName = resolveSchoolName(values.city, values.schoolId, values.schoolOther)
    writeStudentMockSession({
      pendingGuardianLink: values.hasGuardian,
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      email: values.email,
      level: values.level,
      city: values.city,
      schoolId: values.schoolId || undefined,
      schoolName,
      registeredAt: new Date().toISOString(),
    })
    void navigate('/connexion', {
      state: {
        email: values.email,
        fromRegister: true,
        hasGuardian: values.hasGuardian,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        level: values.level,
        city: values.city,
        schoolId: values.schoolId || undefined,
        schoolName,
      },
      replace: false,
    })
  }

  return (
    <AuthShell
      title="Inscription élève"
      subtitle="3e et Terminale C·D — présentiel au Bénin."
      footer={
        <div className="space-y-2">
          <p>
            Déjà un compte ?{' '}
            <Link to="/connexion" className="font-semibold text-primary hover:underline">
              Se connecter
            </Link>
          </p>
          <p className="text-xs text-body/55">
            Formateur ou parent : compte créé par l’admin, puis mot de passe à la 1<sup>re</sup>{' '}
            connexion.
          </p>
        </div>
      }
    >
      <form className="space-y-3.5" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-2 gap-3">
          <label className="block min-w-0">
            <span className={labelClass}>Prénom</span>
            <input className={fieldClass} autoComplete="given-name" {...register('firstName')} />
            {errors.firstName ? (
              <span className="mt-1 block text-xs text-error">{errors.firstName.message}</span>
            ) : null}
          </label>
          <label className="block min-w-0">
            <span className={labelClass}>Nom</span>
            <input className={fieldClass} autoComplete="family-name" {...register('lastName')} />
            {errors.lastName ? (
              <span className="mt-1 block text-xs text-error">{errors.lastName.message}</span>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className={labelClass}>E-mail</span>
          <input type="email" className={fieldClass} autoComplete="email" {...register('email')} />
          {errors.email ? (
            <span className="mt-1 block text-xs text-error">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>Ville</span>
          <select className={selectClass} {...register('city')}>
            {BENIN_CITIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          {errors.city ? (
            <span className="mt-1 block text-xs text-error">{errors.city.message}</span>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>
            Établissement <span className="font-normal text-body/50">(facultatif)</span>
          </span>
          <select className={selectClass} {...register('schoolId')}>
            <option value="">— Choisir —</option>
            {schoolOptions.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </select>
        </label>

        {schoolId === SCHOOL_OTHER_ID ? (
          <label className="block">
            <span className={labelClass}>Nom de l’établissement</span>
            <input
              className={fieldClass}
              placeholder="Ex. Collège …"
              autoComplete="organization"
              {...register('schoolOther')}
            />
            {errors.schoolOther ? (
              <span className="mt-1 block text-xs text-error">{errors.schoolOther.message}</span>
            ) : null}
          </label>
        ) : null}

        <p className="text-xs leading-snug text-body/60">
          Les séances affichent toujours leur quartier (ex. Abomey-Calavi). Filtrez par ville dans
          le catalogue — vous n’êtes pas limité à votre ville de résidence.
        </p>

        <fieldset>
          <legend className={labelClass}>Classe</legend>
          <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Classe">
            {SUPPORTED_LEVELS.map((level) => {
              const active = selectedLevel === level
              return (
                <label key={level} className="cursor-pointer">
                  <input
                    type="radio"
                    value={level}
                    className="peer sr-only"
                    {...register('level')}
                  />
                  <span
                    className={[
                      'flex h-11 cursor-pointer items-center justify-center rounded-none border px-1 text-center text-sm font-semibold transition-colors',
                      'peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary',
                      active
                        ? 'border-primary bg-primary text-primary-content'
                        : 'border-slate-300 bg-white text-heading hover:border-primary/50 hover:bg-soft-blue/40',
                    ].join(' ')}
                  >
                    {level}
                  </span>
                </label>
              )
            })}
          </div>
          {errors.level ? (
            <span className="mt-1 block text-xs text-error">{errors.level.message}</span>
          ) : null}
        </fieldset>

        <label className="block">
          <span className={labelClass}>Mot de passe</span>
          <input
            type="password"
            className={fieldClass}
            autoComplete="new-password"
            {...register('password')}
          />
          <PasswordStrengthBar password={password} />
          {errors.password ? (
            <span className="mt-1 block text-xs text-error">{errors.password.message}</span>
          ) : null}
        </label>

        <label className="block">
          <span className={labelClass}>Confirmer le mot de passe</span>
          <input
            type="password"
            className={fieldClass}
            autoComplete="new-password"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <span className="mt-1 block text-xs text-error">{errors.confirmPassword.message}</span>
          ) : null}
        </label>

        <label className="flex cursor-pointer items-start gap-3 border border-slate-300 bg-page px-3 py-3">
          <input
            type="checkbox"
            className="checkbox checkbox-primary mt-0.5 rounded-none"
            {...register('hasGuardian')}
          />
          <span className="min-w-0 text-sm leading-snug text-heading">
            <span className="font-semibold">J’ai un parent / tuteur</span>
            <span className="mt-0.5 block text-xs text-body/60">
              Un lien parent sera demandé (Identity) pour les réservations et consentements mineurs.
            </span>
          </span>
        </label>

        <button
          type="submit"
          className="btn btn-primary mt-1 h-12 w-full cursor-pointer text-base font-semibold"
          disabled={isSubmitting}
        >
          Créer mon compte élève
        </button>
      </form>
    </AuthShell>
  )
}
