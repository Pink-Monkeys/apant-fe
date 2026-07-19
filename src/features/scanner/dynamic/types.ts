// Authenticated session attached to scan requests so pages behind a login can be
// scanned. Mirrors the backend AuthConfig contract.
export type AuthConfig = {
  type: 'cookie' | 'bearer' | 'basic' | 'header' | 'form'
  // Used by cookie/bearer/basic/header. Not used by 'form', where the tools log
  // in themselves via the fields below.
  value?: string
  header_name?: string
  // Fields for type 'form': the tools submit these to the target's HTML login
  // form, capture the session cookie, then scan pages behind the login.
  login_url?: string
  username?: string
  password?: string
  verify_url?: string
  username_field?: string
  password_field?: string
  success_regex?: string
}

export type AgentLoopPayload = {
  provider: string
  model: string
  target: string
  description: string
  scan_type?: string
  // Omitted so the backend's own default step budget governs — a single source of
  // truth. Only send it to deliberately override that default for one scan.
  max_steps?: number
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
  server?: string
  technologies?: string[]
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

// Response from the async start endpoint; the scan runs in the background and is
// polled via GET /scans/:id.
export type StartScanResponse = {
  data?: { scan_id: string; session_id: string; status: string }
  message?: string
  success?: boolean
}
