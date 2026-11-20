import { Menu } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import logo from '@/assets/02_logo_principal.png'
import { BeninFlag } from '@/components/ui/BeninFlag'

const links = [
  { to: '/accueil', label: 'Accueil' },
  { to: '/catalogue', label: 'Séances' },
  { to: '/formateurs', label: 'Formateurs' },
  { to: '/centres', label: 'Centres' },
  { to: '/comment-ca-marche', label: 'À propos' },
  { to: '/aide', label: 'Aide' },
]

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border-light bg-surface/95 backdrop-blur">
      <div className="navbar mx-auto max-w-7xl px-4 md:px-6">
        <div className="navbar-start gap-2">
          <div className="dropdown lg:hidden">
            <button
              type="button"
              tabIndex={0}
              className="btn btn-ghost btn-square text-heading"
              aria-label="Menu"
            >
              <Menu className="size-5" />
            </button>
            <ul className="menu dropdown-content menu-sm z-50 mt-3 w-56 rounded-2xl border border-border-light bg-surface p-2 shadow-lg">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to}>{link.label}</NavLink>
                </li>
              ))}
              <li>
                <NavLink to="/connexion">Se connecter</NavLink>
              </li>
            </ul>
          </div>

          {/* Un seul logo (image déjà = icône + CHAPITRE+ + slogan) */}
          <Link to="/accueil" className="inline-flex items-center" aria-label="CHAPITRE+ — Accueil">
            <img
              src={logo}
              alt="CHAPITRE+ — Renforcement scolaire en présentiel"
              className="h-11 w-auto max-w-[220px] object-contain object-left md:h-12 md:max-w-[260px]"
            />
          </Link>
        </div>

        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal gap-0.5 px-1">
            {links.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    [
                      'rounded-full px-3 py-2 text-sm font-medium',
                      isActive
                        ? 'bg-soft-blue text-primary'
                        : 'text-heading/80 hover:bg-soft-blue/70 hover:text-primary',
                    ].join(' ')
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="navbar-end gap-2">
          {/* Badge informatif (non cliquable) — MVP Bénin uniquement */}
          <div
            className="hidden items-center gap-2 rounded-full border border-border-light bg-page px-3 py-1.5 text-sm font-medium text-heading md:inline-flex"
            title="Service disponible au Bénin"
          >
            <BeninFlag className="h-3.5 w-5 rounded-sm shadow-sm" />
            <span>Bénin</span>
          </div>

          <Link
            to="/connexion"
            className="btn btn-outline btn-primary btn-sm hidden border-primary/30 sm:inline-flex"
          >
            Se connecter
          </Link>
          <Link to="/inscription" className="btn btn-primary btn-sm">
            Créer un compte
          </Link>
        </div>
      </div>
    </header>
  )
}
