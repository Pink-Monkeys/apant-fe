import { API_BASE_URL } from '#/services/endpoints'
import { getErrorMessage, type HttpError } from '#/types/http'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
  credentials?: RequestCredentials
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

export async function request<T = unknown>(
  path: string,
  { method = 'GET', body, headers, signal, credentials = 'include' }: RequestOptions = {}
): Promise<T> {
  const url = new URL(path, API_BASE_URL).toString()
  const resolvedHeaders: HeadersInit = {
    'Content-Type': 'application/json',
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
    body: body ? JSON.stringify(body) : undefined,
    signal,
    credentials,
  })

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
