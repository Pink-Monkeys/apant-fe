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

export const DEFAULT_PRICE_CURRENCY = 'USD'

// Parses the two price text inputs from the model form, mirroring the backend's
// both-or-neither + non-negative rule. Returns `priced: null` when both are blank
// (unpriced), a { in, out } pair when both are valid, or an error message when
// only one is filled or a value is invalid/negative. A value of 0 is allowed
// (free model).
export function parseModelPrice(
  inStr: string,
  outStr: string
): { ok: true; priced: { in: number; out: number } | null } | { ok: false; error: string } {
  const a = inStr.trim()
  const b = outStr.trim()
  if (a === '' && b === '') return { ok: true, priced: null }
  if (a === '' || b === '') {
    return { ok: false, error: 'Set both input and output price, or leave both blank' }
  }
  const inNum = Number(a)
  const outNum = Number(b)
  if (!Number.isFinite(inNum) || !Number.isFinite(outNum)) {
    return { ok: false, error: 'Prices must be numbers' }
  }
  if (inNum < 0 || outNum < 0) {
    return { ok: false, error: 'Prices must not be negative' }
  }
  return { ok: true, priced: { in: inNum, out: outNum } }
}
