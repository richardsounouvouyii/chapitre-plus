import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useToast } from '@/components/ui'
import { ROLE_LABELS, ROLES, type Role } from '@/lib/roles'

const schema = z.object({
  email: z.string().email('E-mail invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  rolePreview: z.enum([ROLES.STUDENT, ROLES.TRAINER, ROLES.PARENT, ROLES.ADMIN]),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      rolePreview: ROLES.STUDENT,
    },
  })

  const onSubmit = (values: FormValues) => {
    // Phase front : redirection mock selon rôle (auth réelle = Identity).
    const routes: Record<Role, string> = {
      STUDENT: '/app/eleve',
      TRAINER: '/app/formateur',
      PARENT: '/app/parent',
      ADMIN: '/app/admin',
    }
    pushToast({
      tone: 'success',
      title: 'Connexion mock',
      message: `Redirection vers l’espace ${ROLE_LABELS[values.rolePreview]}.`,
      durationMs: 3000,
    })
    void navigate(routes[values.rolePreview])
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Connexion</h1>
      <p className="mt-2 text-sm text-base-content/70">
        UI + validation Zod. Authentification réelle à la phase Identity.
      </p>
      <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label className="form-control w-full">
          <span className="label-text mb-1">E-mail</span>
          <input
            type="email"
            className="input input-bordered w-full"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && <span className="mt-1 text-sm text-error">{errors.email.message}</span>}
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-1">Mot de passe</span>
          <input
            type="password"
            className="input input-bordered w-full"
            autoComplete="current-password"
            {...register('password')}
          />
          {errors.password && (
            <span className="mt-1 text-sm text-error">{errors.password.message}</span>
          )}
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-1">Aperçu rôle (mock)</span>
          <select className="select select-bordered w-full" {...register('rolePreview')}>
            {(Object.keys(ROLE_LABELS) as Role[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary w-full">
          Continuer (mock)
        </button>
      </form>
      <p className="mt-6 text-sm">
        Pas encore de compte ?{' '}
        <Link to="/inscription" className="link link-primary">
          S’inscrire
        </Link>
      </p>
    </div>
  )
}
