// Adapter types accepted by the backend. Presented as a Select (not free text).
export type AdapterType = 'openai-compatible' | 'anthropic'

// ─── /llm/options (all authenticated users) ───────────────────────────────────

// A provider+models entry the current user is allowed to pick from. Only
// providers that are enabled and have a key are returned here.
export type LlmOption = {
  name: string
  adapter_type: AdapterType | string
  models: string[]
}

export type LlmOptionsResponse = {
  data?: LlmOption[]
  message?: string
  success?: boolean
}

// ─── /llm/providers (admin only) ──────────────────────────────────────────────

// A configured model under a provider. `model_id` is the wire identifier sent to
// the LLM; `label` is an optional display name.
export type LlmModel = {
  id: string
  model_id: string
  label: string
  enabled: boolean
}

// Provider as returned to the admin. The API key is always redacted: only
// `has_key` and `key_last4` are present, never the full secret.
export type LlmProvider = {
  id: string
  name: string
  adapter_type: AdapterType | string
  base_url: string
  enabled: boolean
  has_key: boolean
  key_last4: string
  models: LlmModel[]
}

export type LlmProvidersResponse = {
  data?: LlmProvider[]
  message?: string
  success?: boolean
}

export type LlmProviderResponse = {
  data?: LlmProvider
  message?: string
  success?: boolean
}

// ─── Payloads ─────────────────────────────────────────────────────────────────

export type CreateProviderPayload = {
  name: string
  adapter_type: AdapterType
  api_key: string
  base_url?: string
  enabled?: boolean
}

// All fields optional; only changed fields are sent. Omitting `api_key` (or
// sending an empty string) preserves the existing key on the backend.
export type UpdateProviderPayload = {
  name?: string
  adapter_type?: AdapterType
  api_key?: string
  base_url?: string
  enabled?: boolean
}

export type AddModelPayload = {
  model_id: string
  label?: string
  enabled?: boolean
}

export type UpdateModelPayload = {
  model_id?: string
  label?: string
  enabled?: boolean
}

// ─── Test & fetch models ──────────────────────────────────────────────────────

export type TestProviderResponse = {
  ok: boolean
  message: string
  available_models?: string[]
}

// The backend wraps the test result in the standard envelope.
export type TestProviderEnvelope = {
  data?: TestProviderResponse
  message?: string
  success?: boolean
} & Partial<TestProviderResponse>

// ─── Persisted selection ──────────────────────────────────────────────────────

// The provider+model the user picked; sent as-is to scan endpoints. `provider`
// is the provider NAME (e.g. "OpenAI"); the backend matches it case-insensitively.
export type LlmSelection = {
  provider: string
  model: string
}
