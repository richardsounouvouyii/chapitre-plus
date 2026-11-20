import { Outlet } from 'react-router-dom'
import type { Role } from '@/lib/roles'
import { AppBottomNav, AppMobileHeader, AppSidebar } from './app-shell'

type AppShellProps = {
  role: Role
}

/** Coquille des espaces connectés : sidebar desktop + header / bottom nav mobile. */
export function AppShell({ role }: AppShellProps) {
  return (
    <div className="drawer lg:drawer-open">
      <input id="app-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content flex min-h-dvh flex-col bg-page">
        <AppMobileHeader role={role} />
        <main className="app-shell-main mx-auto w-full max-w-5xl flex-1 px-4 py-5 md:px-8 md:py-8">
          <Outlet />
        </main>
        <AppBottomNav role={role} />
      </div>
      <AppSidebar role={role} />
    </div>
  )
}
