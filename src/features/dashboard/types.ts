export type DashboardSummary = {
  total_sessions: number
  today_sessions: number
  scan_success: number
  scan_failure: number
  total_tools: number
}

export type TopCategory = {
  category: string
  count: number
  avg_cvss: number
}

export type ScanRankingSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational'

export type ScanRankingEntry = {
  severity: ScanRankingSeverity
  count: number
  report_id?: string
}

export type DashboardSummaryResponse = {
  data: DashboardSummary
  message: string
  success: boolean
}

export type TopCategoriesResponse = {
  data: TopCategory[]
  message: string
  success: boolean
}

export type ScanRankingResponse = {
  data: ScanRankingEntry[]
  message: string
  success: boolean
}
