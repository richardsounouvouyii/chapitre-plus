import { Outlet } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { PublicMobileNav } from './PublicMobileNav'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      {/* pb = hauteur barre mobile pour ne pas masquer le contenu / footer */}
      <main className="flex-1 pb-20 lg:pb-0">
        <Outlet />
      </main>
      <div className="pb-20 lg:pb-0">
        <PublicFooter />
      </div>
      <PublicMobileNav />
    </div>
  )
}
