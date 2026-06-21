export type ScanStatus = 'completed' | 'running' | 'failed' | 'pending'

export type Scan = {
  id: string
  target: string
  provider: string
  model: string
  status: ScanStatus
  total_steps: number
  duration: string
  created_at: string
}

export type ListScansResponse = {
  data: Scan[]
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
  duration: string
  created_at: string
  updated_at: string
}

export type ScanDetailResponse = {
  data: ScanDetail
  message: string
  success: boolean
}
