import { Menu, X } from 'lucide-react'
import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import logo from '@/assets/logo_chapitre_plus.sm.webp'
import { BeninFlag } from '@/components/ui/BeninFlag'

const links = [
  { to: '/accueil', label: 'Accueil' },
  { to: '/catalogue', label: 'Séances' },
  { to: '/formateurs', label: 'Formateurs' },
  { to: '/centres', label: 'Centres' },
  { to: '/comment-ca-marche', label: 'À propos' },
  { to: '/aide', label: 'Aide' },
]

/** Délai avant d’accepter clic/scroll sur le voile (évite la fermeture du même tap qui ouvre). */
const OVERLAY_ARM_MS = 280

export function PublicHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [overlayArmed, setOverlayArmed] = useState(false)
  const menuId = useId()
  const location = useLocation()
  const armTimerRef = useRef<number | null>(null)

  useEffect(() => {
    setMenuOpen(false)
    setOverlayArmed(false)
  }, [location.pathname])

  useEffect(() => {
    if (!menuOpen) {
      setOverlayArmed(false)
      if (armTimerRef.current) {
        window.clearTimeout(armTimerRef.current)
        armTimerRef.current = null
      }
      return
    }

    // Le voile ignore les événements pendant le tap d’ouverture
    setOverlayArmed(false)
    armTimerRef.current = window.setTimeout(() => {
      setOverlayArmed(true)
      armTimerRef.current = null
    }, OVERLAY_ARM_MS)

    return () => {
      if (armTimerRef.current) {
        window.clearTimeout(armTimerRef.current)
        armTimerRef.current = null
      }
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen || !overlayArmed) return

    const close = () => setMenuOpen(false)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('scroll', close, { passive: true, capture: true })
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('keydown', onKey)
    }
  }, [menuOpen, overlayArmed])

  const closeMenu = () => {
    setMenuOpen(false)
    setOverlayArmed(false)
  }

  const toggleMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    event.stopPropagation()
    setMenuOpen((open) => !open)
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border-light bg-surface/95 backdrop-blur">
        <div className="navbar mx-auto max-w-7xl px-4 md:px-6">
          <div className="navbar-start gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-square text-heading lg:hidden"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={toggleMenu}
              onPointerDown={(event: PointerEvent<HTMLButtonElement>) => event.stopPropagation()}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>

            <Link to="/accueil" className="inline-flex items-center" aria-label="CHAPITRE+ — Accueil">
              <img
                src={logo}
                alt="CHAPITRE+ — Renforcement scolaire en présentiel"
                className="h-11 w-auto max-w-[160px] object-contain object-left sm:h-12 sm:max-w-[180px] md:h-14 md:max-w-[200px]"
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
            <div
              className="inline-flex items-center gap-1.5 rounded-full border border-border-light bg-page px-2.5 py-1 text-xs font-medium text-heading sm:gap-2 sm:px-3 sm:py-1.5 sm:text-sm"
              title="Service disponible au Bénin"
            >
              <BeninFlag className="h-3.5 w-5 rounded-sm shadow-sm" />
              <span>Bénin</span>
            </div>

            <Link
              to="/connexion"
              className="btn btn-outline btn-primary btn-sm hidden border-primary/30 md:inline-flex"
            >
              Se connecter
            </Link>
            <Link to="/inscription" className="btn btn-primary btn-sm hidden md:inline-flex">
              Créer un compte
            </Link>
          </div>
        </div>

        {menuOpen ? (
          <div
            id={menuId}
            className="border-t border-border-light bg-surface shadow-md lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Menu de navigation"
            onClick={(event) => event.stopPropagation()}
          >
            <ul className="menu mx-auto max-w-7xl gap-0.5 px-3 py-3">
              {links.map((link) => (
                <li key={link.to}>
                  <NavLink
                    to={link.to}
                    className={({ isActive }) =>
                      isActive ? 'bg-soft-blue font-medium text-primary' : 'text-heading'
                    }
                    onClick={closeMenu}
                  >
                    {link.label}
                  </NavLink>
                </li>
              ))}
              <li className="mt-1 border-t border-border-light pt-2 md:hidden">
                <NavLink to="/connexion" onClick={closeMenu}>
                  Se connecter
                </NavLink>
              </li>
              <li className="md:hidden">
                <NavLink to="/inscription" className="font-semibold text-primary" onClick={closeMenu}>
                  Créer un compte
                </NavLink>
              </li>
            </ul>
          </div>
        ) : null}
      </header>

      {menuOpen
        ? createPortal(
            <div
              className={`fixed inset-0 z-40 bg-heading/30 lg:hidden ${
                overlayArmed ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
              aria-hidden={!overlayArmed}
              onClick={() => {
                if (overlayArmed) closeMenu()
              }}
              onWheel={() => {
                if (overlayArmed) closeMenu()
              }}
            />,
            document.body,
          )
        : null}
    </>
  )
}
