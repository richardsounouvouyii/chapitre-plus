import { ClipboardList, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppEmptyPanel } from '@/components/layout/AppEmptyPanel'
import { STUDENT_PATHS } from '@/components/layout/app-shell/appNav'
import { listDifficultyRequests } from '@/features/difficulties/mocks'
import { isSupportedLevel } from '@/features/public/curriculumLevels'
import { readStudentMockSession } from './studentSession'
import { DifficultyRequestCard } from './DifficultyRequestCard'
import { StudentPageHeader } from './StudentPageHeader'

export function StudentDifficultiesPage() {
  const session = readStudentMockSession()
  const level =
    session.level && isSupportedLevel(session.level) ? session.level : undefined
  const items = listDifficultyRequests(level)
  const countLabel =
    items.length === 0
      ? 'Aucune demande'
      : items.length === 1
        ? '1 demande'
        : `${items.length} demandes`

  return (
    <div className="animate-fade-up">
      <StudentPageHeader
        title="Demandes"
        description="Suivez vos difficultés déclarées. Texte uniquement — aucun import de fichier."
        actions={
          <Link
            to={STUDENT_PATHS.demandesNouvelle}
            className="btn btn-primary h-11 w-full gap-2 px-4 sm:w-auto"
          >
            <Plus className="size-4" aria-hidden />
            Déclarer une difficulté
          </Link>
        }
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border border-border-light bg-page px-4 py-2.5">
        <p className="text-sm font-medium text-heading">{countLabel}</p>
        <p className="text-xs text-body/50">Statut mis à jour après étude (mock)</p>
      </div>

      {items.length === 0 ? (
        <div className="mt-4">
          <AppEmptyPanel
            icon={ClipboardList}
            title="Aucune demande pour l’instant"
            description="Quand vous déclarerez une difficulté, elle apparaîtra ici avec son statut (soumise, étudiée, planifiée…)."
            actions={
              <Link to={STUDENT_PATHS.demandesNouvelle} className="btn btn-primary px-4">
                Nouvelle demande
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <DifficultyRequestCard item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
