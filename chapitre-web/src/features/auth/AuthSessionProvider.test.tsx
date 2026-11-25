import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { AuthSessionProvider, useAuthSession } from './AuthSessionProvider'
import { clearDemoAuthSession, writeDemoAuthSession } from './demoSession'
import { ROLES } from '@/lib/roles'

function wrapper({ children }: { children: ReactNode }) {
  return <AuthSessionProvider>{children}</AuthSessionProvider>
}

describe('AuthSessionProvider', () => {
  beforeEach(() => {
    clearDemoAuthSession()
  })

  it('expose la session après writeDemoAuthSession (événement custom)', async () => {
    const { result } = renderHook(() => useAuthSession(), { wrapper })
    expect(result.current.session).toBeNull()

    act(() => {
      writeDemoAuthSession({ role: ROLES.PARENT, email: 'p@exemple.bj' })
    })

    await waitFor(() => {
      expect(result.current.session?.role).toBe(ROLES.PARENT)
      expect(result.current.session?.email).toBe('p@exemple.bj')
    })
  })

  it('clearSession vide le contexte', async () => {
    const { result } = renderHook(() => useAuthSession(), { wrapper })

    act(() => {
      writeDemoAuthSession({ role: ROLES.ADMIN })
    })
    await waitFor(() => expect(result.current.session?.role).toBe(ROLES.ADMIN))

    act(() => {
      result.current.clearSession()
    })
    await waitFor(() => expect(result.current.session).toBeNull())
  })
})
