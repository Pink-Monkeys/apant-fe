import type { Tool, ListToolsResponse } from '#/features/tools/types'
import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'

export const toolsQueryKeys = {
  all: ['tools'] as const,
}

export async function getTools(): Promise<Tool[]> {
  const response = await request<ListToolsResponse>(ENDPOINTS.tools)
  return response.data?.tools ?? []
}
