import { CalendarDays, ClipboardList, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ADMIN_PATHS } from '@/components/layout/app-shell/appNav'
import { AlertBanner } from '@/components/ui'

const QUEUES = [
  {
    to: ADMIN_PATHS.formateurs,
    title: 'Formateurs',
    text: 'Valider ou rejeter les dossiers en attente.',
    icon: Users,
  },
  {
    to: ADMIN_PATHS.seances,
    title: 'Séances & tarifs',
    text: 'Approuver les tarifs avant publication payante.',
    icon: CalendarDays,
  },
  {
    to: ADMIN_PATHS.home,
    title: 'Audit',
    text: 'Consultations d’audit métier (RG-12) par service propriétaire.',
    icon: ClipboardList,
  },
] as const

export function AdminDashboard() {
  return (
    <div className="mx-auto max-w-5xl animate-fade-up">
      <header className="border-b border-border-light pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/70">
          Espace administrateur
        </p>
        <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-heading md:text-3xl">
          Vue d’ensemble
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-body/70">
          Supervision plateforme : formateurs, tarifs, séances et audit — pas le même parcours
          qu’élève ou formateur.
        </p>
      </header>

      <AlertBanner tone="info" title="Supervision" className="mt-6">
        Les actions sensibles (validation formateur, tarif, annulation) devront être journalisées
        dans l’audit local de chaque service.
      </AlertBanner>

      <section className="mt-8" aria-label="Files d’attente">
        <h2 className="mb-3 text-base font-semibold text-heading">Priorités admin</h2>
        <ul className="grid gap-3 md:grid-cols-3">
          {QUEUES.map(({ to, title, text, icon: Icon }) => (
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
