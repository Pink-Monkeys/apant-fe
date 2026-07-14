import { useMutation, useQuery } from '@tanstack/react-query'
import { queryClient } from '#/lib/query-client'
import { getLlmSelection, setLlmSelection } from '#/features/llm/api/llm-api'
import type { LlmOption, LlmSelection } from '#/features/llm/types'
import type { HttpError } from '#/types/http'

// Query key for the per-user selection. The backend (scoped by JWT) is the
// source of truth; React Query holds the cached copy. No localStorage — a global
// key leaked one user's choice to the next on a shared browser.
export const llmSelectionKey = ['llm', 'selection'] as const

// Reads the current user's selection from the backend. Readers (scan forms, the
// active-LLM indicator) subscribe through this hook.
export function useLlmSelection() {
  return useQuery({
    queryKey: llmSelectionKey,
    queryFn: getLlmSelection,
  })
}

// Persists a new selection and updates the cache from the backend's validated
// response, so every subscriber reflects the change immediately.
export function useSetLlmSelection() {
  return useMutation<LlmSelection | null, HttpError, LlmSelection>({
    mutationFn: setLlmSelection,
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(llmSelectionKey, data)
      }
    },
  })
}

// The first provider+model available, used as a local fallback while the
// backend selection is still loading or empty.
export function firstOptionSelection(options: LlmOption[]): LlmSelection | null {
  for (const option of options) {
    const model = option.models[0]
    if (model) {
      return { provider: option.name, model }
    }
  }
  return null
}

// Resolves the selection to actually use given the current options: an explicit
// selection if it is still valid against the options, otherwise the first option.
// Kept as a client-side safety net; the backend already validates the stored
// selection. Returns null only when there are no options at all.
export function resolveSelection(
  selection: LlmSelection | null,
  options: LlmOption[]
): LlmSelection | null {
  if (selection) {
    const provider = options.find(
      (option) => option.name.toLowerCase() === selection.provider.toLowerCase()
    )
    if (provider?.models.includes(selection.model)) {
      return selection
    }
  }
  return firstOptionSelection(options)
}
