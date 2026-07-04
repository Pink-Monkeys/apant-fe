import { queryClient } from '#/lib/query-client'
import type { LlmOption, LlmSelection } from '#/features/llm/types'

export const llmSelectionKey = ['llm', 'selection'] as const

const STORAGE_KEY = 'apant.llm.selection'

function readFromStorage(): LlmSelection | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<LlmSelection>
    if (typeof parsed.provider === 'string' && typeof parsed.model === 'string') {
      return { provider: parsed.provider, model: parsed.model }
    }
  } catch {
    // Corrupt value; ignore and fall through to null.
  }
  return null
}

function writeToStorage(selection: LlmSelection | null): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    if (selection) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection))
    } else {
      window.localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Storage unavailable (private mode/quota); selection stays in-memory only.
  }
}

// Reads the current selection. Query cache is the source of truth; on a cold
// start (reload) it is empty, so hydrate it from localStorage once.
export function getLlmSelection(): LlmSelection | null {
  const cached = queryClient.getQueryData<LlmSelection | null>(llmSelectionKey)
  if (cached) {
    return cached
  }
  const stored = readFromStorage()
  if (stored) {
    queryClient.setQueryData(llmSelectionKey, stored)
  }
  return stored
}

export function setLlmSelection(selection: LlmSelection): void {
  queryClient.setQueryData(llmSelectionKey, selection)
  writeToStorage(selection)
}

export function clearLlmSelection(): void {
  queryClient.setQueryData(llmSelectionKey, null)
  writeToStorage(null)
}

// The first provider+model available, used as the default when the user has not
// picked yet.
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
// Returns null only when there are no options at all.
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
