import { useQuery } from '@tanstack/react-query'

import {
  dashboardQueryKeys,
  getDashboardSummary,
  getScanRanking,
  getTopCategories,
} from '#/features/dashboard/api/dashboard-api'
import { severityStyles } from '#/lib/severity'
import { shortId } from '#/lib/utils'
import type { ScanRankingDatum, TopCategoryDatum } from '#/components/dashboard/charts/chart-data'
import type { TimeRangeSearch } from '#/types/time-filter'

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  informational: 'Informational',
}

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

export function useDashboardData(
  filter: TimeRangeSearch,
  options: { expandCategories?: boolean } = {}
): DashboardData {
  const categoriesLimit = options.expandCategories ? 0 : TOP_CATEGORIES_LIMIT

  const summaryQuery = useQuery({
    queryKey: dashboardQueryKeys.summary(filter),
    queryFn: () => getDashboardSummary(filter),
  })

  const topCategoriesQuery = useQuery({
    queryKey: dashboardQueryKeys.topCategories(filter, categoriesLimit),
    queryFn: () => getTopCategories(filter, categoriesLimit),
  })

  const scanRankingQuery = useQuery({
    queryKey: dashboardQueryKeys.scanRanking(filter),
    queryFn: () => getScanRanking(filter),
  })

  const summary = summaryQuery.data
  const metrics: DashboardMetrics = {
    totalSessions: summary?.total_sessions ?? 0,
    todaySession: summary?.today_sessions ?? 0,
    scanSuccess: summary?.scan_success ?? 0,
    scanFailure: summary?.scan_failure ?? 0,
    totalTools: summary?.total_tools ?? 0,
  }

  const scanRanking: ScanRankingDatum[] = (scanRankingQuery.data ?? []).map((entry) => {
    const label = SEVERITY_LABELS[entry.severity] ?? entry.severity
    return {
      severity: label,
      report: entry.report_id ? shortId('RPT', entry.report_id) : '',
      value: entry.count,
      className:
        severityStyles[label as keyof typeof severityStyles] ?? severityStyles.Informational,
    }
  })

  const topCategories: TopCategoryDatum[] = (topCategoriesQuery.data ?? []).map((item) => ({
    category: item.category,
    value: item.count,
    avgCvss: item.avg_cvss,
  }))

  return {
    metrics,
    scanRanking,
    topCategories,
    isLoading: summaryQuery.isLoading || topCategoriesQuery.isLoading || scanRankingQuery.isLoading,
  }
}
