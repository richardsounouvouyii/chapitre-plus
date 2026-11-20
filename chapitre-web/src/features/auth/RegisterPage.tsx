import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useToast } from '@/components/ui'
import { ROLE_LABELS, ROLES, type Role } from '@/lib/roles'

const schema = z.object({
  fullName: z.string().min(2, 'Nom trop court'),
  email: z.string().email('E-mail invalide'),
  password: z.string().min(8, 'Au moins 8 caractères'),
  role: z.enum([ROLES.STUDENT, ROLES.TRAINER, ROLES.PARENT]),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const navigate = useNavigate()
  const { pushToast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      role: ROLES.STUDENT,
    },
  })

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Inscription</h1>
      <p className="mt-2 text-sm text-base-content/70">
        Formulaire prêt ; création de compte réelle à la phase Identity.
      </p>
      <form
        className="mt-8 space-y-4"
        onSubmit={handleSubmit(() => {
          pushToast({
            tone: 'success',
            title: 'Compte prêt (mock)',
            message: 'Vous pouvez vous connecter pour prévisualiser votre espace.',
          })
          void navigate('/connexion')
        })}
        noValidate
      >
        <label className="form-control w-full">
          <span className="label-text mb-1">Nom complet</span>
          <input className="input input-bordered w-full" {...register('fullName')} />
          {errors.fullName && (
            <span className="mt-1 text-sm text-error">{errors.fullName.message}</span>
          )}
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-1">E-mail</span>
          <input type="email" className="input input-bordered w-full" {...register('email')} />
          {errors.email && <span className="mt-1 text-sm text-error">{errors.email.message}</span>}
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-1">Mot de passe</span>
          <input
            type="password"
            className="input input-bordered w-full"
            {...register('password')}
          />
          {errors.password && (
            <span className="mt-1 text-sm text-error">{errors.password.message}</span>
          )}
        </label>
        <label className="form-control w-full">
          <span className="label-text mb-1">Je suis</span>
          <select className="select select-bordered w-full" {...register('role')}>
            {([ROLES.STUDENT, ROLES.TRAINER, ROLES.PARENT] as Role[]).map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn btn-primary w-full">
          Créer mon compte (mock)
        </button>
      </form>
      <p className="mt-6 text-sm">
        Déjà inscrit ?{' '}
        <Link to="/connexion" className="link link-primary">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
