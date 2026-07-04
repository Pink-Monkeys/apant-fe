export type UserRole = 'admin' | 'pentester'

export type ManagedUser = {
  id: string
  username: string
  email: string
  role: UserRole | string
  created_at: string
  updated_at: string
}

export type UsersResponse = { data?: ManagedUser[]; message?: string; success?: boolean }
export type UserResponse = { data?: ManagedUser; message?: string; success?: boolean }
export type UpdateRolePayload = { role: UserRole }
export type ResetPasswordPayload = { new_password: string }
export type CreateUserPayload = {
  username: string
  email: string
  password: string
  role: UserRole
}
