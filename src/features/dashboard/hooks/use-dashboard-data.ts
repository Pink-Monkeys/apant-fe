import { useQueries, useQuery } from '@tanstack/react-query'

import { getScans, scanListQueryKeys } from '#/features/scanner/list/api/scan-list-api'
import { getReportDetail, getReports, reportsQueryKeys } from '#/features/reports/api/reports-api'
import { getTools, toolsQueryKeys } from '#/features/tools/api/tools-api'
import type { Report } from '#/features/reports/types'
import { severityStyles } from '#/lib/severity'
import { shortId } from '#/lib/utils'
import type { ScanRankingDatum, TopCategoryDatum } from '#/components/dashboard/charts/chart-data'

// Fixed severity order so the Scan Results Ranking always shows all five
// categories (zero-value bars stay hidden, labels remain).
const SEVERITY_ORDER = ['Critical', 'High', 'Medium', 'Low', 'Informational'] as const

const TOP_CATEGORIES_LIMIT = 5

export type DashboardMetrics = {
  totalSessions: number
  todaySession: number
  scanSuccess: number
  scanFailure: number
  totalTools: number
}

export type DashboardData = {
  metrics: DashboardMetrics
  scanRanking: ScanRankingDatum[]
  topCategories: TopCategoryDatum[]
  isLoading: boolean
}

function isSameLocalDay(iso: string, reference: Date): boolean {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return false
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  )
}

function capitalizeSeverity(severity: string): string {
  if (!severity) return severity
  return severity.charAt(0).toUpperCase() + severity.slice(1)
}

function buildScanRanking(reports: Report[]): ScanRankingDatum[] {
  return SEVERITY_ORDER.map((severity) => {
    const matching = reports.filter(
      (report) => capitalizeSeverity(report.overall_severity) === severity
    )

    const latest = matching.reduce<Report | undefined>((newest, report) => {
      if (!newest) return report
      return new Date(report.created_at).getTime() > new Date(newest.created_at).getTime()
        ? report
        : newest
    }, undefined)

    return {
      severity,
      report: latest ? shortId('RPT', latest.id) : '',
      value: matching.length,
      className: severityStyles[severity],
    }
  })
}

function buildTopCategories(reportDetails: Array<Report | undefined>): TopCategoryDatum[] {
  const counts = new Map<string, number>()

  for (const report of reportDetails) {
    for (const vuln of report?.vulnerabilities ?? []) {
      const type = vuln.type?.trim()
      if (!type) continue
      counts.set(type, (counts.get(type) ?? 0) + 1)
    }
  }

  return [...counts.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, TOP_CATEGORIES_LIMIT)
}

export function useDashboardData(): DashboardData {
  const scansQuery = useQuery({ queryKey: scanListQueryKeys.all, queryFn: getScans })
  const reportsQuery = useQuery({ queryKey: reportsQueryKeys.all, queryFn: getReports })
  const toolsQuery = useQuery({ queryKey: toolsQueryKeys.all, queryFn: getTools })

  const reports = reportsQuery.data ?? []

  // The list endpoint omits vulnerabilities, so fetch each report's detail to
  // aggregate vulnerability types for Top Categories.
  const detailQueries = useQueries({
    queries: reports.map((report) => ({
      queryKey: reportsQueryKeys.detail(report.id),
      queryFn: () => getReportDetail(report.id),
    })),
  })

  const scans = scansQuery.data ?? []
  const tools = toolsQuery.data ?? []
  const reportDetails = detailQueries.map((query) => query.data)

  const now = new Date()
  const metrics: DashboardMetrics = {
    totalSessions: scans.length,
    todaySession: scans.filter((scan) => isSameLocalDay(scan.created_at, now)).length,
    scanSuccess: scans.filter((scan) => scan.status === 'completed').length,
    scanFailure: scans.filter((scan) => scan.status === 'failed').length,
    totalTools: tools.length,
  }

  const isLoading =
    scansQuery.isLoading ||
    reportsQuery.isLoading ||
    toolsQuery.isLoading ||
    detailQueries.some((query) => query.isLoading)

  return {
    metrics,
    scanRanking: buildScanRanking(reports),
    topCategories: buildTopCategories(reportDetails),
    isLoading,
  }
}
