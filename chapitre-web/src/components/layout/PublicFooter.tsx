import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '@/assets/02_logo_principal.png'
import { BeninFlag } from '@/components/ui/BeninFlag'

const cities = ['Cotonou', 'Porto-Novo', 'Parakou', 'Abomey-Calavi', 'Bohicon']

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border-light bg-heading text-primary-content">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-7">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          <div className="space-y-2.5">
            <img
              src={logo}
              alt="CHAPITRE+"
              className="h-9 w-auto max-w-[180px] rounded-md bg-surface object-contain object-left p-1"
            />
            <p className="text-xs leading-snug text-primary-content/80 md:text-sm">
              Renforcement scolaire <strong>en présentiel</strong> — 3<sup>e</sup> et terminale au
              Bénin. Pas de cours en ligne.
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-2.5 py-0.5 text-[11px] font-medium">
              <BeninFlag className="h-3 w-4 rounded-sm" />
              République du Bénin
            </span>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-accent">Découvrir</h2>
            <ul className="mt-2 space-y-1 text-sm text-primary-content/85">
              <li>
                <Link to="/accueil" className="hover:text-accent">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/catalogue" className="hover:text-accent">
                  Séances disponibles
                </Link>
              </li>
              <li>
                <Link to="/formateurs" className="hover:text-accent">
                  Formateurs vérifiés
                </Link>
              </li>
              <li>
                <Link to="/centres" className="hover:text-accent">
                  Centres partenaires
                </Link>
              </li>
              <li>
                <Link to="/comment-ca-marche" className="hover:text-accent">
                  Comment ça fonctionne
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-accent">Zones couvertes</h2>
            <ul className="mt-2 space-y-1 text-sm text-primary-content/85">
              {cities.map((city) => (
                <li key={city} className="flex items-center gap-1.5">
                  <MapPin className="size-3 shrink-0 text-accent" aria-hidden />
                  {city}
                </li>
              ))}
            </ul>
            <p className="mt-1.5 text-[11px] text-primary-content/55">
              Extension progressive selon les centres validés.
            </p>
          </div>

          <div>
            <h2 className="text-xs font-bold uppercase tracking-wide text-accent">Contact & aide</h2>
            <ul className="mt-2 space-y-1.5 text-sm text-primary-content/85">
              <li className="flex items-center gap-2">
                <Mail className="size-3.5 shrink-0 text-accent" aria-hidden />
                <span>
                  support@chapitreplus.bj
                  <span className="text-primary-content/50"> · à confirmer</span>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="size-3.5 shrink-0 text-accent" aria-hidden />
                <span>+229 XX XX XX XX · Lun–Sam 8h–18h</span>
              </li>
              <li>
                <Link to="/aide" className="hover:text-accent">
                  Centre d’aide
                </Link>
              </li>
              <li>
                <Link to="/mentions-legales" className="hover:text-accent">
                  Mentions légales & mineurs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-1 border-t border-white/15 pt-3 text-[11px] text-primary-content/50 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} CHAPITRE+ — Bénin. Tous droits réservés.</p>
          <p>XOF · Paiement serveur · Présentiel uniquement</p>
        </div>
      </div>
    </footer>
  )
}
