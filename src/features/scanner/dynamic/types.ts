export type AgentLoopPayload = {
  provider: string
  model: string
  target: string
  description: string
  scan_type?: string
  max_steps: number
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

export type AgentLoopData = {
  session_id: string
  steps: AgentLoopStep[]
  final_answer: string
  total_steps: number
}

export type AgentLoopResponse = {
  data: AgentLoopData
  message: string
  success: boolean
}
