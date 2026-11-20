import { useMemo, useState } from 'react'
import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppEmptyPanel } from '@/components/layout/AppEmptyPanel'
import { STUDENT_PATHS } from '@/components/layout/app-shell/appNav'
import { canDownloadResource, listStudentResources } from '@/features/resources/mocks'
import {
  RESOURCE_CATEGORIES,
  RESOURCE_CATEGORY_LABELS,
  type ResourceCategory,
  type StudentResource,
} from '@/features/resources/types'
import { isSupportedLevel } from '@/features/public/curriculumLevels'
import { readStudentMockSession } from './studentSession'
import { StudentPageHeader } from './StudentPageHeader'
import { StudentResourceCard } from './StudentResourceCard'

type FilterKey = 'ALL' | 'AVAILABLE' | 'LOCKED' | ResourceCategory

const CATEGORY_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'ALL', label: 'Tous' },
  { key: 'AVAILABLE', label: 'Disponibles' },
  { key: 'LOCKED', label: 'Verrouillés' },
  ...RESOURCE_CATEGORIES.map((category) => ({
    key: category as FilterKey,
    label: RESOURCE_CATEGORY_LABELS[category],
  })),
]

function matchesFilter(item: StudentResource, filter: FilterKey, now: Date): boolean {
  const available = canDownloadResource(item, now)
  if (filter === 'ALL') return true
  if (filter === 'AVAILABLE') return available
  if (filter === 'LOCKED') return !available
  return item.category === filter
}

export function StudentResourcesPage() {
  const [filter, setFilter] = useState<FilterKey>('ALL')
  const now = useMemo(() => new Date(), [])
  const session = readStudentMockSession()
  const level =
    session.level && isSupportedLevel(session.level) ? session.level : undefined
  const resources = listStudentResources(level)

  const visible = useMemo(
    () => resources.filter((item) => matchesFilter(item, filter, now)),
    [filter, now, resources],
  )

  const availableCount = resources.filter((item) => canDownloadResource(item, now)).length
  const lockedCount = resources.length - availableCount

  const counts = useMemo(() => {
    const base: Partial<Record<FilterKey, number>> = {
      ALL: resources.length,
      AVAILABLE: availableCount,
      LOCKED: lockedCount,
    }
    for (const category of RESOURCE_CATEGORIES) {
      base[category] = resources.filter((item) => item.category === category).length
    }
    return base
  }, [availableCount, lockedCount, resources])

  const countLabel =
    visible.length === 0
      ? 'Aucun document'
      : visible.length === 1
        ? '1 document'
        : `${visible.length} documents`

  return (
    <div className="animate-fade-up">
      <StudentPageHeader
        title="Ressources"
        description="Chaque ligne = un document. Le bouton télécharge uniquement ce fichier (PDF, JPG, PNG ou WEBP) — pas toute la liste. Accès si séance confirmée et fenêtre ouverte."
        actions={
          <Link
            to={STUDENT_PATHS.seances}
            className="btn btn-outline btn-primary h-11 w-full px-4 sm:w-auto"
          >
            Mes séances
          </Link>
        }
      />

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer les ressources">
        {CATEGORY_FILTERS.map(({ key, label }) => {
          const active = filter === key
          const n = counts[key] ?? 0
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(key)}
              className={[
                'border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-content'
                  : 'border-border-light bg-surface text-body/70 hover:border-primary/40 hover:bg-soft-blue/40',
              ].join(' ')}
            >
              {label}
              <span className={active ? 'ml-1.5 opacity-90' : 'ml-1.5 text-body/45'}>{n}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border border-border-light bg-page px-4 py-2.5">
        <p className="text-sm font-medium text-heading">{countLabel}</p>
        <p className="text-xs text-body/50">
          {availableCount} disponible{availableCount > 1 ? 's' : ''} · {lockedCount} verrouillé
          {lockedCount > 1 ? 's' : ''}
        </p>
      </div>

      {resources.length === 0 ? (
        <div className="mt-4">
          <AppEmptyPanel
            icon={FileText}
            title="Aucun document disponible"
            description="Les supports apparaîtront ici après une séance confirmée, selon le calendrier de publication du formateur."
            actions={
              <Link to={STUDENT_PATHS.seances} className="btn btn-primary px-4">
                Voir mes séances
              </Link>
            }
          />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-4">
          <AppEmptyPanel
            icon={FileText}
            title="Aucun document dans ce filtre"
            description="Changez de filtre pour voir les autres ressources."
            actions={
              <button
                type="button"
                className="btn btn-outline btn-primary px-4"
                onClick={() => setFilter('ALL')}
              >
                Voir tous
              </button>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {visible.map((item) => (
            <li key={item.id}>
              <StudentResourceCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
