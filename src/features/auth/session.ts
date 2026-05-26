import { queryClient } from '#/lib/query-client'
import type { AuthSession } from '#/features/auth/types'

export const authSessionKey = ['auth', 'session'] as const

export function getAuthSession(): AuthSession | null {
  const session = queryClient.getQueryData<AuthSession | null>(authSessionKey)
  if (!session || !session.user || session.user.id === undefined || session.user.id === null) {
    return null
  }

  return session
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthSession())
}

export function setAuthSession(session: AuthSession): void {
  queryClient.setQueryData(authSessionKey, session)
}

export function clearAuthSession(): void {
  queryClient.setQueryData(authSessionKey, null)
}
