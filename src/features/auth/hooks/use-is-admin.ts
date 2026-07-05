import { useQuery } from '@tanstack/react-query'

import { authSessionKey, getAuthSession } from '#/features/auth/session'

// Reads the current user's role from the session (case-insensitive) and reports
// whether they are an admin. Reactive via the shared auth session query key, so
// UI updates if the session changes.
export function useIsAdmin(): boolean {
  const { data: session } = useQuery({
    queryKey: authSessionKey,
    queryFn: () => getAuthSession(),
    initialData: () => getAuthSession(),
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })

  return session?.user.role?.toLowerCase() === 'admin'
}
