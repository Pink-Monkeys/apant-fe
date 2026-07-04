export type ApiErrorEnvelope = {
  message?: string
  error?: string | { message?: string; [k: string]: unknown }
  code?: string
  errors?: Record<string, string[]> | string[]
} & Record<string, unknown>

export type HttpError = Error & {
  status: number
  data?: ApiErrorEnvelope | string | unknown
}

export function getErrorMessage(data: unknown, fallbackMessage: string): string {
  if (typeof data === 'string' && data.length > 0) {
    return data
  }

  if (data && typeof data === 'object') {
    const payload = data as Record<string, unknown>

    // Top-level message
    const message = typeof payload.message === 'string' ? payload.message : ''
    if (message.length > 0) {
      return message
    }

    // error can be either a string OR the backend's nested shape { message: string }
    const error = payload.error
    if (typeof error === 'string' && error.length > 0) {
      return error
    }
    if (error && typeof error === 'object') {
      const nested = (error as Record<string, unknown>).message
      if (typeof nested === 'string' && nested.length > 0) {
        return nested
      }
    }
  }

  return fallbackMessage
}
