import type { AuthSession } from '#/features/auth/types'

const SESSION_KEY = 'apant:auth'

function readStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null
  }

  const raw = window.sessionStorage.getItem(SESSION_KEY)
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as AuthSession
    if (!parsed || !parsed.user || parsed.user.id === undefined || parsed.user.id === null) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function getAuthSession(): AuthSession | null {
  return readStoredSession()
}

export function isAuthenticated(): boolean {
  return Boolean(readStoredSession())
}

export function setAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function clearAuthSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(SESSION_KEY)
}
