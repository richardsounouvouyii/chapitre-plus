import { NavLink } from 'react-router-dom'
import { ROLE_LABELS, type Role } from '@/lib/roles'
import { APP_NAV_BY_ROLE, closeAppDrawer, isAppNavEnd } from './appNav'

type AppSidebarNavProps = {
  role: Role
}

export function AppSidebarNav({ role }: AppSidebarNavProps) {
  const items = APP_NAV_BY_ROLE[role]

  return (
    <nav className="px-3 py-4" aria-label={`Navigation ${ROLE_LABELS[role]}`}>
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-body/40">
        {ROLE_LABELS[role]}
      </p>
      <ul className="flex flex-col gap-0.5">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={isAppNavEnd(item.to)}
                onClick={() => closeAppDrawer()}
                className={({ isActive }) =>
                  [
                    'app-shell-nav-link app-shell-focus flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'is-active bg-primary text-primary-content'
                      : 'text-body/80 hover:bg-soft-blue hover:text-heading',
                  ].join(' ')
                }
              >
                <Icon className="size-4 shrink-0 opacity-90" aria-hidden />
                {item.label}
              </NavLink>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
