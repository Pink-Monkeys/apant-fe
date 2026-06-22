import { API_BASE_URL, ENDPOINTS } from '#/services/endpoints'
import { getErrorMessage, type HttpError } from '#/types/http'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
  credentials?: RequestCredentials
  // Internal: marks a request already retried after a token refresh so a 401
  // cannot trigger an infinite refresh loop.
  _retried?: boolean
}

// Auth/session endpoints must not trigger the refresh-and-retry flow, otherwise a
// failing refresh (or bad login) would loop. Protected endpoints like
// /auth/me, /auth/profile, /auth/change-password are NOT in this list on purpose.
const NON_REFRESHABLE_PATHS = [
  ENDPOINTS.auth.login,
  ENDPOINTS.auth.register,
  ENDPOINTS.auth.csrf,
  ENDPOINTS.auth.refresh,
  ENDPOINTS.auth.logout,
]

function isNonRefreshablePath(path: string): boolean {
  return NON_REFRESHABLE_PATHS.some((authPath) => path === authPath || path.startsWith(authPath))
}

// Single-flight: many parallel 401s share one in-flight refresh call.
let refreshPromise: Promise<boolean> | null = null

async function runRefresh(): Promise<boolean> {
  // Dynamic imports avoid a static import cycle (auth-api imports `request`).
  const { refreshToken } = await import('#/features/auth/api/auth-api')
  const { setAuthSession } = await import('#/features/auth/session')
  try {
    const response = await refreshToken()
    if (response.data?.user) {
      setAuthSession({
        tokenType: response.data.token_type,
        expiresIn: response.data.expires_in,
        user: response.data.user,
      })
      return true
    }
    return false
  } catch {
    return false
  }
}

function refreshSession(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = runRefresh().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

async function handleAuthFailure(): Promise<void> {
  const { clearAuthSession } = await import('#/features/auth/session')
  clearAuthSession()
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login')
  }
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [key, ...rest] = cookie.trim().split('=')
    if (key === name) {
      return decodeURIComponent(rest.join('='))
    }
  }

  return null
}

function createHttpError(status: number, data: unknown, fallbackMessage: string): HttpError {
  const message = getErrorMessage(data, fallbackMessage)
  const error = new Error(message) as HttpError
  error.status = status
  error.data = data
  return error
}

export async function request<T = unknown>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = 'GET',
    body,
    headers,
    signal,
    credentials = 'include',
    _retried = false,
  } = options
  const url = new URL(path, API_BASE_URL).toString()
  const isFormData = typeof FormData !== 'undefined' && body instanceof FormData
  // Let the browser set the multipart boundary; only force JSON for plain bodies.
  const resolvedHeaders: HeadersInit = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...headers,
  }

  if (method !== 'GET') {
    const csrfToken = readCookie('apant_csrf')
    if (csrfToken && !('X-CSRF-Token' in resolvedHeaders)) {
      ;(resolvedHeaders as Record<string, string>)['X-CSRF-Token'] = csrfToken
    }
  }

  const response = await fetch(url, {
    method,
    headers: resolvedHeaders,
    body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
    signal,
    credentials,
  })

  // Reactive auth recovery: on a 401, refresh the token once (shared across
  // parallel requests) and replay the original request. If refresh fails, clear
  // the session and bounce to /login, then throw the original error below.
  if (response.status === 401 && !_retried && !isNonRefreshablePath(path)) {
    const refreshed = await refreshSession()
    if (refreshed) {
      return request<T>(path, { ...options, _retried: true })
    }
    await handleAuthFailure()
  }

  if (!response.ok) {
    const contentType = response.headers.get('content-type')
    const errorPayload = contentType?.includes('application/json')
      ? await response.json()
      : await response.text()

    throw createHttpError(response.status, errorPayload, response.statusText)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T
  }

  return (await response.text()) as T
}
