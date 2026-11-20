import { Link } from 'react-router-dom'
import {
  catalogClassHref,
  selectClassGroupsForSession,
  type ClassGroup,
} from './curriculumLevels'
import { trainerProfilePath } from './trainers'

export function classGroupAriaLabel(level: string, subjects: string[]) {
  return `${level} : ${subjects.join(', ')}`
}

type SubjectsByClassProps = {
  groups: ClassGroup[]
  /** Pastille matière + classe (fiche séance). */
  highlight?: { subject: string; level: string }
  /** Ligne de classe entière (filtre / sélection profil). */
  selectedLevel?: string
  onSelectLevel?: (level: string) => void
  /** Fiche séance : n’omet aucune classe tant qu’il y en a ≤ 4. */
  preview?: boolean
  profileId?: string
  /** Micro-texte sous le titre (cartes formateurs). */
  showHint?: boolean
  /**
   * `catalog` : pastille → catalogue filtré (matière + classe).
   * `none` : affichage seul (cartes liste formateurs — évite la surprise).
   */
  subjectLinks?: 'catalog' | 'none'
}

export function SubjectsByClass({
  groups,
  highlight,
  selectedLevel,
  onSelectLevel,
  preview = false,
  profileId,
  showHint = false,
  subjectLinks = 'catalog',
}: SubjectsByClassProps) {
  const { visible, hiddenCount } = preview
    ? selectClassGroupsForSession(groups, highlight?.level ?? selectedLevel)
    : { visible: groups, hiddenCount: 0 }

  const hintText =
    subjectLinks === 'catalog'
      ? 'Une ligne = une classe · toucher une matière ouvre les séances'
      : 'Une ligne = une classe et ses matières'

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-body/50">
        Matières par classe enseignées
      </h3>
      {showHint ? <p className="mt-1 text-xs text-body/60">{hintText}</p> : null}
      <div className="mt-2 space-y-2">
        {visible.map((group) => {
          const rowSelected = selectedLevel === group.level
          const rowLabel = classGroupAriaLabel(group.level, group.subjects)
          return (
            <div
              key={group.level}
              role="group"
              aria-label={rowLabel}
              className={
                rowSelected
                  ? 'flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-soft-blue px-3 py-2 ring-1 ring-primary/25'
                  : 'flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl bg-page px-3 py-2'
              }
            >
              {onSelectLevel ? (
                <button
                  type="button"
                  onClick={() => onSelectLevel(group.level)}
                  className="shrink-0 font-bold text-heading"
                  aria-pressed={rowSelected}
                >
                  {group.level}
                </button>
              ) : (
                <p className="shrink-0 font-bold text-heading">{group.level}</p>
              )}
              {rowSelected ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-content">
                  Sélectionnée
                </span>
              ) : null}
              <ul className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {group.subjects.map((name) => {
                  const currentSubject =
                    highlight != null &&
                    highlight.subject === name &&
                    highlight.level === group.level
                  const pillClass =
                    currentSubject || rowSelected
                      ? 'inline-flex rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-content'
                      : 'inline-flex rounded-full bg-surface px-3 py-1 text-sm font-medium text-heading'

                  if (subjectLinks === 'none') {
                    return (
                      <li key={name}>
                        <span className={pillClass}>{name}</span>
                      </li>
                    )
                  }

                  return (
                    <li key={name}>
                      <Link
                        to={catalogClassHref(name, group.level)}
                        aria-label={`Séances ${name} en ${group.level}`}
                        title={`Voir les séances : ${name}, ${group.level}`}
                        className={pillClass}
                      >
                        {name}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
      {hiddenCount > 0 && profileId ? (
        <p className="mt-3 text-sm text-body/75">
          {hiddenCount} classe{hiddenCount > 1 ? 's' : ''} restante
          {hiddenCount > 1 ? 's' : ''} —{' '}
          <Link
            to={
              selectedLevel
                ? `${trainerProfilePath(profileId)}?niveau=${encodeURIComponent(selectedLevel)}`
                : trainerProfilePath(profileId)
            }
            className="font-semibold text-primary"
          >
            Voir le profil
          </Link>
        </p>
      ) : null}
    </section>
  )
}
