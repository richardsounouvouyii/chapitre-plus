import { describe, expect, it } from 'vitest'
import {
  APP_HOME_BY_ROLE,
  APP_NAV_BY_ROLE,
  mobileNavItemsForRole,
  PUBLIC_SITE_HOME,
  STUDENT_PATHS,
  TRAINER_PATHS,
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

  it('expose dossier + disponibilités formateur (docs hors bottom nav)', () => {
    expect(TRAINER_PATHS.dossier).toBe('/dashboard/formateur/dossier')
    expect(TRAINER_PATHS.disponibilites).toBe('/dashboard/formateur/disponibilites')
    const mobile = mobileNavItemsForRole(ROLES.TRAINER)
    expect(mobile.map((item) => item.label)).toEqual([
      'Tableau de bord',
      'Dossier',
      'Disponibilités',
      'Séances',
      'Profil',
    ])
    expect(APP_NAV_BY_ROLE.TRAINER.some((item) => item.to === TRAINER_PATHS.documents)).toBe(
      true,
    )
  })
})
