import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  UserRound,
  Wallet,
} from 'lucide-react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ROLE_LABELS, type Role } from '@/lib/roles'

type NavItem = { to: string; label: string; icon: typeof Home }

const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  STUDENT: [
    { to: '/app/eleve', label: 'Tableau de bord', icon: Home },
    { to: '/app/eleve/difficultes', label: 'Mes demandes', icon: ClipboardList },
    { to: '/app/eleve/seances', label: 'Séances', icon: CalendarDays },
    { to: '/app/eleve/documents', label: 'Documents', icon: FileText },
    { to: '/app/eleve/paiements', label: 'Paiements', icon: Wallet },
    { to: '/app/eleve/profil', label: 'Profil', icon: UserRound },
  ],
  TRAINER: [
    { to: '/app/formateur', label: 'Tableau de bord', icon: Home },
    { to: '/app/formateur/seances', label: 'Séances', icon: CalendarDays },
    { to: '/app/formateur/documents', label: 'Documents', icon: FileText },
    { to: '/app/formateur/profil', label: 'Profil', icon: UserRound },
  ],
  PARENT: [
    { to: '/app/parent', label: 'Tableau de bord', icon: Home },
    { to: '/app/parent/enfants', label: 'Enfants', icon: UserRound },
    { to: '/app/parent/paiements', label: 'Paiements', icon: Wallet },
  ],
  ADMIN: [
    { to: '/app/admin', label: 'Vue d’ensemble', icon: Home },
    { to: '/app/admin/formateurs', label: 'Formateurs', icon: UserRound },
    { to: '/app/admin/seances', label: 'Séances', icon: CalendarDays },
  ],
}

type AppShellProps = {
  role: Role
}

export function AppShell({ role }: AppShellProps) {
  const items = NAV_BY_ROLE[role]

  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-screen flex-col">
        <div className="navbar border-b border-base-300 bg-base-100 px-4 lg:hidden">
          <label htmlFor="app-drawer" className="btn btn-ghost btn-square" aria-label="Ouvrir le menu">
            <BookOpen className="size-5" />
          </label>
          <span className="ml-2 font-semibold text-primary">CHAPITRE+</span>
          <span className="badge badge-ghost ml-auto">{ROLE_LABELS[role]}</span>
        </div>
        <div className="flex-1 p-4 md:p-6">
          <Outlet />
        </div>
        <nav className="btm-nav btm-nav-sm border-t border-base-300 bg-base-100 lg:hidden">
          {items.slice(0, 4).map((item) => {
            const Icon = item.icon
            return (
              <NavLink key={item.to} to={item.to} end={item.to.split('/').length <= 3}>
                <Icon className="size-4" />
                <span className="btm-nav-label text-[10px]">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>
      </div>

      <div className="drawer-side z-40">
        <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Fermer le menu" />
        <aside className="flex min-h-full w-72 flex-col border-r border-base-300 bg-base-100 p-4">
          <Link to="/accueil" className="mb-6 flex items-center gap-2 px-2 font-semibold text-primary">
            <BookOpen className="size-6" />
            CHAPITRE+
          </Link>
          <p className="mb-2 px-2 text-xs uppercase tracking-wide text-base-content/50">
            {ROLE_LABELS[role]}
          </p>
          <ul className="menu gap-1">
            {items.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.to}>
                  <NavLink to={item.to} end={item.to.split('/').length <= 3}>
                    <Icon className="size-4" />
                    {item.label}
                  </NavLink>
                </li>
              )
            })}
          </ul>
          <div className="mt-auto pt-4">
            <Link to="/accueil" className="btn btn-ghost btn-sm w-full justify-start gap-2">
              <LogOut className="size-4" />
              Quitter (mock)
            </Link>
          </div>
        </aside>
      </div>
    </div>
  )
}
