import type { Scan, ListScansResponse } from '#/features/scanner/list/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'

export const scanListQueryKeys = {
  all: ['scans'] as const,
}

export async function getScans(): Promise<Scan[]> {
  const response = await request<ListScansResponse>(ENDPOINTS.scans.list)
  return response.data || []
}
