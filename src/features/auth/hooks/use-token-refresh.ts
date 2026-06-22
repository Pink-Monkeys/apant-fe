import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'

import { refreshToken } from '#/features/auth/api/auth-api'
import { authSessionKey, getAuthSession, setAuthSession } from '#/features/auth/session'

// Refresh once the access token has spent this share of its lifetime, so most
// requests never hit a 401 (the interceptor stays as the safety net).
const REFRESH_AT_RATIO = 0.85
const MIN_DELAY_MS = 30_000

// Proactively refreshes the access token shortly before it expires. Mount once
// under an authenticated boundary (ProtectedLayout). On each successful refresh
// the session updates, which re-runs this effect and reschedules the next timer.
export function useTokenRefresh(): void {
  const { data: session } = useQuery({
    queryKey: authSessionKey,
    queryFn: () => getAuthSession(),
    initialData: getAuthSession(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  const user = session?.user
  const expiresIn = session?.expiresIn

  useEffect(() => {
    if (!user || !expiresIn || expiresIn <= 0) {
      return
    }

    const delayMs = Math.max(expiresIn * REFRESH_AT_RATIO * 1000, MIN_DELAY_MS)
    let cancelled = false

    const timerId = window.setTimeout(async () => {
      try {
        const response = await refreshToken()
        if (!cancelled && response.data?.user) {
          setAuthSession({
            tokenType: response.data.token_type,
            expiresIn: response.data.expires_in,
            user: response.data.user,
          })
        }
      } catch {
        // The 401 interceptor on the next request is the safety net.
      }
    }, delayMs)

    return () => {
      cancelled = true
      window.clearTimeout(timerId)
    }
  }, [user, expiresIn])
}
