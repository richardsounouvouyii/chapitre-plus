import { CalendarDays, FileText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TRAINER_PATHS } from '@/components/layout/app-shell/appNav'
import { AlertBanner } from '@/components/ui'

const NEXT_STEPS = [
  {
    to: TRAINER_PATHS.profil,
    title: 'Dossier de validation',
    text: 'Compléter le profil pour passer en formateur approuvé.',
    icon: ShieldCheck,
  },
  {
    to: TRAINER_PATHS.seances,
    title: 'Séances',
    text: 'Créer et suivre vos séances en présentiel (après validation).',
    icon: CalendarDays,
  },
  {
    to: TRAINER_PATHS.documents,
    title: 'Supports',
    text: 'Importer PDF / images pour les élèves inscrits.',
    icon: FileText,
  },
] as const

export function TrainerDashboard() {
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace formateur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading md:text-3xl">
          Tableau de bord
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body/70">
          Vérification du profil, disponibilités, séances et documents — parcours distinct de
          l’espace élève.
        </p>
      </header>

      <AlertBanner tone="info" title="Compte formateur" className="mt-6">
        Un formateur non validé ne peut pas publier d’offre payante. La validation admin arrivera
        avec Trainer-service.
      </AlertBanner>

      <section className="mt-8" aria-label="Prochaines étapes">
        <h2 className="mb-3 text-base font-semibold text-heading">À préparer</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {NEXT_STEPS.map(({ to, title, text, icon: Icon }) => (
            <li key={to}>
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
