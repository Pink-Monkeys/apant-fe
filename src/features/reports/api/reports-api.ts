import type {
  Report,
  ReportsPage,
  ListReportsResponse,
  ListReportTargetsResponse,
  DetailReportResponse,
} from '#/features/reports/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import { appendTimeRangeParams, type TimeRangeSearch } from '#/types/time-filter'

export type GetReportsParams = TimeRangeSearch & {
  target?: string
  page?: number
  limit?: number
}

export const reportsQueryKeys = {
  all: ['reports'] as const,
  list: (params: GetReportsParams) => ['reports', 'list', params] as const,
  targets: ['reports', 'targets'] as const,
  detail: (id: string) => ['reports', id] as const,
}

export async function getReports(params: GetReportsParams = {}): Promise<ReportsPage> {
  const searchParams = new URLSearchParams()
  appendTimeRangeParams(searchParams, params)
  if (params.target) searchParams.set('target', params.target)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  const query = searchParams.toString()

  const response = await request<ListReportsResponse>(
    `${ENDPOINTS.reports.list}${query ? `?${query}` : ''}`
  )
  return response.data
}

export async function getReportTargets(): Promise<string[]> {
  const response = await request<ListReportTargetsResponse>(ENDPOINTS.reports.targets)
  return response.data || []
}

export async function getReportDetail(id: string): Promise<Report> {
  const response = await request<DetailReportResponse>(ENDPOINTS.reports.detail(id))
  return response.data
}

export async function deleteReport(id: string): Promise<void> {
  await request<void>(ENDPOINTS.reports.detail(id), {
    method: 'DELETE',
  })
}
