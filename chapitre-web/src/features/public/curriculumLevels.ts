/**
 * Classes prises en charge par CHAPITRE+ (MVP validé) : 3e + Terminale C·D.
 * Source de vérité backend : catalog-service (`SUPPORTED_LEVELS`).
 * Le front garde ce miroir jusqu’au branchement API phase Identity+Catalog.
 */
export const SUPPORTED_LEVELS = ['3e', 'Terminale C', 'Terminale D'] as const

export type SupportedLevel = (typeof SUPPORTED_LEVELS)[number]

/** Libellé UX unique pour ancrer le périmètre. */
export const SUPPORTED_LEVELS_LABEL = 'Classes prises en charge : 3e · Terminale C · D'

/** @deprecated utiliser SUPPORTED_LEVELS — alias de tri. */
export const LEVEL_ORDER = SUPPORTED_LEVELS

export function isSupportedLevel(level: string): level is SupportedLevel {
  return (SUPPORTED_LEVELS as readonly string[]).includes(level)
}

export function compareLevels(left: string, right: string) {
  const leftRank = SUPPORTED_LEVELS.indexOf(left as SupportedLevel)
  const rightRank = SUPPORTED_LEVELS.indexOf(right as SupportedLevel)
  const leftOrder = leftRank === -1 ? SUPPORTED_LEVELS.length : leftRank
  const rightOrder = rightRank === -1 ? SUPPORTED_LEVELS.length : rightRank
  if (leftOrder !== rightOrder) return leftOrder - rightOrder
  return left.localeCompare(right, 'fr')
}

export type TaughtSubject = {
  name: string
  levels: string[]
}

export type ClassGroup = {
  level: string
  subjects: string[]
}

/** Ne garde que les classes du périmètre CHAPITRE+ (3e / Terminale C·D). */
export function subjectsByLevel(subjects: TaughtSubject[]): ClassGroup[] {
  const byLevel = new Map<string, string[]>()
  for (const subject of subjects) {
    for (const level of subject.levels) {
      if (!isSupportedLevel(level)) continue
      const names = byLevel.get(level) ?? []
      names.push(subject.name)
      byLevel.set(level, names)
    }
  }
  return [...byLevel.keys()]
    .sort(compareLevels)
    .map((level) => ({ level, subjects: byLevel.get(level) ?? [] }))
}

/** Jusqu’à 4 classes : tout afficher. Au-delà : 3 premières + classe de la séance. */
export const SESSION_CLASS_PREVIEW_LIMIT = 4

export function selectClassGroupsForSession(
  groups: ClassGroup[],
  sessionLevel?: string,
): { visible: ClassGroup[]; hiddenCount: number } {
  if (groups.length <= SESSION_CLASS_PREVIEW_LIMIT) {
    return { visible: groups, hiddenCount: 0 }
  }

  const firstThree = groups.slice(0, 3)
  const visibleLevels = new Set(firstThree.map((group) => group.level))
  const visible = [...firstThree]

  if (sessionLevel && !visibleLevels.has(sessionLevel)) {
    const sessionGroup = groups.find((group) => group.level === sessionLevel)
    if (sessionGroup) {
      visible.push(sessionGroup)
      visibleLevels.add(sessionLevel)
    }
  }

  return {
    visible,
    hiddenCount: groups.length - visible.length,
  }
}

export function catalogClassHref(subject: string, level: string) {
  const params = new URLSearchParams({ matiere: subject, niveau: level })
  return `/catalogue?${params.toString()}`
}
