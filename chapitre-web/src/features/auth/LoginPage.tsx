import { zodResolver } from '@hookform/resolvers/zod'
import { GraduationCap, Shield, UserRound, Users } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import type { Role } from '@/lib/roles'
import { ROLES } from '@/lib/roles'
import { AuthShell } from './AuthShell'
import {
  DEMO_CREDENTIALS,
  DEMO_ROLE_ENTRIES,
  DEMO_ROLE_HOME,
  demoRoleLabel,
} from './demoAuth'

const schema = z.object({
  email: z.string().email('E-mail invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
})

type FormValues = z.infer<typeof schema>

const fieldClass =
  'input input-bordered h-12 w-full rounded-none border border-slate-300 bg-white focus:border-primary focus:outline-none'
const labelClass = 'mb-1.5 block text-sm font-semibold text-heading'

const DEMO_ICONS: Record<Role, typeof GraduationCap> = {
  STUDENT: GraduationCap,
  TRAINER: Users,
  PARENT: UserRound,
  ADMIN: Shield,
}

type ConnexionLocationState = { email?: string; fromRegister?: boolean }

export function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const registerState = (location.state as ConnexionLocationState | null) ?? null
  const emailRef = useRef<HTMLInputElement | null>(null)
  const flashTimerRef = useRef<number | null>(null)
  const [demoRole, setDemoRole] = useState<Role>(ROLES.STUDENT)
  const [fieldsFlash, setFieldsFlash] = useState(false)
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: registerState?.email ?? '',
      password: '',
    },
  })

  const { ref: emailRegisterRef, ...emailRegister } = register('email')

  const flashFields = useCallback(() => {
    setFieldsFlash(false)
    window.requestAnimationFrame(() => {
      setFieldsFlash(true)
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
      flashTimerRef.current = window.setTimeout(() => setFieldsFlash(false), 950)
    })
  }, [])

  useEffect(() => {
    if (registerState?.email) {
      setValue('email', registerState.email, { shouldValidate: true })
      flashFields()
      emailRef.current?.focus()
    }
    return () => {
      if (flashTimerRef.current) window.clearTimeout(flashTimerRef.current)
    }
  }, [flashFields, registerState?.email, setValue])

  const fillDemoCredentials = (role: Role) => {
    if (!import.meta.env.DEV) return
    const creds = DEMO_CREDENTIALS[role]
    setDemoRole(role)
    setValue('email', creds.email, { shouldValidate: true, shouldDirty: true })
    setValue('password', creds.password, { shouldValidate: true, shouldDirty: true })
    flashFields()
    emailRef.current?.focus()
    emailRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }

  const onSubmit = (_values: FormValues) => {
    void navigate(DEMO_ROLE_HOME[demoRole])
  }

  const inputClass = [fieldClass, fieldsFlash ? 'animate-field-flash' : ''].filter(Boolean).join(' ')

  return (
    <AuthShell
      title="Bon retour"
      subtitle="Connexion à votre espace CHAPITRE+."
      footer={
        <p>
          Pas encore de compte élève ?{' '}
          <Link to="/inscription" className="font-semibold text-primary hover:underline">
            S’inscrire
          </Link>
        </p>
      }
    >
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="block">
          <span className={labelClass}>E-mail</span>
          <input
            type="email"
            className={inputClass}
            autoComplete="email"
            {...emailRegister}
            ref={(node) => {
              emailRegisterRef(node)
              emailRef.current = node
            }}
          />
          {errors.email ? (
            <span className="mt-1.5 block text-sm text-error">{errors.email.message}</span>
          ) : null}
        </label>

        <label className="block">
          <div className="mb-1.5 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-heading">Mot de passe</span>
            <span className="text-xs text-body/50">
              Invité : défini à la 1<sup>re</sup> connexion
            </span>
          </div>
          <input
            type="password"
            className={inputClass}
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password ? (
            <span className="mt-1.5 block text-sm text-error">{errors.password.message}</span>
          ) : null}
        </label>

        <button
          type="submit"
          className="btn btn-primary mt-2 h-12 w-full cursor-pointer text-base font-semibold"
          disabled={isSubmitting}
        >
          Se connecter
          {demoRole !== ROLES.STUDENT ? ` · ${demoRoleLabel(demoRole)}` : ''}
        </button>
      </form>

      {import.meta.env.DEV ? (
        <div className="mt-6">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border-light" />
            <span className="text-xs font-semibold uppercase tracking-wide text-body/45">
              Accès démo
            </span>
            <span className="h-px flex-1 bg-border-light" />
          </div>
          <p className="mt-2 text-center text-xs text-body/55">
            Cliquez un rôle pour remplir les champs, puis Se connecter
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {DEMO_ROLE_ENTRIES.map(({ role, hint }) => {
              const Icon = DEMO_ICONS[role]
              const selected = demoRole === role
              return (
                <li key={role}>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials(role)}
                    className={[
                      'group flex h-full w-full cursor-pointer items-start gap-2.5 border bg-page px-2.5 py-2.5 text-left transition-all',
                      selected
                        ? 'border-primary bg-soft-blue/50 ring-1 ring-primary/30'
                        : 'border-border-light hover:border-primary hover:bg-soft-blue/40',
                    ].join(' ')}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center bg-soft-blue text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-heading">
                        {demoRoleLabel(role)}
                      </span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-body/55">
                        {hint}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </AuthShell>
  )
}
