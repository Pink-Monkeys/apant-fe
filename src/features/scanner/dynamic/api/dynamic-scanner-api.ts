import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type {
  AgentLoopPayload,
  ScanType,
  ScanTypesResponse,
  StartScanResponse,
} from '#/features/scanner/dynamic/types'

export const scanTypesQueryKey = ['scan-types'] as const

export async function getScanTypes(): Promise<ScanType[]> {
  const response = await request<ScanTypesResponse>(ENDPOINTS.scanTypes)
  return response.data?.scan_types ?? []
}

// Starts a scan in the background (returns 202 immediately). Poll GET /scans/:id
// with scanListQueryKeys.detail(id) to track progress.
export async function startAgentLoopAsync(payload: AgentLoopPayload): Promise<StartScanResponse> {
  return request<StartScanResponse>(ENDPOINTS.dynamic.scan, {
    method: 'POST',
    body: payload,
  })
}

export async function cancelScan(id: string): Promise<void> {
  await request(ENDPOINTS.scans.cancel(id), { method: 'POST' })
}
