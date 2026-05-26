import { getCsrfToken, refreshToken } from '#/features/auth/api/auth-api'
import { getAuthSession, isAuthenticated, setAuthSession } from '#/features/auth/session'
import { redirect } from '@tanstack/react-router'

export async function tryAuthSession(): Promise<boolean> {
  if (isAuthenticated()) {
    return true
  }

  try {
    await getCsrfToken()
    const response = await refreshToken()
    if (response.data?.user) {
      setAuthSession({
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in,
        user: response.data.user,
      })
      return true
    }
  } catch {
    // ignore and return false
  }

  return Boolean(getAuthSession())
}

export async function requireAuth(redirectTo: string = '/login'): Promise<void> {
  const hasSession = await tryAuthSession()
  if (!hasSession) {
    throw redirect({ to: redirectTo })
  }
}
