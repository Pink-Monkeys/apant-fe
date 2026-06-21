import type {
  Scan,
  ScanDetail,
  ListScansResponse,
  ScanDetailResponse,
} from '#/features/scanner/list/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'

export const scanListQueryKeys = {
  all: ['scans'] as const,
  detail: (id: string) => ['scans', id] as const,
}

export async function getScans(): Promise<Scan[]> {
  const response = await request<ListScansResponse>(ENDPOINTS.scans.list)
  return response.data || []
}

export async function getScanById(id: string): Promise<ScanDetail> {
  const response = await request<ScanDetailResponse>(ENDPOINTS.scans.detail(id))
  return response.data
}
