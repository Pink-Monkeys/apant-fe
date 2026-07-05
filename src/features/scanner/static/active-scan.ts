// Persists the id of the static (SAST) scan the user is currently watching so it
// can be resumed after a refresh, navigation, or logout. Uses a distinct key from
// the dynamic scanner so the two never clobber each other.
const KEY = 'apant.static.activeScanId'

export function getActiveStaticScanId(): string | null {
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

export function setActiveStaticScanId(id: string | null): void {
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
export function clearActiveStaticScanId(): void {
  setActiveStaticScanId(null)
}
