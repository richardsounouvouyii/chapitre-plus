import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { AUTH_SESSION_CHANGED_EVENT } from './authSessionEvents'
import {
  clearDemoAuthSession,
  getActivePublicSession,
  type ActivePublicSession,
} from './demoSession'

type AuthSessionContextValue = {
  session: ActivePublicSession | null
  refresh: () => void
  clearSession: () => void
}

const AuthSessionContext = createContext<AuthSessionContextValue | null>(null)

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ActivePublicSession | null>(() =>
    getActivePublicSession(),
  )

  const refresh = useCallback(() => {
    setSession(getActivePublicSession())
  }, [])

  const clearSession = useCallback(() => {
    clearDemoAuthSession()
    setSession(null)
  }, [])

  useEffect(() => {
    const onChange = () => refresh()
    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, onChange)
    // Autre onglet / storage API (sessionStorage cross-tab limité, inoffensif).
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [refresh])

  const value = useMemo(
    () => ({ session, refresh, clearSession }),
    [session, refresh, clearSession],
  )

  return (
    <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>
  )
}

export function useAuthSession(): AuthSessionContextValue {
  const ctx = useContext(AuthSessionContext)
  if (!ctx) {
    throw new Error('useAuthSession doit être utilisé dans AuthSessionProvider')
  }
  return ctx
}
