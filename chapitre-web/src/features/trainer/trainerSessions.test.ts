import { beforeEach, describe, expect, it } from 'vitest'
import {
  approveTrainerSessionPrice,
  cancelTrainerSession,
  clearTrainerSessions,
  completeTrainerSession,
  createTrainerSession,
  ensureDemoTrainerSessions,
  findSessionOverlap,
  getTrainerSession,
  listPendingAdminApprovals,
  listTrainerSessions,
  rejectTrainerSessionPrice,
  SESSION_STATUSES,
  submitTrainerSessionForApproval,
} from './trainerSessions'

describe('trainerSessions mock', () => {
  beforeEach(() => {
    clearTrainerSessions()
  })

  it('seed plusieurs séances multi-statuts', () => {
    const items = ensureDemoTrainerSessions('f@exemple.bj')
    expect(items.length).toBeGreaterThanOrEqual(6)
    const statuses = new Set(items.map((item) => item.status))
    expect(statuses.has(SESSION_STATUSES.DRAFT)).toBe(true)
    expect(statuses.has(SESSION_STATUSES.PENDING_APPROVAL)).toBe(true)
    expect(statuses.has(SESSION_STATUSES.PUBLISHED)).toBe(true)
    expect(statuses.has(SESSION_STATUSES.FULL)).toBe(true)
    expect(statuses.has(SESSION_STATUSES.COMPLETED)).toBe(true)
    expect(statuses.has(SESSION_STATUSES.CANCELLED)).toBe(true)
  })

  it('refuse la soumission admin si formateur non approuvé', () => {
    const created = createTrainerSession({
      trainerEmail: 'f@exemple.bj',
      title: 'Révision chimie organique',
      level: 'Terminale D',
      subject: 'Chimie',
      venueId: 'venue-ganhi',
      startsAt: '2026-12-01T08:00:00.000Z',
      endsAt: '2026-12-01T10:00:00.000Z',
      capacity: 8,
      priceXof: 700,
      submitForApproval: true,
      trainerApproved: false,
    })
    expect(created.status).toBe(SESSION_STATUSES.DRAFT)
    expect(submitTrainerSessionForApproval('f@exemple.bj', created.id, false)).toBeNull()
  })

  it('soumet un brouillon quand formateur approuvé', () => {
    const created = createTrainerSession({
      trainerEmail: 'f@exemple.bj',
      title: 'Physique — optique',
      level: '3e',
      subject: 'Physique',
      venueId: 'venue-porto',
      startsAt: '2026-12-02T14:00:00.000Z',
      endsAt: '2026-12-02T16:00:00.000Z',
      capacity: 12,
      priceXof: 600,
    })
    const submitted = submitTrainerSessionForApproval('f@exemple.bj', created.id, true)
    expect(submitted?.status).toBe(SESSION_STATUSES.PENDING_APPROVAL)
    expect(listTrainerSessions('f@exemple.bj')[0]?.status).toBe(
      SESSION_STATUSES.PENDING_APPROVAL,
    )
  })

  it('admin approuve tarif → PUBLISHED', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    const pending = listPendingAdminApprovals()
    expect(pending.length).toBeGreaterThan(0)
    const target = pending[0]!
    const approved = approveTrainerSessionPrice(target.trainerEmail, target.id)
    expect(approved?.status).toBe(SESSION_STATUSES.PUBLISHED)
    expect(approved?.priceStatus).toBe('APPROVED')
  })

  it('admin rejette → brouillon', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    const pending = listPendingAdminApprovals()[0]!
    const rejected = rejectTrainerSessionPrice(pending.trainerEmail, pending.id)
    expect(rejected?.status).toBe(SESSION_STATUSES.DRAFT)
    expect(rejected?.priceStatus).toBe('PROPOSED')
  })

  it('refuse un chevauchement formateur/lieu', () => {
    createTrainerSession({
      trainerEmail: 'f@exemple.bj',
      title: 'Séance A',
      level: '3e',
      subject: 'Mathématiques',
      venueId: 'venue-akpakpa',
      startsAt: '2026-12-10T08:00:00.000Z',
      endsAt: '2026-12-10T10:00:00.000Z',
      capacity: 10,
      priceXof: 500,
    })
    const overlap = findSessionOverlap({
      trainerEmail: 'f@exemple.bj',
      venueId: 'venue-akpakpa',
      startsAt: '2026-12-10T09:00:00.000Z',
      endsAt: '2026-12-10T11:00:00.000Z',
    })
    expect(overlap?.kind).toBe('VENUE')
    expect(() =>
      createTrainerSession({
        trainerEmail: 'f@exemple.bj',
        title: 'Séance B',
        level: '3e',
        subject: 'Physique',
        venueId: 'venue-akpakpa',
        startsAt: '2026-12-10T09:00:00.000Z',
        endsAt: '2026-12-10T11:00:00.000Z',
        capacity: 8,
        priceXof: 500,
      }),
    ).toThrow(/Lieu déjà pris|Chevauchement/)
  })

  it('annule une séance publiée avec motif', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    const published = getTrainerSession('f@exemple.bj', 'demo-sess-published')
    expect(published?.status).toBe(SESSION_STATUSES.PUBLISHED)
    const cancelled = cancelTrainerSession(
      'f@exemple.bj',
      'demo-sess-published',
      'Centre fermé exceptionnellement',
    )
    expect(cancelled?.status).toBe(SESSION_STATUSES.CANCELLED)
    expect(cancelled?.cancelReason).toBe('Centre fermé exceptionnellement')
  })

  it('refuse d’annuler une séance déjà clôturée', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    expect(cancelTrainerSession('f@exemple.bj', 'demo-sess-completed')).toBeNull()
  })

  it('clôture une séance publiée', () => {
    ensureDemoTrainerSessions('f@exemple.bj')
    const done = completeTrainerSession('f@exemple.bj', 'demo-sess-published')
    expect(done?.status).toBe(SESSION_STATUSES.COMPLETED)
  })
})
