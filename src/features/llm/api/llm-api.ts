import { ENDPOINTS } from '#/services/endpoints'
import { request } from '#/services/http/client'
import type {
  AddModelPayload,
  CreateProviderPayload,
  LlmModel,
  LlmOption,
  LlmOptionsResponse,
  LlmProvider,
  LlmProviderResponse,
  LlmProvidersResponse,
  TestProviderEnvelope,
  TestProviderResponse,
  UpdateModelPayload,
  UpdateProviderPayload,
} from '#/features/llm/types'

export const llmOptionsQueryKey = ['llm', 'options'] as const
export const llmProvidersQueryKey = ['llm', 'providers'] as const

// Options available to every authenticated user (enabled providers with a key).
export async function getLlmOptions(): Promise<LlmOption[]> {
  const response = await request<LlmOptionsResponse>(ENDPOINTS.llm.options)
  return response.data ?? []
}

// ─── Providers (admin only; backend returns 403 for pentesters) ───────────────

export async function getProviders(): Promise<LlmProvider[]> {
  const response = await request<LlmProvidersResponse>(ENDPOINTS.llm.providers)
  return response.data ?? []
}

export async function getProvider(id: string): Promise<LlmProvider | null> {
  const response = await request<LlmProviderResponse>(ENDPOINTS.llm.provider(id))
  return response.data ?? null
}

export async function createProvider(payload: CreateProviderPayload): Promise<LlmProvider | null> {
  const response = await request<LlmProviderResponse>(ENDPOINTS.llm.providers, {
    method: 'POST',
    body: payload,
  })
  return response.data ?? null
}

export async function updateProvider(
  id: string,
  payload: UpdateProviderPayload
): Promise<LlmProvider | null> {
  const response = await request<LlmProviderResponse>(ENDPOINTS.llm.provider(id), {
    method: 'PATCH',
    body: payload,
  })
  return response.data ?? null
}

export async function deleteProvider(id: string): Promise<void> {
  await request<void>(ENDPOINTS.llm.provider(id), { method: 'DELETE' })
}

// Verifies the key and fetches the provider's available models. The backend may
// wrap the result in the standard envelope or return it flat; normalise both.
export async function testProvider(id: string): Promise<TestProviderResponse> {
  const response = await request<TestProviderEnvelope>(ENDPOINTS.llm.testProvider(id), {
    method: 'POST',
  })
  const result = response.data ?? response
  return {
    ok: Boolean(result.ok),
    message: result.message ?? '',
    available_models: result.available_models ?? [],
  }
}

// ─── Models (admin only) ──────────────────────────────────────────────────────

export async function addModel(providerId: string, payload: AddModelPayload): Promise<void> {
  await request<LlmProviderResponse>(ENDPOINTS.llm.models(providerId), {
    method: 'POST',
    body: payload,
  })
}

export async function updateModel(
  providerId: string,
  modelId: string,
  payload: UpdateModelPayload
): Promise<void> {
  await request<LlmProviderResponse>(ENDPOINTS.llm.model(providerId, modelId), {
    method: 'PATCH',
    body: payload,
  })
}

export async function deleteModel(providerId: string, modelId: string): Promise<void> {
  await request<void>(ENDPOINTS.llm.model(providerId, modelId), { method: 'DELETE' })
}

export type { LlmModel }
