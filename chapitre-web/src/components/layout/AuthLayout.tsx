import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { scrollPublicToTop } from './scrollPublicToTop'

/** Layout auth : viewport figé — seul le panneau formulaire scroll. */
export function AuthLayout() {
  useEffect(() => {
    scrollPublicToTop()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden bg-page">
      <Outlet />
    </div>
  )
}
