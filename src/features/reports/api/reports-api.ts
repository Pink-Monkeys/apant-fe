import type { Report, ListReportsResponse, DetailReportResponse } from '#/features/reports/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'

export const reportsQueryKeys = {
  all: ['reports'] as const,
  detail: (id: string) => ['reports', id] as const,
}

export async function getReports(): Promise<Report[]> {
  const response = await request<ListReportsResponse>(ENDPOINTS.reports.list)
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
