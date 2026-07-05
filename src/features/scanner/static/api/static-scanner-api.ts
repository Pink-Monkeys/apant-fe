import { getCsrfToken } from '#/features/auth/api/auth-api'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type { StartStaticScanResponse } from '#/features/scanner/static/types'

function hasCsrfCookie(): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('apant_csrf='))
}

// Starts a SAST scan in the background (returns 202 immediately after upload).
// Poll GET /scans/:id with scanListQueryKeys.detail(id) to track progress.
export async function startStaticScanAsync(formData: FormData): Promise<StartStaticScanResponse> {
  if (!hasCsrfCookie()) {
    await getCsrfToken()
  }

  return request<StartStaticScanResponse>(ENDPOINTS.static.scan, {
    method: 'POST',
    body: formData,
  })
}
