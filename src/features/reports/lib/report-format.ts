// Shared report-detail formatting helpers, used by both the web view and the PDF
// document so their SAST/DAST logic and empty-value fallbacks stay in sync.

const DASH = '—'

// A report is a static-analysis (SAST) report when its scan_type is "sast" or
// "static". Everything else (empty, "dast", web, …) is treated as dynamic.
export function isSastReport(scanType?: string): boolean {
  const value = scanType?.trim().toLowerCase()
  return value === 'sast' || value === 'static'
}

// Joins a list into a comma-separated string, or the em-dash when empty.
export function joinOrDash(items?: string[] | null): string {
  if (!items || items.length === 0) {
    return DASH
  }
  const joined = items.filter((item) => item.trim().length > 0).join(', ')
  return joined.length > 0 ? joined : DASH
}

// Renders a number, or the em-dash when it is 0/undefined.
export function numberOrDash(value?: number): string {
  return value && value > 0 ? String(value) : DASH
}
