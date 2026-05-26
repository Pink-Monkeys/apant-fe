export type ApiErrorEnvelope = {
  message?: string
  error?: string
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
    const message = typeof payload.message === 'string' ? payload.message : ''
    const error = typeof payload.error === 'string' ? payload.error : ''

    if (message.length > 0) {
      return message
    }

    if (error.length > 0) {
      return error
    }
  }

  return fallbackMessage
}
