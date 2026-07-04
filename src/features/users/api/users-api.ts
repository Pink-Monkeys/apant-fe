import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type {
  CreateUserPayload,
  ManagedUser,
  ResetPasswordPayload,
  UpdateRolePayload,
  UserResponse,
  UsersResponse,
} from '#/features/users/types'

export const usersQueryKey = ['users'] as const

// All endpoints are admin only; the backend returns 403 for pentesters.
export async function getUsers(): Promise<ManagedUser[]> {
  const response = await request<UsersResponse>(ENDPOINTS.users.list)
  return response.data ?? []
}

// Creates a new account for someone else; does NOT log anyone in.
export async function createUser(payload: CreateUserPayload): Promise<ManagedUser | null> {
  const response = await request<UserResponse>(ENDPOINTS.users.create, {
    method: 'POST',
    body: payload,
  })
  return response.data ?? null
}

export async function updateUserRole(
  id: string,
  payload: UpdateRolePayload
): Promise<ManagedUser | null> {
  const response = await request<UserResponse>(ENDPOINTS.users.role(id), {
    method: 'PATCH',
    body: payload,
  })
  return response.data ?? null
}

export async function resetUserPassword(id: string, payload: ResetPasswordPayload): Promise<void> {
  await request<UserResponse>(ENDPOINTS.users.resetPassword(id), {
    method: 'POST',
    body: payload,
  })
}

export async function deleteUser(id: string): Promise<void> {
  await request<void>(ENDPOINTS.users.detail(id), { method: 'DELETE' })
}
