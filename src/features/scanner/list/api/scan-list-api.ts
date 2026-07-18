import type {
  ScanDetail,
  ScansPage,
  ListScansResponse,
  ScanDetailResponse,
  ListScanTargetsResponse,
} from '#/features/scanner/list/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import { appendTimeRangeParams, type TimeRangeSearch } from '#/types/time-filter'

export type GetScansParams = TimeRangeSearch & {
  target?: string
  page?: number
  limit?: number
}

export const scanListQueryKeys = {
  all: ['scans'] as const,
  list: (params: GetScansParams) => ['scans', 'list', params] as const,
  targets: ['scans', 'targets'] as const,
  detail: (id: string) => ['scans', id] as const,
}

export async function getScans(params: GetScansParams = {}): Promise<ScansPage> {
  const searchParams = new URLSearchParams()
  appendTimeRangeParams(searchParams, params)
  if (params.target) searchParams.set('target', params.target)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  const query = searchParams.toString()

  const response = await request<ListScansResponse>(
    `${ENDPOINTS.scans.list}${query ? `?${query}` : ''}`
  )
  return response.data
}

export async function getScanTargets(): Promise<string[]> {
  const response = await request<ListScanTargetsResponse>(ENDPOINTS.scans.targets)
  return response.data || []
}

export async function getScanById(id: string): Promise<ScanDetail> {
  const response = await request<ScanDetailResponse>(ENDPOINTS.scans.detail(id))
  return response.data
}
