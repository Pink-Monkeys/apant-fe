import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type {
  AgentLoopPayload,
  AgentLoopResponse,
  ScanType,
  ScanTypesResponse,
} from '#/features/scanner/dynamic/types'

export const scanTypesQueryKey = ['scan-types'] as const

export async function getScanTypes(): Promise<ScanType[]> {
  const response = await request<ScanTypesResponse>(ENDPOINTS.scanTypes)
  return response.data?.scan_types ?? []
}

export async function startAgentLoop(payload: AgentLoopPayload): Promise<AgentLoopResponse> {
  return request<AgentLoopResponse>(ENDPOINTS.agent.loop, {
    method: 'POST',
    body: payload,
  })
}
