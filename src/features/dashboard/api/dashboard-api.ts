import type {
  DashboardSummary,
  DashboardSummaryResponse,
  ScanRankingEntry,
  ScanRankingResponse,
  TopCategoriesResponse,
  TopCategory,
} from '#/features/dashboard/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import { appendTimeRangeParams, type TimeRangeSearch } from '#/types/time-filter'

export const dashboardQueryKeys = {
  summary: (filter: TimeRangeSearch) => ['dashboard', 'summary', filter] as const,
  topCategories: (filter: TimeRangeSearch, limit: number) =>
    ['dashboard', 'top-categories', filter, limit] as const,
  scanRanking: (filter: TimeRangeSearch) => ['dashboard', 'scan-ranking', filter] as const,
}

function timeRangeQuery(filter: TimeRangeSearch): string {
  const params = new URLSearchParams()
  appendTimeRangeParams(params, filter)
  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function getDashboardSummary(filter: TimeRangeSearch): Promise<DashboardSummary> {
  const response = await request<DashboardSummaryResponse>(
    `${ENDPOINTS.dashboard.summary}${timeRangeQuery(filter)}`
  )
  return response.data
}

export async function getTopCategories(filter: TimeRangeSearch, limit = 5): Promise<TopCategory[]> {
  const params = new URLSearchParams()
  appendTimeRangeParams(params, filter)
  params.set('limit', String(limit))
  const response = await request<TopCategoriesResponse>(
    `${ENDPOINTS.dashboard.topCategories}?${params.toString()}`
  )
  return response.data || []
}

export async function getScanRanking(filter: TimeRangeSearch): Promise<ScanRankingEntry[]> {
  const response = await request<ScanRankingResponse>(
    `${ENDPOINTS.dashboard.scanRanking}${timeRangeQuery(filter)}`
  )
  return response.data || []
}
