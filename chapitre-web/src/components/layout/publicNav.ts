/**
 * Navigation publique partagée.
 * Desktop : liens complets dans le header.
 * Mobile : 4 raccourcis bas d’écran (mêmes destinations, pas de doublon « Demande »
 * réservé à l’espace élève connecté — inscription via header / Compte).
 */
export const PUBLIC_HEADER_LINKS = [
  { to: '/accueil', label: 'Accueil' },
  { to: '/catalogue', label: 'Séances' },
  { to: '/formateurs', label: 'Formateurs' },
  { to: '/centres', label: 'Centres' },
  { to: '/comment-ca-marche', label: 'À propos' },
  { to: '/aide', label: 'Aide' },
] as const

export const PUBLIC_MOBILE_NAV = [
  { to: '/accueil', label: 'Accueil', end: true },
  { to: '/catalogue', label: 'Séances', end: false },
  { to: '/formateurs', label: 'Formateurs', end: false },
  { to: '/connexion', label: 'Compte', end: false },
] as const

/** Compte reste actif sur connexion et inscription. */
export function isPublicAccountPath(pathname: string) {
  return pathname === '/connexion' || pathname === '/inscription'
}
