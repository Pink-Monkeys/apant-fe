import { env } from '#/config/env'

export const API_BASE_URL = env.apiBaseUrl

export const ENDPOINTS = {
  health: '/api/v1/health',
  scanTypes: '/api/v1/scan-types',
  agent: {
    loop: '/api/v1/agent/loop',
  },
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    csrf: '/api/v1/auth/csrf',
    refresh: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout',
  },
  reports: {
    list: '/api/v1/reports',
    detail: (id: string) => `/api/v1/reports/${id}`,
  },
} as const
