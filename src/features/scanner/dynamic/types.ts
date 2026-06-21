// Authenticated session attached to scan requests so pages behind a login can be
// scanned. Mirrors the backend AuthConfig contract.
export type AuthConfig = {
  type: 'cookie' | 'bearer' | 'basic' | 'header'
  value: string
  header_name?: string
}

export type AgentLoopPayload = {
  provider: string
  model: string
  target: string
  description: string
  scan_type?: string
  max_steps: number
  auth?: AuthConfig
}

export type ScanType = {
  key: string
  label: string
}

export type ScanTypesResponse = {
  data: {
    scan_types: ScanType[]
  }
  message: string
  success: boolean
}

export type AgentLoopStep = {
  step: number
  tool: string
  params: Record<string, unknown>
  result: Record<string, unknown>
  summary?: string
}

export type AgentTargetInfo = {
  address: string
  operating_system: string
  status: string
  cdn: string
  ip: string
  title: string
  status_code: number
}

export type AgentLoopData = {
  session_id: string
  scan_id?: string
  steps: AgentLoopStep[]
  final_answer: string
  total_steps: number
  target_info?: AgentTargetInfo
}

export type AgentLoopResponse = {
  data: AgentLoopData
  message: string
  success: boolean
}
