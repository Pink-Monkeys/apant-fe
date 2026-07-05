// Persists the id of the dynamic scan the user is currently watching so it can be
// resumed after a refresh, navigation, or logout. Mirrors the localStorage style
// of #/features/llm/selection.ts.
const KEY = 'apant.dynamic.activeScanId'

export function getActiveScanId(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const raw = window.localStorage.getItem(KEY)
    return raw && raw.length > 0 ? raw : null
  } catch {
    return null
  }
}

export function setActiveScanId(id: string | null): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    if (id) {
      window.localStorage.setItem(KEY, id)
    } else {
      window.localStorage.removeItem(KEY)
    }
  } catch {
    // Storage unavailable (private mode/quota); resume simply won't persist.
  }
}

// Removes only the persisted id (not React state) so a finished scan stays on
// screen this session but is not resumed on the next refresh.
export function clearActiveScanId(): void {
  setActiveScanId(null)
}
