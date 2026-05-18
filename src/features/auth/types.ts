export type LoginPayload = {
  email?: string
  username?: string
  password: string
}

export type RegisterPayload = {
  username: string
  email: string
  password: string
}

export type AuthUser = {
  id: string | number
  email?: string
  username?: string
  role?: string
}

export type AuthTokenPayload = {
  token_type?: string
  expires_in?: number
  user: AuthUser
}

export type AuthResponse = {
  data?: AuthTokenPayload
  message?: string
  success?: boolean
} & Record<string, unknown>

export type AuthSession = {
  tokenType?: string
  expiresIn?: number
  user: AuthUser
}
