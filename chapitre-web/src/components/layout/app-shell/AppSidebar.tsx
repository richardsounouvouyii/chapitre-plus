import type { Role } from '@/lib/roles'
import { AppSidebarBrand } from './AppSidebarBrand'
import { AppSidebarFooter } from './AppSidebarFooter'
import { AppSidebarNav } from './AppSidebarNav'

type AppSidebarProps = {
  role: Role
}

export function AppSidebar({ role }: AppSidebarProps) {
  return (
    <div className="drawer-side z-[60]">
      <label htmlFor="app-drawer" className="drawer-overlay" aria-label="Fermer le menu" />
      <aside
        className="flex min-h-full w-[min(17.5rem,85vw)] flex-col border-r border-border-light bg-surface"
        aria-label="Menu latéral"
      >
        <AppSidebarBrand role={role} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AppSidebarNav role={role} />
        </div>
        <AppSidebarFooter role={role} />
      </aside>
    </div>
  )
}
