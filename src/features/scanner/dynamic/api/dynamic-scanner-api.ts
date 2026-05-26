import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type { AgentLoopPayload, AgentLoopResponse } from '#/features/scanner/dynamic/types'

export async function startAgentLoop(payload: AgentLoopPayload): Promise<AgentLoopResponse> {
  return request<AgentLoopResponse>(ENDPOINTS.agent.loop, {
    method: 'POST',
    body: payload,
  })
}
