import { describe, expect, it } from 'vitest'
import { formatPriceXof, listStudentBookings } from './mocks'
import { BOOKING_STATUSES } from './types'

describe('bookings mocks', () => {
  it('expose 3 séances démo pour une classe donnée', () => {
    const items = listStudentBookings('3e')
    expect(items).toHaveLength(3)
    expect(items.every((item) => item.level === '3e')).toBe(true)
    expect(items.some((item) => item.status === 'PENDING_GUARDIAN_APPROVAL')).toBe(true)
    expect(items.some((item) => item.status === 'PENDING_PAYMENT')).toBe(true)
    expect(items.some((item) => item.status === 'CONFIRMED')).toBe(true)
  })

  it('ne mélange pas les classes d’un même élève', () => {
    const tc = listStudentBookings('Terminale C')
    expect(tc.every((item) => item.level === 'Terminale C')).toBe(true)
    const td = listStudentBookings('Terminale D')
    expect(td.every((item) => item.level === 'Terminale D')).toBe(true)
  })

  it('formate les prix en XOF', () => {
    expect(formatPriceXof(3500)).toContain('3')
    expect(formatPriceXof(3500)).toContain('XOF')
  })

  it('expose les statuts cahier', () => {
    expect(BOOKING_STATUSES).toContain('PENDING_GUARDIAN_APPROVAL')
    expect(BOOKING_STATUSES).toContain('CONFIRMED')
  })
})
