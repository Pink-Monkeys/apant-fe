export type ReportSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational'

export type ReportMetadata = {
  target: string
  description?: string
  scan_date: string
  duration: string
  provider: string
  model: string
  tools_used: string[]
  total_steps: number
}

export type SeverityStats = {
  critical: number
  high: number
  medium: number
  low: number
  informational: number
}

export type ReportStatistics = {
  total_vulnerabilities: number
  by_severity: SeverityStats
  exploit_success_count: number
  scan_status: string
}

export type TargetInfo = {
  url: string
  ip_address: string
  web_server: string
  operating_system: string
  tech_stack: string[] | null
  open_ports: number[] | null
  status_code: number
  status: string
  cdn: string
  page_title: string
}

export type AttackSurface = {
  subdomains_found: number
  urls_crawled: number
  parameterized_endpoints: number
  open_ports_count: number
}

export type VulnerabilityPoC = {
  method: string
  url: string
  payload: string
  curl_cmd: string
}

export type Vulnerability = {
  id: string
  title: string
  severity: ReportSeverity
  type: string
  location: string
  description: string
  impact: string
  poc: VulnerabilityPoC
  recommendation: string
  verified: boolean
}

export type Report = {
  id: string
  session_id?: string
  user_id?: string
  created_at: string
  scan_id?: string
  title: string
  overall_severity: ReportSeverity
  executive_summary?: string
  conclusion?: string
  mitigation?: string
  metadata: ReportMetadata
  target_info?: TargetInfo
  attack_surface?: AttackSurface
  vulnerabilities?: Vulnerability[]
  statistics: ReportStatistics
}

export type ListReportsResponse = {
  data: Report[]
  message: string
  success: boolean
}

export type DetailReportResponse = {
  data: Report
  message: string
  success: boolean
}
