import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'

import { logout } from '#/features/auth/api/auth-api'
import { clearAuthSession } from '#/features/auth/session'
import type { AuthResponse } from '#/features/auth/types'
import { getErrorMessage, type HttpError } from '#/types/http'

export function useLogout() {
  const navigate = useNavigate()

  return useMutation<AuthResponse, HttpError>({
    mutationFn: logout,
    onSuccess: (response) => {
      clearAuthSession()
      toast.success(response.message ?? 'Logout successful')
      navigate({ to: '/login' })
    },
    onError: (error) => {
      toast.error(getErrorMessage(error.data, error.message))
    },
  })
}
