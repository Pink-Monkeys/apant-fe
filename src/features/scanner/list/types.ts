export type ScanStatus = 'completed' | 'running' | 'failed' | 'cancelled' | 'pending'

// Derived cost view for a scan. The state distinguishes WHY a cost may be absent:
//  - computed: price known + usage reported; `amount` is set (0 => free model)
//  - unpriced: usage reported but the model had no price at scan start (unknowable)
//  - no_usage: the provider reported no token usage
//  - no_calls: the scan made no model calls (e.g. failed before any)
export type CostState = 'computed' | 'unpriced' | 'no_usage' | 'no_calls'

export type CostInfo = {
  state: CostState
  amount?: number
  currency?: string
}

// Token usage shared by the list summary and the detail view. All optional since
// scans created before token tracking (or with no model calls) omit them.
export type TokenUsage = {
  input_tokens?: number
  output_tokens?: number
  total_tokens?: number
  calls?: number
  cost?: CostInfo
}

export type Scan = {
  id: string
  target: string
  provider: string
  model: string
  status: ScanStatus
  total_steps: number
  duration: string
  created_at: string
  user_id: string
  // Snapshot of the account that ran the scan; empty for scans created before
  // this was recorded.
  username?: string
} & TokenUsage

export type ScansPage = {
  scans: Scan[]
  total: number
  page: number
  limit: number
}

export type ListScansResponse = {
  data: ScansPage
  message: string
  success: boolean
}

export type ListScanTargetsResponse = {
  data: string[]
  message: string
  success: boolean
}

// Target fingerprint shown in the "Target Information" panel. All fields beyond
// address are best-effort and may be absent.
export type ScanTargetInfo = {
  address: string
  server?: string
  operating_system?: string
  technologies?: string[]
  status?: string
  cdn?: string
  ip?: string
  title?: string
  status_code?: number
}

// A single agent tool execution. params/result vary per tool, so they are kept
// as open records and must be rendered defensively.
export type ScanStep = {
  step: number
  tool: string
  params?: Record<string, unknown>
  result?: Record<string, unknown>
  summary?: string
}

export type ScanDetail = {
  id: string
  session_id: string
  user_id: string
  username?: string
  target: string
  target_info?: ScanTargetInfo
  provider: string
  model: string
  message?: string
  description?: string
  scan_type?: string
  status: ScanStatus
  steps: ScanStep[]
  final_answer?: string
  error?: string
  duration: string
  created_at: string
  updated_at: string
} & TokenUsage

export type ScanDetailResponse = {
  data: ScanDetail
  message: string
  success: boolean
}
