import { ShieldCheck, UserRound, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PARENT_PATHS } from '@/components/layout/app-shell/appNav'
import { AlertBanner } from '@/components/ui'

const NEXT_STEPS = [
  {
    to: PARENT_PATHS.enfants,
    title: 'Enfants liés',
    text: 'Voir et gérer le lien avec votre enfant (après vérification Identity).',
    icon: UserRound,
  },
  {
    to: PARENT_PATHS.enfants,
    title: 'Autorisations',
    text: 'Consentements pour réservations et séances du mineur.',
    icon: ShieldCheck,
  },
  {
    to: PARENT_PATHS.paiements,
    title: 'Paiements',
    text: 'Suivre les paiements et remboursements liés à votre enfant.',
    icon: Wallet,
  },
] as const

export function ParentDashboard() {
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace parent / tuteur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading md:text-3xl">
          Tableau de bord
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body/70">
          Lien enfant, consentements et paiements — dédié aux mineurs, distinct de l’espace élève
          et formateur.
        </p>
      </header>

      <AlertBanner tone="warning" title="Lien parent requis" className="mt-6">
        Les réservations d’un élève mineur peuvent nécessiter votre approbation. Le rattachement
        réel sera géré par Identity.
      </AlertBanner>

      <section className="mt-8" aria-label="Actions parent">
        <h2 className="mb-3 text-base font-semibold text-heading">Suivi familial</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {NEXT_STEPS.map(({ to, title, text, icon: Icon }) => (
            <li key={`${to}-${title}`}>
              <Link
                to={to}
                className="flex h-full cursor-pointer flex-col border border-border-light bg-surface p-5 transition-colors hover:border-primary/40 hover:bg-soft-blue/25"
              >
                <Icon className="size-5 text-primary" aria-hidden />
                <span className="mt-3 font-semibold text-heading">{title}</span>
                <span className="mt-1.5 text-sm leading-relaxed text-body/65">{text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
