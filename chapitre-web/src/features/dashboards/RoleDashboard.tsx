import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'
import {
  AlertBanner,
  EmptyState,
  SkeletonList,
  StatusBadge,
  useToast,
} from '@/components/ui'
import { ROLE_LABELS, type Role } from '@/lib/roles'

const HINTS: Record<
  Role,
  { title: string; description: string; cta?: { to: string; label: string } }
> = {
  STUDENT: {
    title: 'Espace élève',
    description:
      'Bientôt : déclarer une difficulté, suivre vos demandes, séances et documents autorisés.',
    cta: { to: '/catalogue', label: 'Voir le catalogue (mock)' },
  },
  TRAINER: {
    title: 'Espace formateur',
    description:
      'Bientôt : vérification du profil, disponibilités, création de séances et supports PDF/images.',
  },
  PARENT: {
    title: 'Espace parent',
    description: 'Bientôt : enfants liés, autorisations de réservation et suivi des paiements.',
  },
  ADMIN: {
    title: 'Espace administrateur',
    description: 'Bientôt : validation formateurs, tarifs, demandes, séances et audit.',
  },
}

type RoleDashboardProps = {
  role: Role
}

export function RoleDashboard({ role }: RoleDashboardProps) {
  const hint = HINTS[role]
  const { pushToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [bannerOpen, setBannerOpen] = useState(true)

  useEffect(() => {
    setLoading(true)
    const timer = window.setTimeout(() => {
      setLoading(false)
      pushToast({
        tone: 'success',
        title: `Bienvenue — ${ROLE_LABELS[role]}`,
        message: 'Espace prêt. Les données métier arriveront avec Identity / Catalog.',
        durationMs: 3800,
      })
    }, 800)
    return () => window.clearTimeout(timer)
  }, [role, pushToast])

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm text-base-content/60">{ROLE_LABELS[role]}</p>
        <StatusBadge label="UI mock" variant="warning" size="xs" />
      </div>
      <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{hint.title}</h1>

      {bannerOpen ? (
        <AlertBanner
          tone="info"
          title="Front d’abord"
          className="mt-6"
          onClose={() => setBannerOpen(false)}
        >
          Navigation et composants actifs. Authentification réelle à la phase Identity.
        </AlertBanner>
      ) : null}

      <section className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-semibold">Activité récente</h2>
          <StatusBadge label={loading ? 'chargement' : 'vide'} variant="neutral" size="xs" />
        </div>
        {loading ? (
          <SkeletonList count={3} />
        ) : (
          <EmptyState
            illustration={ILLUSTRATIONS.exercices}
            illustrationAlt="Illustration — checklist"
            title="Rien pour l’instant"
            description={hint.description}
          />
        )}
      </section>

      {hint.cta && !loading ? (
        <Link to={hint.cta.to} className="btn btn-primary mt-6">
          {hint.cta.label}
        </Link>
      ) : null}
    </div>
  )
}
