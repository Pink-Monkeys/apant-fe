import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type { AuthResponse, LoginPayload, RegisterPayload } from '#/features/auth/types'

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>(ENDPOINTS.auth.login, {
    method: 'POST',
    body: payload,
  })
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  return request<AuthResponse>(ENDPOINTS.auth.register, {
    method: 'POST',
    body: payload,
  })
}

export async function getCsrfToken(): Promise<void> {
  await request(ENDPOINTS.auth.csrf, { method: 'GET' })
}

export async function refreshToken(): Promise<AuthResponse> {
  return request<AuthResponse>(ENDPOINTS.auth.refresh, {
    method: 'POST',
    body: {},
  })
}

export async function logout(): Promise<AuthResponse> {
  return request<AuthResponse>(ENDPOINTS.auth.logout, {
    method: 'POST',
    body: {},
  })
}
