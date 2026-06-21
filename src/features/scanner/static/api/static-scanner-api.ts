import { getCsrfToken } from '#/features/auth/api/auth-api'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type { StaticScanResponse } from '#/features/scanner/static/types'

function hasCsrfCookie(): boolean {
  if (typeof document === 'undefined') {
    return false
  }
  return document.cookie.split(';').some((cookie) => cookie.trim().startsWith('apant_csrf='))
}

// Runs a synchronous SAST analysis on an uploaded .zip archive. The request can
// take several minutes; no client timeout is imposed so it is not aborted early.
export async function runStaticScan(formData: FormData): Promise<StaticScanResponse> {
  if (!hasCsrfCookie()) {
    await getCsrfToken()
  }

  return request<StaticScanResponse>(ENDPOINTS.static.scan, {
    method: 'POST',
    body: formData,
  })
}
