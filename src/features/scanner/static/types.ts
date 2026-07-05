// Severity buckets returned by the SAST backend (lowercase on the wire).
export type StaticScanSeverity = 'critical' | 'high' | 'medium' | 'low' | 'informational'

export type StaticScanResult = {
  scan_id: string
  report_id: string
  session_id: string
  status: string
  duration: string
  file_count: number
  total_findings: number
  overall_severity: StaticScanSeverity | string
  final_answer: string
}

export type StaticScanResponse = {
  data: StaticScanResult
  message: string
  success: boolean
}

// Response from the async start endpoint; the scan runs in the background and is
// polled via GET /scans/:id.
export type StartStaticScanResponse = {
  data?: { scan_id: string; session_id: string; status: string }
  message?: string
  success?: boolean
}
