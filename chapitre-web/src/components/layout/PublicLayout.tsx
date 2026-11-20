import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'
import { PublicMobileNav } from './PublicMobileNav'
import { scrollPublicToTop } from './scrollPublicToTop'

function isSessionDetailPath(pathname: string) {
  return /^\/catalogue\/[^/]+$/.test(pathname)
}

export function PublicLayout() {
  const { pathname } = useLocation()
  const hasStickySessionBar = isSessionDetailPath(pathname)

  useEffect(() => {
    scrollPublicToTop()
  }, [pathname])

  return (
    <div className="flex min-h-dvh flex-col">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Un seul padding bas : hauteur réelle de la nav (+ bandeau séance si besoin). */}
      <div
        className={
          hasStickySessionBar
            ? 'pb-[calc(var(--public-mobile-nav-h,3.7rem)+5rem)] lg:pb-0'
            : 'pb-[var(--public-mobile-nav-h,3.7rem)] lg:pb-0'
        }
      >
        <PublicFooter />
      </div>
      <PublicMobileNav />
    </div>
  )
}
