import { z } from 'zod'
import type { AdapterType } from '#/features/llm/types'

export const ADAPTER_TYPES = [
  'openai-compatible',
  'openai-chat',
  'anthropic',
] as const satisfies readonly AdapterType[]

export const adapterTypeOptions: { value: AdapterType; label: string }[] = [
  { value: 'openai-compatible', label: 'OpenAI-compatible (Responses API)' },
  { value: 'openai-chat', label: 'OpenAI Chat (DeepSeek, Gemini, OpenRouter, …)' },
  { value: 'anthropic', label: 'Anthropic' },
]

// Create provider: API key is required so the provider is usable immediately.
export const createProviderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  adapter_type: z.enum(ADAPTER_TYPES),
  api_key: z.string().trim().min(1, 'API key is required'),
  base_url: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
  enabled: z.boolean(),
})

export type CreateProviderFormValues = z.infer<typeof createProviderSchema>

// Edit provider: API key is left blank by default and only sent when the user
// types a new one, so the existing key is preserved.
export const editProviderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  adapter_type: z.enum(ADAPTER_TYPES),
  api_key: z.string(),
  base_url: z.string().trim().url('Invalid URL').or(z.literal('')).optional(),
  enabled: z.boolean(),
})

export type EditProviderFormValues = z.infer<typeof editProviderSchema>

export const modelSchema = z.object({
  model_id: z.string().trim().min(1, 'Model ID is required'),
  label: z.string().trim().optional(),
  enabled: z.boolean(),
})

export type ModelFormValues = z.infer<typeof modelSchema>

export const defaultCreateProviderValues: CreateProviderFormValues = {
  name: '',
  adapter_type: 'openai-compatible',
  api_key: '',
  base_url: '',
  enabled: true,
}

export const defaultModelValues: ModelFormValues = {
  model_id: '',
  label: '',
  enabled: true,
}
