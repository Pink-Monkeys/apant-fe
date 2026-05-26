import { env } from '#/config/env'

export const API_BASE_URL = env.apiBaseUrl

export const ENDPOINTS = {
  health: '/api/v1/health',
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    refresh: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout',
  },
} as const
