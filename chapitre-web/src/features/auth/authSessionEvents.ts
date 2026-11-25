/** Événement custom : session mock / future Identity a changé dans cet onglet. */
export const AUTH_SESSION_CHANGED_EVENT = 'chapitre:auth-session-changed'

export function notifyAuthSessionChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGED_EVENT))
}
