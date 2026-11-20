/**
 * Référentiel démo villes / établissements (Bénin).
 * Remplacé plus tard par catalog-service / Identity.
 */

export const BENIN_CITIES = [
  'Cotonou',
  'Abomey-Calavi',
  'Porto-Novo',
  'Parakou',
  'Bohicon',
] as const

export type BeninCity = (typeof BENIN_CITIES)[number]

export const SCHOOL_OTHER_ID = 'autre'

export type SchoolOption = {
  id: string
  name: string
}

const SCHOOLS_BY_CITY: Record<BeninCity, SchoolOption[]> = {
  Cotonou: [
    { id: 'cotonou-cs-gagnon', name: 'Cours Sainte-Marie / Gagnon' },
    { id: 'cotonou-lycee-behanzin', name: 'Lycée Behanzin' },
    { id: 'cotonou-cs-notre-dame', name: 'Collège Notre-Dame de Lourdes' },
  ],
  'Abomey-Calavi': [
    { id: 'calavi-lycee-calavi', name: 'Lycée d’Abomey-Calavi' },
    { id: 'calavi-cs-le-bonheur', name: 'Cours secondaire Le Bonheur' },
    { id: 'calavi-college-padre', name: 'Collège Padre Pio' },
  ],
  'Porto-Novo': [
    { id: 'pn-lycee-behanzin', name: 'Lycée Béhanzin (Porto-Novo)' },
    { id: 'pn-cs-immaculee', name: 'Collège de l’Immaculée Conception' },
  ],
  Parakou: [
    { id: 'parakou-lycee-mathieu', name: 'Lycée Mathieu Bouké' },
    { id: 'parakou-cs-les-pilotes', name: 'Cours Les Pilotes' },
  ],
  Bohicon: [
    { id: 'bohicon-lycee-bohicon', name: 'Lycée de Bohicon' },
    { id: 'bohicon-cs-espoir', name: 'Cours Espoir' },
  ],
}

export function isBeninCity(value: string): value is BeninCity {
  return (BENIN_CITIES as readonly string[]).includes(value)
}

/** Établissements de la ville + option « Autre… ». */
export function schoolsForCity(city: string): SchoolOption[] {
  if (!isBeninCity(city)) return [{ id: SCHOOL_OTHER_ID, name: 'Autre…' }]
  return [...SCHOOLS_BY_CITY[city], { id: SCHOOL_OTHER_ID, name: 'Autre…' }]
}

export function resolveSchoolName(
  city: string,
  schoolId: string,
  schoolOther: string,
): string | undefined {
  if (!schoolId) return undefined
  if (schoolId === SCHOOL_OTHER_ID) {
    const trimmed = schoolOther.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return schoolsForCity(city).find((school) => school.id === schoolId)?.name
}
