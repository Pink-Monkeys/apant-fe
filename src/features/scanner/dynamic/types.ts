export type AgentLoopPayload = {
  provider: string
  model: string
  message: string
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
