import { CalendarDays, GraduationCap, Home, UserRound } from 'lucide-react'
import { useLayoutEffect, useRef } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuthSession } from '@/features/auth/AuthSessionProvider'
import { cn } from '@/lib/utils'
import { isPublicAccountPath, PUBLIC_MOBILE_NAV } from './publicNav'
import { scrollPublicToTop } from './scrollPublicToTop'

const ICONS = {
  '/accueil': Home,
  '/catalogue': CalendarDays,
  '/formateurs': GraduationCap,
  '/connexion': UserRound,
} as const

/**
 * Barre fixe bas d’écran (mobile uniquement).
 * Alignée sur les destinations header : Accueil · Séances · Formateurs · Compte.
 */
export function PublicMobileNav() {
  const navRef = useRef<HTMLElement>(null)
  const { pathname } = useLocation()
  const { session: activeSession } = useAuthSession()

  useLayoutEffect(() => {
    const node = navRef.current
    if (!node) return

    const apply = () => {
      const height = Math.ceil(node.getBoundingClientRect().height)
      document.documentElement.style.setProperty('--public-mobile-nav-h', `${height}px`)
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--public-mobile-nav-h')
    }
  }, [])

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-light bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(15,23,42,0.06)] lg:hidden"
      aria-label="Navigation principale mobile"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-4 gap-1 px-2 py-1.5">
        {PUBLIC_MOBILE_NAV.map(({ to, label, end }) => {
          const Icon = ICONS[to]
          const isAccount = to === '/connexion'
          const target = isAccount && activeSession ? activeSession.homePath : to
          const itemLabel = isAccount && activeSession ? 'Espace' : label
          return (
            <li key={to}>
              <NavLink
                to={target}
                end={end}
                aria-label={itemLabel}
                onClick={() => scrollPublicToTop()}
                className={({ isActive }) => {
                  const active = isAccount
                    ? activeSession
                      ? pathname.startsWith('/dashboard/')
                      : isPublicAccountPath(pathname)
                    : isActive
                  return cn(
                    'flex w-full flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[11px] font-semibold transition-colors',
                    active
                      ? 'bg-primary text-primary-content'
                      : 'text-body/65 hover:bg-soft-blue hover:text-primary',
                  )
                }}
              >
                {({ isActive }) => {
                  const active = isAccount
                    ? activeSession
                      ? pathname.startsWith('/dashboard/')
                      : isPublicAccountPath(pathname)
                    : isActive
                  return (
                    <>
                      <Icon
                        className={cn('size-5', active ? 'text-primary-content' : 'text-current')}
                        aria-hidden
                        strokeWidth={active ? 2.5 : 2}
                      />
                      <span>{itemLabel}</span>
                      <span
                        className={cn(
                          'mt-0.5 h-0.5 w-5 rounded-full',
                          active ? 'bg-primary-content/90' : 'bg-transparent',
                        )}
                        aria-hidden
                      />
                    </>
                  )
                }}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
