import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { logout } from '#/features/auth/api/auth-api'
import { clearAuthSession } from '#/features/auth/session'
import { llmOptionsQueryKey } from '#/features/llm/api/llm-api'
import { llmSelectionKey } from '#/features/llm/selection'
import { queryClient } from '#/lib/query-client'
import type { AuthResponse } from '#/features/auth/types'
import { getErrorMessage, type HttpError } from '#/types/http'

export function useLogout() {
  const navigate = useNavigate()

  return useMutation<AuthResponse, HttpError>({
    mutationFn: logout,
    onSuccess: (response) => {
      clearAuthSession()
      // Drop user-scoped LLM cache so the next user on this browser never
      // inherits the previous user's selection or visible options.
      queryClient.removeQueries({ queryKey: llmSelectionKey })
      queryClient.removeQueries({ queryKey: llmOptionsQueryKey })
      toast.success(response.message ?? 'Logout successful')
      navigate({ to: '/login' })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })
}
