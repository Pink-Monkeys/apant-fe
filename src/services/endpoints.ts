import { env } from '#/config/env'

export const API_BASE_URL = env.apiBaseUrl

export const ENDPOINTS = {
  health: '/api/v1/health',
  scanTypes: '/api/v1/scan-types',
  tools: '/api/v1/tools',
  dynamic: {
    scan: '/api/v1/dynamic/scan',
  },
  static: {
    scan: '/api/v1/static/scan',
  },
  auth: {
    login: '/api/v1/auth/login',
    register: '/api/v1/auth/register',
    csrf: '/api/v1/auth/csrf',
    refresh: '/api/v1/auth/refresh-token',
    logout: '/api/v1/auth/logout',
    me: '/api/v1/auth/me',
    profile: '/api/v1/auth/profile',
    changePassword: '/api/v1/auth/change-password',
  },
  reports: {
    list: '/api/v1/reports',
    detail: (id: string) => `/api/v1/reports/${id}`,
    targets: '/api/v1/reports/targets',
  },
  dashboard: {
    summary: '/api/v1/dashboard/summary',
    topCategories: '/api/v1/dashboard/top-categories',
    scanRanking: '/api/v1/dashboard/scan-ranking',
  },
  scans: {
    list: '/api/v1/scans',
    targets: '/api/v1/scans/targets',
    detail: (id: string) => `/api/v1/scans/${id}`,
    cancel: (id: string) => `/api/v1/scans/${id}/cancel`,
  },
  llm: {
    options: '/api/v1/llm/options',
    selection: '/api/v1/llm/selection',
    providers: '/api/v1/llm/providers',
    provider: (id: string) => `/api/v1/llm/providers/${id}`,
    testProvider: (id: string) => `/api/v1/llm/providers/${id}/test`,
    models: (id: string) => `/api/v1/llm/providers/${id}/models`,
    model: (id: string, modelId: string) => `/api/v1/llm/providers/${id}/models/${modelId}`,
  },
  users: {
    list: '/api/v1/users',
    create: '/api/v1/users',
    role: (id: string) => `/api/v1/users/${id}/role`,
    resetPassword: (id: string) => `/api/v1/users/${id}/reset-password`,
    detail: (id: string) => `/api/v1/users/${id}`,
  },
} as const
