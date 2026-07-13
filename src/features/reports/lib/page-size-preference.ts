// Persists the reports table "rows per page" choice so it survives navigation
// away and back (the sidebar links to a bare /reports without the ?limit param).
// The URL search param still wins when present (shareable links); this is only
// the fallback default.
const STORAGE_KEY = 'apant.reports.pageSize'

export const DEFAULT_REPORTS_PAGE_SIZE = 20

export function readReportsPageSize(): number {
  if (typeof window === 'undefined') {
    return DEFAULT_REPORTS_PAGE_SIZE
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const parsed = raw ? Number(raw) : NaN
    if (Number.isInteger(parsed) && parsed > 0 && parsed <= 100) {
      return parsed
    }
  } catch {
    // Storage unavailable (private mode/quota); fall through to the default.
  }
  return DEFAULT_REPORTS_PAGE_SIZE
}

export function writeReportsPageSize(pageSize: number): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(STORAGE_KEY, String(pageSize))
  } catch {
    // Storage unavailable; the choice stays in the URL only.
  }
}
