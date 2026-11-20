import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import hero640 from '@/assets/01_photo_accueil_eleves-640.webp'
import hero960 from '@/assets/01_photo_accueil_eleves-960.webp'
import hero1280 from '@/assets/01_photo_accueil_eleves-1280.webp'
import logo from '@/assets/logo_chapitre_plus.sm.webp'

type AuthShellProps = {
  title: string
  /** Toujours une seule ligne (laptop inclus). */
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

/**
 * Auth plein écran : photo gauche (desktop), bandeau photo (mobile),
 * formulaire droite. Barre « Retour » hors scroll.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="grid h-full min-h-0 lg:grid-cols-2">
      <aside className="relative hidden min-h-0 overflow-hidden lg:block">
        <img
          src={hero960}
          srcSet={`${hero640} 640w, ${hero960} 960w, ${hero1280} 1280w`}
          sizes="50vw"
          alt=""
          className="absolute inset-0 size-full object-cover object-[center_22%]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-heading/75 via-heading/45 to-heading/80" />
        <div className="relative flex h-full flex-col gap-6 p-8 xl:p-10">
          <Link to="/accueil" className="inline-flex w-fit" aria-label="CHAPITRE+ — Accueil">
            <img src={logo} alt="CHAPITRE+" className="h-10 w-auto brightness-0 invert" />
          </Link>
          <div className="max-w-md">
            <p className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-[2.75rem]">
              CHAPITRE<span className="text-accent">+</span>
            </p>
            <p className="mt-3 truncate text-base text-white/90">
              Présentiel · 3<sup>e</sup> et Terminale C·D · Bénin
            </p>
            <p className="mt-3 truncate text-sm font-medium text-white/75">
              Élèves : inscription libre · Autres : compte admin
            </p>
          </div>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col overflow-hidden bg-surface">
        {/* Bandeau marque mobile */}
        <div className="relative h-28 shrink-0 overflow-hidden lg:hidden">
          <img
            src={hero640}
            alt=""
            className="absolute inset-0 size-full object-cover object-[center_25%]"
            aria-hidden
          />
          <div className="absolute inset-0 bg-heading/65" />
          <div className="relative flex h-full items-end px-4 pb-3">
            <p className="text-lg font-bold text-white">
              CHAPITRE<span className="text-accent">+</span>
            </p>
          </div>
        </div>

        <header className="z-20 flex h-12 shrink-0 items-center border-b border-border-light bg-surface px-4 sm:px-6 lg:h-14 lg:px-8">
          <Link
            to="/accueil"
            className="btn btn-ghost btn-sm h-auto min-h-0 cursor-pointer gap-2 px-2 py-1.5 text-sm font-semibold text-primary hover:bg-soft-blue"
          >
            <span aria-hidden>←</span>
            Retour à l’accueil
          </Link>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-10 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto w-full max-w-[26rem]">
            <h1 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">{title}</h1>
            <p className="mt-1.5 truncate text-sm text-body/70" title={subtitle}>
              {subtitle}
            </p>
            <div className="mt-5">{children}</div>
            {footer ? (
              <div className="mt-6 border-t border-border-light pt-5 text-sm text-body/80">
                {footer}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
