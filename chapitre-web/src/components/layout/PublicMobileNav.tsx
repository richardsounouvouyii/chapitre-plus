import { CalendarDays, Home, PencilLine, UserRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'

const items = [
  { to: '/accueil', label: 'Accueil', icon: Home, end: true },
  { to: '/catalogue', label: 'Séances', icon: CalendarDays, end: false },
  { to: '/inscription', label: 'Demande', icon: PencilLine, end: false },
  { to: '/connexion', label: 'Compte', icon: UserRound, end: false },
]

/**
 * Barre fixe bas d’écran (mobile uniquement).
 * Actions les plus fréquentes : naviguer, voir séances, démarrer une demande, se connecter.
 */
export function PublicMobileNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-light bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      aria-label="Navigation principale mobile"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center gap-0.5 px-1 py-2.5 text-[11px] font-medium transition',
                  isActive ? 'text-primary' : 'text-body/55 hover:text-primary',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'flex size-9 items-center justify-center rounded-xl transition',
                      isActive ? 'bg-soft-blue text-primary' : 'bg-transparent',
                    )}
                  >
                    <Icon className="size-5" aria-hidden />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
