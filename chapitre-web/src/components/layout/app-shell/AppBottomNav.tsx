import { useLayoutEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/roles'
import { isAppNavEnd, mobileNavItemsForRole } from './appNav'

type AppBottomNavProps = {
  role: Role
}

/**
 * Barre fixe bas d’écran (mobile) — onglets bordés, actif contrasté.
 */
export function AppBottomNav({ role }: AppBottomNavProps) {
  const navRef = useRef<HTMLElement>(null)
  const items = mobileNavItemsForRole(role)
  const cols = Math.min(Math.max(items.length, 3), 5)

  useLayoutEffect(() => {
    const node = navRef.current
    if (!node) return

    const apply = () => {
      const height = Math.ceil(node.getBoundingClientRect().height)
      document.documentElement.style.setProperty('--app-mobile-nav-h', `${height}px`)
    }

    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => {
      observer.disconnect()
      document.documentElement.style.removeProperty('--app-mobile-nav-h')
    }
  }, [items.length])

  return (
    <nav
      ref={navRef}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border-light bg-page/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgba(7,27,73,0.08)] backdrop-blur-sm lg:hidden"
      aria-label="Navigation principale mobile"
    >
      <ul
        className="mx-auto grid max-w-lg gap-1.5 px-2 py-2"
        style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      >
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to} className="min-w-0">
              <NavLink
                to={item.to}
                end={isAppNavEnd(item.to)}
                aria-label={item.label}
                className={({ isActive }) =>
                  cn(
                    'app-shell-focus flex w-full flex-col items-center gap-0.5 border px-0.5 py-2 text-[10px] font-semibold transition-colors sm:text-[11px]',
                    isActive
                      ? 'border-primary bg-primary text-primary-content shadow-sm'
                      : 'border-border-light bg-surface text-body/70 hover:border-primary/35 hover:bg-soft-blue hover:text-heading',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'size-5 shrink-0',
                        isActive ? 'text-primary-content' : 'text-primary/80',
                      )}
                      aria-hidden
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="max-w-full truncate leading-tight">
                      {item.shortLabel ?? item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
