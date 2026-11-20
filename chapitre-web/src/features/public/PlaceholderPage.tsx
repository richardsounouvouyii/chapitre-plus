import { Link } from 'react-router-dom'
import { ILLUSTRATIONS } from '@/assets/illustrations'
import { EmptyState } from '@/components/ui'

type PlaceholderPageProps = {
  title: string
  description: string
}

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-6">
      <EmptyState
        illustration={ILLUSTRATIONS.livresDiplome}
        illustrationAlt="Illustration — livres et toque"
        title={title}
        description={description}
      />
      <div className="mt-8 flex justify-center gap-3">
        <Link to="/accueil" className="btn btn-primary rounded-xl">
          Retour à l’accueil
        </Link>
        <Link to="/catalogue" className="btn btn-outline btn-primary rounded-xl">
          Voir les séances
        </Link>
      </div>
    </div>
  )
}
