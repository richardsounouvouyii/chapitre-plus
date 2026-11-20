import { describe, expect, it } from 'vitest'
import {
  APP_HOME_BY_ROLE,
  APP_NAV_BY_ROLE,
  mobileNavItemsForRole,
  PUBLIC_SITE_HOME,
  STUDENT_PATHS,
} from './appNav'
import { ROLES } from '@/lib/roles'

describe('appNav', () => {
  it('centralise les chemins élève sous /dashboard/eleve', () => {
    expect(STUDENT_PATHS.home).toBe('/dashboard/eleve')
    expect(STUDENT_PATHS.demandes).toBe('/dashboard/eleve/demandes')
    expect(STUDENT_PATHS.seances).toBe('/dashboard/eleve/seances')
    expect(APP_HOME_BY_ROLE.STUDENT).toBe(STUDENT_PATHS.home)
    expect(PUBLIC_SITE_HOME).toBe('/accueil')
  })

  it('expose 5 entrées élève pour la bottom nav (pas de Catalogue)', () => {
    const items = mobileNavItemsForRole(ROLES.STUDENT)
    expect(items).toHaveLength(5)
    expect(items.map((item) => item.label)).toEqual([
      'Accueil',
      'Demandes',
      'Séances',
      'Ressources',
      'Profil',
    ])
    expect(APP_NAV_BY_ROLE.STUDENT.every((item) => item.to.startsWith('/dashboard/'))).toBe(true)
  })
})
