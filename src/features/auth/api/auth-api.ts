import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type {
  AuthResponse,
  ChangePasswordPayload,
  LoginPayload,
  MeResponse,
  RegisterPayload,
  UpdateProfilePayload,
} from '#/features/auth/types'

export const meQueryKey = ['auth', 'me'] as const

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

export async function getMe(): Promise<MeResponse> {
  return request<MeResponse>(ENDPOINTS.auth.me, { method: 'GET' })
}

// PATCH/POST below are non-GET, so the http client automatically attaches the
// X-CSRF-Token header from the CSRF cookie (same as login/refresh).
export async function updateProfile(payload: UpdateProfilePayload): Promise<MeResponse> {
  return request<MeResponse>(ENDPOINTS.auth.profile, {
    method: 'PATCH',
    body: payload,
  })
}

export async function changePassword(payload: ChangePasswordPayload): Promise<AuthResponse> {
  return request<AuthResponse>(ENDPOINTS.auth.changePassword, {
    method: 'POST',
    body: payload,
  })
}
